import { useState, useEffect, useCallback } from 'react';
import { Bus, SimulationState } from '../types';
import { MOCK_ROUTES, MOCK_BUSES } from '../data/mockData';
import { apiService } from './api';

// Utility to calculate distance between two lat/lng points in KM
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

// Ask the public OSRM demo router for real drivable-road geometry through every stop.
// OSRM expects longitude,latitude while Leaflet uses latitude,longitude.
async function getRoadRoute(stops: [number, number][]): Promise<[number, number][]> {
  if (stops.length < 2) return stops;
  const coordinates = stops.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Road routing failed (${response.status})`);
  const data = await response.json();
  const coords = data?.routes?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) throw new Error('No drivable road route was returned');
  return coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number]);
}

function bearing(from: [number, number], to: [number, number]) {
  const lat1 = from[0] * Math.PI / 180, lat2 = to[0] * Math.PI / 180;
  const dLon = (to[1] - from[1]) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Move along the ordered road polyline. Never wrap from the final point back to the start.
function advanceAlongRoad(location: [number, number], path: [number, number][], distanceKm: number) {
  if (path.length < 2 || distanceKm <= 0) return { location, heading: 0 };
  let nearestIndex = 0, nearestDistance = Infinity;
  for (let i = 0; i < path.length; i++) {
    const d = getDistanceFromLatLonInKm(location[0], location[1], path[i][0], path[i][1]);
    if (d < nearestDistance) { nearestDistance = d; nearestIndex = i; }
  }
  let current: [number, number] = [...path[nearestIndex]];
  let heading = bearing(current, path[Math.min(nearestIndex + 1, path.length - 1)]);
  let remaining = distanceKm;
  for (let i = nearestIndex + 1; i < path.length; i++) {
    const target = path[i];
    const segmentKm = getDistanceFromLatLonInKm(current[0], current[1], target[0], target[1]);
    heading = bearing(current, target);
    if (segmentKm >= remaining && segmentKm > 0) {
      const ratio = remaining / segmentKm;
      return { location: [current[0] + (target[0] - current[0]) * ratio, current[1] + (target[1] - current[1]) * ratio] as [number, number], heading };
    }
    remaining -= segmentKm;
    current = [...target];
  }
  return { location: [...path[path.length - 1]] as [number, number], heading };
}

export function useBusSimulation(authToken?: string) {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    routes: MOCK_ROUTES,
    buses: MOCK_BUSES,
    simulationSpeed: 1, // 1x normal speed. 5x for demo.
    isPlaying: true,
  });
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Replace approximate stop-to-stop lines with real road geometry through each route's stops.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sourceRoutes = simulationState.routes;
      const roadRoutes = await Promise.all(sourceRoutes.map(async route => {
        try {
          const roadPath = await getRoadRoute(route.stops.map(stop => stop.location));
          return { ...route, path: roadPath };
        } catch (error) {
          console.error(`Could not load road geometry for ${route.id}; retaining last known route.`, error);
          return null;
        }
      }));
      if (cancelled) return;
      const validRoutes = roadRoutes.filter((route): route is NonNullable<typeof route> => route !== null);
      if (validRoutes.length) {
        setSimulationState(prev => ({ ...prev, routes: prev.routes.map(old => validRoutes.find(r => r.id === old.id) ?? old) }));
      }
    })();
    return () => { cancelled = true; };
  }, [isBackendConnected]);

  // Sync initial routes & buses from Spring Boot Backend if available
  useEffect(() => {
    async function syncBackendData() {
      try {
        const [routes, buses] = await Promise.all([apiService.getRoutes(), apiService.getBuses()]);
        if (routes && routes.length > 0 && buses && buses.length > 0) {
          setSimulationState(prev => {
            // Keep newly configured demo routes/buses available even when the backend
            // has only a partial fleet seeded. Backend records take precedence by ID.
            const mergedRoutes = [...routes];
            for (const fallbackRoute of MOCK_ROUTES) {
              if (!mergedRoutes.some(route => route.id === fallbackRoute.id)) mergedRoutes.push(fallbackRoute);
            }
            const mergedBuses = buses.map(bus => ({
  ...bus,
  locationSource: bus.locationSource ?? 'simulation'
}));
for (const fallbackBus of MOCK_BUSES) {
  if (!mergedBuses.some(bus => bus.id === fallbackBus.id)) {
    mergedBuses.push({
      ...fallbackBus,
      locationSource: fallbackBus.locationSource ?? 'simulation',
    });
  }
}
            return { ...prev, routes: mergedRoutes, buses: mergedBuses };
          });
          setIsBackendConnected(true);
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    }
    syncBackendData();
  }, []);


  useEffect(() => {
    if (!isBackendConnected) return;
    let cancelled = false;
    const refreshLocations = async () => {
      try {
        const buses = await apiService.getBuses();
        if (cancelled || !buses?.length) return;
        setSimulationState(prev => ({
          ...prev,
          buses: prev.buses.map(current => {
            const latest = buses.find(item => item.id === current.id);
            if (!latest) return current;
            return { ...current, ...latest, locationSource: latest.locationSource ?? 'simulation' };
          })
        }));
      } catch {
        // Keep the last known positions if the backend is temporarily unavailable.
      }
    };
    const timer = window.setInterval(refreshLocations, 3000);
    refreshLocations();
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [isBackendConnected]);

  const updateSimulationSpeed = async (speed: number) => {
    setSimulationState(prev => ({ ...prev, simulationSpeed: speed }));
    if (isBackendConnected) {
      try { await apiService.setSimulationSpeed(speed, authToken); } catch (e) {}
    }
  };

  const toggleSimulation = async () => {
    setSimulationState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    if (isBackendConnected) {
      try { await apiService.toggleSimulation(authToken); } catch (e) {}
    }
  };
  
  const triggerIncident = async (busId: string, delaySecs: number) => {
    setSimulationState(prev => ({
      ...prev,
      buses: prev.buses.map(b => b.id === busId ? { ...b, status: 'delayed', delayInSeconds: delaySecs, speed: 0 } : b)
    }));
    if (isBackendConnected) {
      try { await apiService.reportIncident(busId, delaySecs, 'emergency', 'Incident reported', authToken); } catch (e) {}
    }
  };

  // The main simulation loop updater
  const performTick = useCallback(() => {
    setSimulationState(prevState => {
      // When connected, the backend owns simulated movement and GPS updates.
      if (isBackendConnected || !prevState.isPlaying) return prevState;

      const deltaHours = ((2 * prevState.simulationSpeed) / 3600); // 2 second tick normalized to hours

      const updatedBuses = prevState.buses.map(bus => {
        if (bus.locationSource === 'gps') return bus;
        if (bus.status === 'stopped' || bus.delayInSeconds > 0) {
           // Wait out delays
           const newDelay = Math.max(0, bus.delayInSeconds - (2 * prevState.simulationSpeed));
           return { 
              ...bus, 
              delayInSeconds: newDelay, 
              status: (newDelay === 0 ? 'on_time' : 'delayed') as Bus['status'],
              speed: newDelay > 0 ? 0 : Math.floor(Math.random() * 30 + 20)
           };
        }

        const route = prevState.routes.find(r => r.id === bus.routeId);
        if (!route) return bus;

        // Advance only along the OSRM road polyline, never in a straight line to the next stop.
        const moved = advanceAlongRoad(bus.location, route.path, bus.speed * deltaHours);
        const newLat = moved.location[0];
        const newLng = moved.location[1];
        const heading = moved.heading;
        
        // Simulate minor speed fluctuations
        let newSpeed = bus.speed + (Math.random() > 0.5 ? 2 : -2);
        newSpeed = Math.max(15, Math.min(newSpeed, 80)); // clamp speed

        // Simulate passengers getting on/off randomly occasionally
        let newPassengers = bus.passengers;
        if (Math.random() > 0.95 && getDistanceFromLatLonInKm(newLat, newLng, route.path[Math.min(1, route.path.length - 1)][0], route.path[Math.min(1, route.path.length - 1)][1]) < 0.01) { // Assume near a stop
          const change = Math.floor(Math.random() * 10) - 4; // -4 to +5
          newPassengers = Math.max(0, Math.min(bus.capacity, newPassengers + change));
        }

        return {
          ...bus,
          location: [newLat, newLng],
          heading: heading,
          speed: Math.round(newSpeed),
          passengers: newPassengers
        } as Bus;
      });

      return {
        ...prevState,
        buses: updatedBuses
      };
    });
  }, [isBackendConnected]);

  useEffect(() => {
    // Tick every 2000 milliseconds for smoother UI but tangible updates
    const intervalId = setInterval(performTick, 2000);
    return () => clearInterval(intervalId);
  }, [performTick]);

  return {
    state: simulationState,
    updateSimulationSpeed,
    toggleSimulation,
    triggerIncident,
    isBackendConnected
  };
}
