import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export interface NearbyBus {
  busId: string;
  plate: string;
  driverName: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  distanceMeters: number;
  etaSeconds: number;
  status: string;
  delayInSeconds: number;
  speed: number;
  passengers: number;
  capacity: number;
  location: [number, number];
  nextStopId: string;
  nextStopName: string;
}

export interface NearbyStop {
  stopId: string;
  stopName: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  location: [number, number];
  distanceMeters: number;
  walkTimeSeconds: number;
}

export interface NearbyResult {
  userLat: number;
  userLng: number;
  nearbyBuses: NearbyBus[];
  nearbyStops: NearbyStop[];
}

export interface UserGpsState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  timestamp: number | null;
  isTracking: boolean;
  error: string | null;
  address?: string | null;
  locationApiKey?: string;
  rawTelemetry?: Record<string, unknown> | null;
}

// Generate or retrieve a stable session ID for this browser tab
function getOrCreateSessionId(): string {
  let sid = sessionStorage.getItem('bus-tracking-session');
  if (!sid) {
    sid = 'user-' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('bus-tracking-session', sid);
  }
  return sid;
}

export function useUserLocation(backendConnected: boolean) {
  const defaultApiKey = localStorage.getItem('user_map_api_key') || import.meta.env.VITE_LOCATION_API_KEY || 'c2d1ebec4d3af3';
  const [gpsState, setGpsState] = useState<UserGpsState>({
    lat: null,
    lng: null,
    accuracy: null,
    heading: null,
    speed: null,
    altitude: null,
    timestamp: null,
    isTracking: false,
    error: null,
    address: null,
    locationApiKey: defaultApiKey,
    rawTelemetry: null,
  });
  const [nearbyResult, setNearbyResult] = useState<NearbyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const sessionId = getOrCreateSessionId();

  const sendLocationToBackend = useCallback(async (pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy, heading, speed, altitude } = pos.coords;
    const timestamp = pos.timestamp;
    const activeApiKey = localStorage.getItem('user_map_api_key') || import.meta.env.VITE_LOCATION_API_KEY || 'c2d1ebec4d3af3';

    const rawTelemetry = {
      timestamp: new Date(timestamp).toISOString(),
      timestampEpoch: timestamp,
      latitude,
      longitude,
      accuracyMeters: accuracy,
      headingDegrees: heading,
      speedMetersPerSec: speed,
      speedKmh: speed ? speed * 3.6 : 0,
      altitudeMeters: altitude,
      locationApiKey: activeApiKey,
      userAgent: navigator.userAgent,
    };

    setGpsState(prev => ({
      ...prev,
      lat: latitude,
      lng: longitude,
      accuracy,
      heading,
      speed,
      altitude,
      timestamp,
      isTracking: true,
      error: null,
      locationApiKey: activeApiKey,
      rawTelemetry,
    }));

    // Async reverse geocode using Location API key with fallback to OpenStreetMap
    try {
      // 1. Try PositionStack API using access key
      const posRes = await fetch(`http://api.positionstack.com/v1/reverse?access_key=${activeApiKey}&query=${latitude},${longitude}`);
      if (posRes.ok) {
        const posData = await posRes.json();
        if (posData.data && posData.data.length > 0 && posData.data[0].label) {
          setGpsState(prev => ({ ...prev, address: posData.data[0].label }));
          return;
        }
      }
    } catch {
      // positionstack error, fallback below
    }

    try {
      // 2. OpenStreetMap reverse geocode fallback
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.display_name) {
          setGpsState(prev => ({ ...prev, address: geoData.display_name }));
        }
      }
    } catch {
      // Ignore geocode errors if offline
    }


    if (!backendConnected) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/location/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          latitude,
          longitude,
          accuracy: accuracy ?? 0,
          heading: heading ?? 0,
          speed: speed ?? 0,
        }),
      });
      if (res.ok) {
        const data: NearbyResult = await res.json();
        setNearbyResult(data);
      }
    } catch {
      // silently fallback — location still displayed on map
    } finally {
      setIsLoading(false);
    }
  }, [backendConnected, sessionId]);

  const fallbackIpLocation = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const dummyPos = {
            coords: {
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: 500,
              heading: 0,
              speed: 0,
              altitude: null,
              altitudeAccuracy: null
            },
            timestamp: Date.now()
          } as GeolocationPosition;
          sendLocationToBackend(dummyPos);
        }
      }
    } catch {
      // silent fallback
    }
  }, [sendLocationToBackend]);

  const startTracking = useCallback(() => {
    setGpsState(prev => ({ ...prev, isTracking: true, error: null }));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        sendLocationToBackend,
        () => {
          fallbackIpLocation();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      const id = navigator.geolocation.watchPosition(
        sendLocationToBackend,
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
      watchIdRef.current = id;
    } else {
      fallbackIpLocation();
    }
  }, [sendLocationToBackend, fallbackIpLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsState(prev => ({ ...prev, isTracking: false }));
    setNearbyResult(null);
  }, []);

  // Auto-start tracking on mount to immediately obtain user's real location
  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startTracking]);

  return { gpsState, nearbyResult, isLoading, startTracking, stopTracking };
}

