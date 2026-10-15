import React, { useState } from 'react';
import { SimulationState } from '../../types';
import { Bus as BusIcon, Search, Navigation, QrCode, Clock, Star } from 'lucide-react';

interface RiderViewProps {
  state: SimulationState;
  selectedBusId: string | null;
  onBusSelect: (id: string) => void;
}

export const RiderView: React.FC<RiderViewProps> = ({ state, selectedBusId }) => {  const [showTicket, setShowTicket] = useState(false);

  const selectedBus = state.buses.find(b => b.id === selectedBusId);
  const route = selectedBus ? state.routes.find(r => r.id === selectedBus.routeId) : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Explore */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5"/>
            <input 
              type="text" 
              placeholder="Search destination, route, or stop..."
              className="w-full bg-surface/50 border border-border rounded-lg py-2 pl-10 pr-4 text-text placeholder-text-muted outline-none focus:border-primary transition-colors"
            />
         </div>
         <button className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            <Navigation className="w-5 h-5" />
         </button>
      </div>
      
      {/* Dynamic Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          
          {/* Active Selection / ETA Card */}
          {selectedBus && route ? (
             <div className="glass-panel p-5 rounded-xl border border-primary/30 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <BusIcon className="w-24 h-24" />
                 </div>
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold">{route.name}</h3>
                      <p className="text-sm text-text-muted">Bus #{selectedBus.plate}</p>
                    </div>
                    <button className="text-warning hover:text-yellow-300">
                        <Star className="w-6 h-6 fill-current"/>
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                    <div className="bg-surface/50 p-3 rounded-lg border border-border">
                       <p className="text-xs text-text-muted mb-1">Next Stop</p>
                       <p className="font-semibold truncate">
                          {route.stops.find(s => s.id === selectedBus.nextStopId)?.name || 'Unknown'}
                       </p>
                    </div>
                    <div className="bg-surface/50 p-3 rounded-lg border border-border">
                       <p className="text-xs text-text-muted mb-1">Status</p>
                       {selectedBus.status === 'delayed' ? (
                         <div className="text-danger flex items-center gap-1 font-bold">
                           <Clock className="w-4 h-4"/> 
                           +{Math.ceil(selectedBus.delayInSeconds/60)} Min
                         </div>
                       ) : (
                         <div className="text-accent flex items-center gap-1 font-bold">
                           <Clock className="w-4 h-4"/> On Time
                         </div>
                       )}
                    </div>
                 </div>
             </div>
          ) : (
             <div className="glass-panel p-8 rounded-xl text-center border-dashed border-2 border-border/50 text-text-muted">
                 <BusIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                 <p>{state.buses.length === 0 ? 'No bus is assigned to this student account yet. Ask the transport administrator to assign your bus.' : 'Your assigned bus is loading. Its live location will appear on the map.'}</p>
             </div>
          )}

          {/* Quick Actions */}
          <h4 className="font-semibold text-sm text-text-muted uppercase tracking-wider mt-6 mb-2">Tools</h4>
          <button 
             onClick={() => setShowTicket(!showTicket)}
             className="w-full glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-primary/50 transition-all group"
          >
              <div className="bg-primary/20 p-3 rounded-lg text-primary group-hover:scale-110 transition-transform">
                 <QrCode className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                 <h4 className="font-bold">Digital Bus Pass</h4>
                 <p className="text-sm text-text-muted text-xs">Tap to show your QR Code</p>
              </div>
          </button>
          
          {/* Simulated Ticket View */}
          {showTicket && (
             <div className="glass-panel p-6 rounded-xl border border-accent/30 text-center animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-lg mb-1">Monthly Pass</h3>
                <p className="text-accent text-sm font-semibold mb-4 border border-accent/20 bg-accent/10 py-1 rounded inline-block px-3">ACTIVE</p>
                <div className="bg-white p-4 rounded-xl mx-auto w-48 h-48 flex items-center justify-center mb-4">
                   {/* Fake QR using a grid for aesthetics */}
                   <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full p-2">
                       {Array.from({length: 25}).map((_, i) => (
                          <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'rounded-sm' : ''} ${Math.random() > 0.4 ? 'opacity-100' : 'opacity-0'}`}></div>
                       ))}
                   </div>
                </div>
                <p className="text-xs text-text-muted font-mono">ID: 0x93F2...88A1</p>
             </div>
          )}
      </div>
    </div>
  );
};
