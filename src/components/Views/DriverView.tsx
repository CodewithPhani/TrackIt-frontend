import React, { useEffect, useRef, useState } from 'react';
import { SimulationState } from '../../types';
import { Gauge, Users, ShieldAlert, MapPin, Radio, RadioTower } from 'lucide-react';
import { apiService } from '../../services/api';

interface DriverViewProps {
  state: SimulationState;
  triggerIncident: (id: string, delay: number) => void;
  token: string;
  assignedBusId: string;
}

export const DriverView: React.FC<DriverViewProps> = ({ state, triggerIncident, token, assignedBusId }) => {
  const driverBus = state.buses.find(bus => bus.id.toUpperCase() === assignedBusId.toUpperCase()) || state.buses[0];
  const route = state.routes.find(r => r.id === driverBus?.routeId);
  
  const [panicActive, setPanicActive] = useState(false);
  const [sharingGps, setSharingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('GPS sharing is off');
  const watchIdRef = useRef<number | null>(null);

  const stopGpsSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharingGps(false);
    setGpsMessage('GPS sharing stopped. Last reported location remains on the map.');
  };

  const startGpsSharing = () => {
    if (!navigator.geolocation) {
      setGpsMessage('This browser does not support GPS location.');
      return;
    }
    if (!window.isSecureContext) {
      setGpsMessage('GPS requires HTTPS or localhost. Open the app securely on the driver device.');
      return;
    }
    if (watchIdRef.current !== null) return;
    setGpsMessage('Waiting for GPS signal…');
    const watchId = navigator.geolocation.watchPosition(async position => {
      try {
        await apiService.updateBusLocation(driverBus.id, {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? 0,
          heading: position.coords.heading ?? 0,
          speed: position.coords.speed ?? 0,
        }, token);
        setSharingGps(true);
        setGpsMessage(`GPS updated at ${new Date(position.timestamp).toLocaleTimeString()}`);
      } catch {
        setGpsMessage('GPS was detected, but the backend update failed. Check that the backend is running.');
      }
    }, error => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setGpsMessage(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Allow location access to share bus GPS.' : 'Unable to get GPS signal. Check device location settings.');
      setSharingGps(false);
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
    watchIdRef.current = watchId;
    setSharingGps(true);
  };

  useEffect(() => () => {
    if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  if (!driverBus || !route) return <div>No bus assigned</div>;

  const handleIncident = () => {
     triggerIncident(driverBus.id, 600); // Trigger a 10 min delay
     setPanicActive(true);
     setTimeout(() => setPanicActive(false), 3000);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
       {/* Driver Header */}
       <div className="glass-panel p-5 rounded-xl border border-primary/20 flex justify-between items-center bg-gradient-to-r from-surface to-surface/50">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
               Welcome, {driverBus.driverName}
            </h2>
            <p className="text-primary font-mono text-sm mt-1">{driverBus.plate} • {route.name}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-primary/50 overflow-hidden bg-surface flex items-center justify-center">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=3b82f6" alt="Driver" />
          </div>
       </div>
       
       <div className="glass-panel rounded-xl border border-primary/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
             <RadioTower className={`h-5 w-5 ${sharingGps ? 'text-accent' : 'text-text-muted'}`} />
             <div className="flex-1">
                <p className="font-semibold">Live GPS sharing</p>
                <p className="text-xs text-text-muted">Shares this device's location for bus {driverBus.id}</p>
             </div>
             <span className={`text-xs rounded-full px-2 py-1 ${sharingGps ? 'bg-accent/15 text-accent' : 'bg-white/5 text-text-muted'}`}>{sharingGps ? 'TRACKING' : 'OFF'}</span>
          </div>
          <p className="text-xs text-text-muted" role="status">{gpsMessage}</p>
          <button onClick={sharingGps ? stopGpsSharing : startGpsSharing} className={`w-full rounded-lg py-3 flex items-center justify-center gap-2 font-semibold ${sharingGps ? 'border border-danger/30 text-danger hover:bg-danger/10' : 'bg-primary text-white hover:opacity-90'}`}>
             {sharingGps ? <Radio className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
             {sharingGps ? 'Stop GPS sharing' : 'Start live GPS sharing'}
          </button>
          <p className="text-[11px] text-text-muted">Demo mode assigns the first listed bus to this driver view. Use a phone mounted safely in the bus; never operate this while driving.</p>
       </div>

       <div className="grid grid-cols-2 gap-4">
           {/* Speedometer */}
           <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/5"></div>
               <Gauge className={`w-8 h-8 mb-2 ${driverBus.speed > 60 ? 'text-danger' : 'text-primary'}`} />
               <div className="flex items-baseline gap-1 relative z-10">
                  <span className="text-4xl font-bold tracking-tighter">{driverBus.speed}</span>
                  <span className="text-sm text-text-muted font-mono">km/h</span>
               </div>
               <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Current Speed</p>
           </div>
           
           {/* Passengers */}
           <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-accent/5"></div>
               <Users className="w-8 h-8 mb-2 text-accent" />
               <div className="flex items-baseline gap-1 relative z-10">
                  <span className="text-4xl font-bold tracking-tighter">{driverBus.passengers}</span>
                  <span className="text-sm text-text-muted font-mono">/ {driverBus.capacity}</span>
               </div>
               <p className="text-xs text-text-muted mt-1 uppercase tracking-widest">Boarded</p>
           </div>
       </div>

       {/* Next Stop Timeline */}
       <div className="glass-panel p-5 rounded-xl flex-1 border border-white/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
             <Navigation2Icon className="w-5 h-5 text-primary"/>
             Route Progress
          </h3>
          <div className="relative pl-6 space-y-6">
             {/* Timeline line */}
             <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-border"></div>
             
             {route.stops.map(stop => {
                const isNext = stop.id === driverBus.nextStopId;
                const passed = parseInt(stop.id.replace('S','')) < parseInt(driverBus.nextStopId.replace('S',''));
                
                return (
                   <div key={stop.id} className="relative z-10">
                       <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 top-1.5 
                          ${passed ? 'bg-primary border-primary' : isNext ? 'bg-background border-primary animate-pulse' : 'bg-background border-border'}`}>
                       </div>
                       <div>
                          <p className={`font-semibold ${isNext ? 'text-primary text-lg' : passed ? 'text-white' : 'text-text-muted'}`}>{stop.name}</p>
                          {isNext && (
                             <p className="text-xs text-text-muted mt-1 bg-surface/50 inline-block px-2 py-0.5 rounded">Arriving Shortly</p>
                          )}
                       </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* Action Grid */}
       <div className="grid gap-3">
          <button 
            onClick={handleIncident}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all ${panicActive ? 'bg-danger text-white scale-[0.98]' : 'glass-panel text-danger hover:bg-danger/20 border border-danger/30'}`}
          >
             <ShieldAlert className="w-6 h-6" />
             Report 10m Delay / Incident
          </button>
       </div>
    </div>
  );
};

const Navigation2Icon = ({...props}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
)
