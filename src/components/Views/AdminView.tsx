import React from 'react';
import { SimulationState } from '../../types';
import { Activity, BarChart3, Bus, AlertCircle } from 'lucide-react';

interface AdminViewProps {
  state: SimulationState;
  onBusSelect: (id: string) => void;
  selectedBusId: string | null;
}

export const AdminView: React.FC<AdminViewProps> = ({ state, selectedBusId, onBusSelect }) => {
  const activeBuses = state.buses.length;
  const delayedBuses = state.buses.filter(b => b.delayInSeconds > 0).length;
  const totalPassengers = state.buses.reduce((acc, b) => acc + b.passengers, 0);
  const onTimePercentage = activeBuses === 0 ? 0 : Math.round(((activeBuses - delayedBuses) / activeBuses) * 100);

  return (
    <div className="flex flex-col h-full space-y-4">
       <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <Activity className="text-primary w-6 h-6"/> Fleet Command
          </h2>
       </div>

       {/* KPIs Dashboard */}
       <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-primary/20">
             <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-text-muted">Active Fleet</p>
                <div className="p-1.5 bg-primary/20 text-primary rounded-lg">
                   <Bus className="w-4 h-4"/>
                </div>
             </div>
             <p className="text-3xl font-bold">{activeBuses}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-accent/20">
             <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-text-muted">On-Time %</p>
                <div className="p-1.5 bg-accent/20 text-accent rounded-lg">
                   <Activity className="w-4 h-4"/>
                </div>
             </div>
             <p className="text-3xl font-bold">{onTimePercentage}%</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-warning/20">
             <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-text-muted">Passengers</p>
                <div className="p-1.5 bg-warning/20 text-warning rounded-lg">
                   <BarChart3 className="w-4 h-4"/>
                </div>
             </div>
             <p className="text-3xl font-bold">{totalPassengers}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-danger/20">
             <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-text-muted">Alerts</p>
                <div className="p-1.5 bg-danger/20 text-danger rounded-lg">
                   <AlertCircle className="w-4 h-4"/>
                </div>
             </div>
             <p className="text-3xl font-bold text-danger">{delayedBuses}</p>
          </div>
       </div>

       {/* Live Fleet Table */}
       <div className="glass-panel rounded-xl border border-border overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b border-border bg-surface/50">
             <h3 className="font-semibold text-sm uppercase tracking-wider text-text-muted">Live Tracking Overview</h3>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
             {state.buses.map(bus => (
               <button 
                  key={bus.id}
                  onClick={() => onBusSelect(bus.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between
                     ${selectedBusId === bus.id ? 'bg-primary/20 border-primary cursor-default' : 'bg-surface hover:bg-surface/80 border-transparent hover:border-white/10'}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-2 h-2 rounded-full ${bus.status === 'delayed' ? 'bg-danger animate-pulse' : 'bg-accent'}`}></div>
                     <div>
                        <div className="font-semibold flex items-center gap-2">
                           {bus.plate}
                           {bus.status === 'delayed' && <span className="text-xs text-danger border border-danger bg-danger/10 px-1 rounded">DELAYED</span>}
                        </div>
                        <div className="text-xs text-text-muted">R{bus.routeId.replace('R','')} • {bus.driverName}</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="font-mono text-sm">{bus.speed} km/h</div>
                     <div className="text-xs text-text-muted">{bus.passengers} pax</div>
                  </div>
               </button>
             ))}
          </div>
       </div>
    </div>
  );
};
