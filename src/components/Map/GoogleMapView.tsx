import React, { useEffect, useRef, useState } from 'react';
import type { SimulationState } from '../../types';

declare global { interface Window { google?: any; __googleMapsLoading?: Promise<void>; } }

interface Props { state: SimulationState; selectedBusId: string | null; onBusSelect: (id: string) => void; userLat?: number | null; userLng?: number | null; }

function loadGoogleMaps(key: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__googleMapsLoading) return window.__googleMapsLoading;
  window.__googleMapsLoading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-maps="true"]');
    if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true }); return; }
    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    script.async = true; script.defer = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('Google Maps failed to load. Check VITE_GOOGLE_MAPS_API_KEY and enable Maps JavaScript API.'));
    document.head.appendChild(script);
  });
  return window.__googleMapsLoading;
}

export const GoogleMapView: React.FC<Props> = ({ state, selectedBusId, onBusSelect, userLat, userLng }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<any[]>([]);
  const busMarkersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const [error, setError] = useState('');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    let cancelled = false;
    if (!apiKey) { setError('Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env to enable Google Maps.'); return; }
    loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !hostRef.current || mapRef.current) return;
      const firstBus = state.buses[0];
      mapRef.current = new window.google.maps.Map(hostRef.current, {
        center: { lat: userLat ?? firstBus?.location[0] ?? 17.41931, lng: userLng ?? firstBus?.location[1] ?? 78.65654 },
        zoom: 13, mapTypeId: 'roadmap', gestureHandling: 'greedy', clickableIcons: false,
        fullscreenControl: true, streetViewControl: false, mapTypeControl: true,
        zoomControl: true, rotateControl: false, keyboardShortcuts: true,
      });
    }).catch((e: Error) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  // Map instance is intentionally initialized once; live updates are handled below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current; const google = window.google;
    if (!map || !google?.maps) return;
    overlaysRef.current.forEach(item => item.setMap(null)); overlaysRef.current = [];
    state.routes.forEach(route => {
      if (route.path.length > 1) overlaysRef.current.push(new google.maps.Polyline({ map, path: route.path.map(([lat, lng]) => ({ lat, lng })), strokeColor: route.color, strokeOpacity: 0.8, strokeWeight: 4 }));
      route.stops.forEach(stop => overlaysRef.current.push(new google.maps.Marker({ map, position: { lat: stop.location[0], lng: stop.location[1] }, title: stop.name, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 4, fillColor: route.color, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 1 } })));
    });
  }, [state.routes]);

  // Update existing bus markers in place instead of destroying/recreating every marker on each GPS tick.
  useEffect(() => {
    const map = mapRef.current; const google = window.google;
    if (!map || !google?.maps) return;
    const activeIds = new Set(state.buses.map(bus => bus.id));
    busMarkersRef.current.forEach((marker, id) => { if (!activeIds.has(id)) { marker.setMap(null); busMarkersRef.current.delete(id); } });
    state.buses.forEach(bus => {
      const route = state.routes.find(r => r.id === bus.routeId);
      let marker = busMarkersRef.current.get(bus.id);
      if (!marker) {
        marker = new google.maps.Marker({ map, title: `${bus.id} · ${bus.plate}`, label: { text: bus.id, color: '#ffffff', fontWeight: '700', fontSize: '11px' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: route?.color ?? '#2563eb', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 } });
        marker.addListener('click', () => onBusSelect(bus.id)); busMarkersRef.current.set(bus.id, marker);
      }
      marker.setPosition({ lat: bus.location[0], lng: bus.location[1] });
      marker.setIcon({ path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: route?.color ?? '#2563eb', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 });
    });
  }, [state.buses, state.routes, onBusSelect]);

  useEffect(() => {
    const map = mapRef.current; const google = window.google;
    if (!map || !google?.maps || userLat == null || userLng == null) return;
    if (!userMarkerRef.current) userMarkerRef.current = new google.maps.Marker({ map, title: 'Your location', icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#4f46e5', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 } });
    userMarkerRef.current.setPosition({ lat: userLat, lng: userLng });
  }, [userLat, userLng]);

  useEffect(() => {
    if (!mapRef.current || !selectedBusId) return;
    const bus = state.buses.find(item => item.id === selectedBusId);
    if (bus) mapRef.current.panTo({ lat: bus.location[0], lng: bus.location[1] });
  // Only pan on selection changes, never on every GPS tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusId]);

  return <div className="w-full h-full rounded-2xl overflow-hidden glass-panel border border-white/5 relative z-0"><div ref={hostRef} className="w-full h-full bg-slate-100" />{error && <div className="absolute inset-0 flex items-center justify-center p-8 bg-slate-900/90 text-white text-center"><div className="max-w-md"><p className="font-semibold mb-2">Google Maps setup required</p><p className="text-sm text-slate-300">{error}</p><p className="text-xs text-slate-400 mt-3">The dashboard needs a valid Google Maps JavaScript API key with billing enabled.</p></div></div>}</div>;
};
