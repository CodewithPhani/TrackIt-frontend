import { useState } from 'react';
import { AuthPage, type UserRole } from './components/AuthPage';
import type { AuthResult } from './services/api';
import { useBusSimulation } from './services/useBusSimulation';
import { useUserLocation } from './services/useUserLocation';
import { LiveMap } from './components/Map/LiveMap';
import { GoogleMapView } from './components/Map/GoogleMapView';
import { RiderView } from './components/Views/RiderView';
import { DriverView } from './components/Views/DriverView';
import { AdminView } from './components/Views/AdminView';
import { NearbyPanel } from './components/Views/NearbyPanel';
import { AppWindow, UserRound, Bus, ShieldCheck, Play, Pause, FastForward, Navigation, LogOut } from 'lucide-react';

type Perspective = 'rider' | 'driver' | 'admin' | 'nearby';

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [assignedBusId, setAssignedBusId] = useState<string | null>(null);
  const [perspective, setPerspective] = useState<Perspective>('rider');
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const { gpsState, nearbyResult, isLoading, startTracking, stopTracking } = useUserLocation(true);
const { state, updateSimulationSpeed, toggleSimulation, triggerIncident } = useBusSimulation(authToken || undefined);
  if (!authenticatedUser || !userRole) {
    return <AuthPage onAuthenticated={(auth: AuthResult) => { setAuthenticatedUser(auth.name); setUserRole(auth.role); setAuthToken(auth.token); setAssignedBusId(auth.assignedBusId || null); setSelectedBusId(auth.assignedBusId || null); setPerspective(auth.role === 'student' ? 'rider' : auth.role); }} />;
  }

  // The dashboard is selected from the authenticated role, never from a user-controlled tab.
  const allowedPerspectives: Perspective[] = userRole === 'student' ? ['rider', 'nearby'] : userRole === 'driver' ? ['driver'] : ['admin'];
  const activePerspective = allowedPerspectives.includes(perspective) ? perspective : allowedPerspectives[0];

  // Students see only the bus assigned during signup; drivers see only their assigned bus.
  // Admins retain the complete fleet. An unassigned account sees no buses until assigned.
  const visibleState = userRole === 'admin'
    ? state
    : { ...state, buses: state.buses.filter(bus => !!assignedBusId && bus.id === assignedBusId) };
  const visibleSelectedBusId = userRole === 'admin' ? selectedBusId : (assignedBusId || null);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-text font-sans">
      
      {/* Sidebar Panel */}
      <div className="w-[420px] h-full flex flex-col border-r border-border bg-[#0f172a] z-10 shadow-2xl relative">
          
          {/* Header & Perspective Switcher */}
          <div className="p-4 border-b border-border">
             <div className="flex items-center gap-2 mb-4 text-primary">
                <AppWindow className="w-6 h-6" />
                <div><h1 className="text-xl font-bold tracking-tight text-white">SkyLine Transit</h1><p className="text-[10px] uppercase tracking-wider text-slate-400">{userRole} dashboard</p></div>
                <button
                  type="button"
                  title={`Sign out ${authenticatedUser}`}
                  aria-label="Sign out"
                  onClick={() => { setAuthenticatedUser(null); setUserRole(null); setAuthToken(null); setAssignedBusId(null); setPerspective('rider'); }}
                  className="ml-auto flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
             </div>
             
             <div className={`grid ${userRole === 'student' ? 'grid-cols-2' : 'grid-cols-1'} bg-surface p-1 rounded-xl border border-white/5 gap-1`}>
                {userRole === 'student' && <><button 
onClick={() => { setPerspective('rider'); setSelectedBusId(null); }}                  
className={`flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all gap-0.5 ${perspective === 'rider' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                   <UserRound className="w-4 h-4"/> Rider
                </button>
                </>}
                {userRole === 'driver' && <button 
                  onClick={() => { setPerspective('driver'); if (assignedBusId) setSelectedBusId(assignedBusId); }}
                  className={`flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all gap-0.5 ${perspective === 'driver' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                   <Bus className="w-4 h-4"/> Driver
                </button>}
                {userRole === 'admin' && <button 
                  onClick={() => { setPerspective('admin'); }}
                  className={`flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all gap-0.5 ${perspective === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                   <ShieldCheck className="w-4 h-4"/> Admin
                </button>}
                {userRole === 'student' && <button 
                  onClick={() => setPerspective('nearby')}
                  className={`flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-all gap-0.5 relative ${perspective === 'nearby' ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
                >
                   <Navigation className="w-4 h-4"/> Nearby
                   {gpsState.isTracking && (
                     <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
                   )}
                </button>}
             </div>
          </div>

          {/* Dynamic Content Panel */}
          <div className="flex-1 overflow-hidden p-4">
             {activePerspective === 'rider' && <RiderView state={visibleState} selectedBusId={visibleSelectedBusId} onBusSelect={() => {}} />}
             {activePerspective === 'driver' && <DriverView state={visibleState} triggerIncident={triggerIncident} token={authToken || ''} assignedBusId={assignedBusId || ''} />}
             {activePerspective === 'admin' && <AdminView state={visibleState} selectedBusId={selectedBusId} onBusSelect={setSelectedBusId} />}
             {activePerspective === 'nearby' && (
               <NearbyPanel
                 gpsState={gpsState}
                 nearbyResult={nearbyResult}
                 isLoading={isLoading}
                 onStartTracking={startTracking}
                 onStopTracking={stopTracking}
               />
             )}
          </div>

          {/* Simulation Controls (Footer of Sidebar) */}
          {userRole === 'admin' && <div className="p-4 border-t border-border bg-surface/50">
              <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-mono uppercase tracking-widest">
                 <span>Simulation Engine</span>
                 <span className="text-accent">{state.isPlaying ? 'Live' : 'Paused'}</span>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={toggleSimulation}
                   className="flex-1 py-2 glass-panel rounded-lg flex justify-center hover:bg-white/5 transition-colors"
                 >
                    {state.isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/> }
                 </button>
                 <button 
                   onClick={() => updateSimulationSpeed(1)}
                   className={`flex-1 py-2 glass-panel rounded-lg flex justify-center hover:bg-white/5 transition-colors ${state.simulationSpeed === 1 ? 'border-primary text-primary' : ''}`}
                 >
                    <span className="font-bold text-sm">1x</span>
                 </button>
                 <button 
                   onClick={() => updateSimulationSpeed(5)}
                   className={`flex-1 py-2 glass-panel rounded-lg flex justify-center hover:bg-white/5 transition-colors ${state.simulationSpeed === 5 ? 'border-primary text-primary' : ''}`}
                 >
                    <span className="font-bold text-sm flex items-center"><FastForward className="w-4 h-4 mr-1"/> 5x</span>
                 </button>
              </div>
          </div>}
      </div>

      {/* Main Map Viewer */}
      <div className="flex-1 h-full p-4 pl-0">
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
            <GoogleMapView state={visibleState} selectedBusId={visibleSelectedBusId} onBusSelect={setSelectedBusId} userLat={gpsState.lat} userLng={gpsState.lng} />
          ) : (
            <LiveMap simulationState={visibleState} selectedBusId={visibleSelectedBusId} onBusSelect={setSelectedBusId} userLat={gpsState.lat} userLng={gpsState.lng} userHeading={gpsState.heading} />
          )}
      </div>
      
    </div>
  );
}

export default App;
