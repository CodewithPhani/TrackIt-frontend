import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SimulationState, Bus, BusStop } from '../../types';
import { createBusIcon, createStopIcon } from './MapIcons';

interface LiveMapProps {
  simulationState: SimulationState;
  selectedBusId: string | null;
  onBusSelect: (busId: string) => void;
  userLat?: number | null;
  userLng?: number | null;
  userHeading?: number | null;
}

// Sub-component to handle map centering/focus dynamically
const MapController = ({ selectedBus, selectedBusId, userLat, userLng }: {
  selectedBus?: Bus;
  selectedBusId: string | null;
  userLat?: number | null;
  userLng?: number | null;
}) => {
  const map = useMap();

  // Only recenter when the user changes selection. Bus GPS updates arrive frequently;
  // following the changing Bus object here caused the map to fight manual zoom/pan.
  useEffect(() => {
    if (selectedBus) {
      map.panTo(selectedBus.location, { animate: false });
    }
  // Intentionally keyed to selection identity, not the moving bus object.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusId, map]);

  // When user location first acquired, pan to their location
  const [hasCenteredOnUser, setHasCenteredOnUser] = React.useState(false);
  useEffect(() => {
    if (!selectedBusId && !hasCenteredOnUser && userLat != null && userLng != null) {
      map.setView([userLat, userLng], 15, { animate: false });
      setHasCenteredOnUser(true);
    }
  }, [userLat, userLng, selectedBusId, hasCenteredOnUser, map]);

  return null;
};

// Create a custom pulsing user location icon
function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(99,102,241,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(99,102,241,0.4);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;animation-delay:0.2s;"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:#6366f1;border:2px solid white;box-shadow:0 0 0 3px rgba(99,102,241,0.4);z-index:2;"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export const LiveMap: React.FC<LiveMapProps> = ({
  simulationState,
  selectedBusId,
  onBusSelect,
  userLat,
  userLng,
}) => {
  const { routes, buses } = simulationState;
  const selectedBus = buses.find(b => b.id === selectedBusId);

  const centerLat = userLat ?? (buses.length > 0 ? buses[0].location[0] : 17.4193102);
  const centerLng = userLng ?? (buses.length > 0 ? buses[0].location[1] : 78.6565403);


  const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  const attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';

  const userLocationIcon = React.useMemo(() => createUserLocationIcon(), []);
  const stopIcon = React.useMemo(() => createStopIcon(), []);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden glass-panel border border-white/5 relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={14} 
        className="w-full h-full bg-[#0f172a]"
        zoomControl={false}
      >
        <TileLayer url={tileUrl} attribution={attribution} />
        
        <MapController selectedBus={selectedBus} selectedBusId={selectedBusId} userLat={userLat} userLng={userLng} />

        {/* Draw Routes & Stops */}
        {routes.map(route => (
          <React.Fragment key={route.id}>
            <Polyline 
              positions={route.path} 
              color={route.color} 
              weight={4} 
              opacity={0.6}
              dashArray={route.type === 'Express' ? '10, 10' : undefined}
            />
            {route.stops.map((stop: BusStop) => (
              <Marker 
                key={stop.id} 
                position={stop.location}
                icon={stopIcon}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="bg-surface text-text border-white/10">
                  <div className="font-semibold">{stop.name}</div>
                  <div className="text-xs text-text-muted">{route.name}</div>
                </Tooltip>
              </Marker>
            ))}
          </React.Fragment>
        ))}

        {/* Draw Buses */}
        {buses.map(bus => {
          const route = routes.find(r => r.id === bus.routeId);
          const routeColor = route ? route.color : '#3b82f6';
          
          return (
            <Marker
              key={bus.id}
              position={bus.location}
              icon={createBusIcon(routeColor, bus.heading, bus.delayInSeconds, bus.plate)}
              eventHandlers={{
                click: () => onBusSelect(bus.id)
              }}
            >
              <Popup className="bus-popup">
                <div className="p-1">
                  <div className="font-bold text-lg border-b border-gray-200 pb-1 mb-2">{bus.plate}</div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: routeColor }}></span>
                    <span className="text-sm font-semibold">{route?.name}</span>
                  </div>
                  <div className="text-sm text-gray-700 flex justify-between">
                     <span>Speed:</span> 
                     <span className="font-mono">{bus.speed} km/h</span>
                  </div>
                  <div className="text-sm flex justify-between">
                     <span className="text-gray-700">Status:</span>
                     {bus.status === 'delayed' ? (
                       <span className="text-red-600 font-semibold text-xs py-0.5 px-1 bg-red-100 rounded">+ {Math.ceil(bus.delayInSeconds / 60)} min delay</span>
                     ) : (
                       <span className="text-green-600 font-semibold text-xs py-0.5 px-1 bg-green-100 rounded">On Time</span>
                     )}
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-500">
                     Passengers: {bus.passengers}/{bus.capacity}
                  </div>
                  <div className="mt-1 text-xs text-center font-semibold" style={{ color: bus.locationSource === 'gps' ? '#059669' : '#64748b' }}>
                     {bus.locationSource === 'gps' ? 'LIVE GPS LOCATION' : 'SIMULATED LOCATION'}
                  </div>
                  {bus.lastLocationUpdate && (
                    <div className="mt-1 text-[10px] text-center text-gray-500">
                      Last GPS update: {new Date(bus.lastLocationUpdate).toLocaleTimeString()} {(bus.gpsAccuracy ?? 0) > 0 ? `· ±${Math.round(bus.gpsAccuracy ?? 0)} m` : ''}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User GPS Location Marker */}
        {userLat != null && userLng != null && (
          <>
            <Marker
              position={[userLat, userLng]}
              icon={userLocationIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="p-1 text-center">
                  <div className="font-bold mb-1">📍 Your Location</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {userLat.toFixed(5)}, {userLng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
            {/* Accuracy radius circle */}
            <Circle
              center={[userLat, userLng]}
              radius={50}
              pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.08, weight: 1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
