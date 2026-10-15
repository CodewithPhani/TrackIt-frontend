import React from 'react';
import { NearbyResult, UserGpsState } from '../../services/useUserLocation';
import { MapPin, Navigation, Clock, Users, Loader2, ZapOff, Compass } from 'lucide-react';

interface NearbyPanelProps {
  gpsState: UserGpsState;
  nearbyResult: NearbyResult | null;
  isLoading: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatEta(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
}

export const NearbyPanel: React.FC<NearbyPanelProps> = ({
  gpsState,
  nearbyResult,
  isLoading,
  onStartTracking,
  onStopTracking,
}) => {

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header & Toggle */}
      <div className="glass-panel p-4 rounded-xl border border-primary/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" /> My Surroundings
            </h2>
            {gpsState.lat != null ? (
              <p className="text-xs text-text-muted font-mono mt-0.5">
                {gpsState.lat.toFixed(5)}, {gpsState.lng!.toFixed(5)}
                {gpsState.accuracy != null && (
                  <span className="ml-2 text-accent">±{Math.round(gpsState.accuracy)}m</span>
                )}
              </p>
            ) : (
              <p className="text-xs text-text-muted mt-0.5">Location not acquired yet</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={gpsState.isTracking ? onStopTracking : onStartTracking}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                gpsState.isTracking
                  ? 'bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {gpsState.isTracking ? <><ZapOff className="w-4 h-4" /> Stop</> : <><Navigation className="w-4 h-4" /> Track Me</>}
            </button>
          </div>
        </div>

        {/* Reverse Geocoded Surroundings Address */}
        {gpsState.address && (
          <div className="text-xs bg-surface/80 p-2.5 rounded-lg border border-white/5 text-text flex items-start gap-2">
            <Compass className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{gpsState.address}</span>
          </div>
        )}


      </div>

      {/* Error Banner */}
      {gpsState.error && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-3 rounded-xl">
          {gpsState.error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-text-muted text-sm p-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Finding nearby buses and stops...
        </div>
      )}

      {/* GPS Stats */}
      {gpsState.isTracking && gpsState.speed != null && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3 rounded-xl text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Your Speed</p>
            <p className="text-2xl font-bold">{Math.round((gpsState.speed ?? 0) * 3.6)}</p>
            <p className="text-xs text-text-muted">km/h</p>
          </div>
          <div className="glass-panel p-3 rounded-xl text-center">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Heading</p>
            <p className="text-2xl font-bold">{gpsState.heading != null ? Math.round(gpsState.heading) : '--'}°</p>
            <p className="text-xs text-text-muted">degrees</p>
          </div>
        </div>
      )}

      {!gpsState.isTracking && !nearbyResult && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted p-8 glass-panel rounded-xl border border-dashed border-border/50">
          <Navigation className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold mb-1">Enable Location Tracking</p>
          <p className="text-sm">Tap "Track Me" to see buses and stops near your real-time location.</p>
        </div>
      )}

      {/* Results */}
      {nearbyResult && (
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">

          {/* Nearby Buses */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Nearest Buses ({nearbyResult.nearbyBuses.length})
            </h3>
            {nearbyResult.nearbyBuses.length === 0 ? (
              <div className="text-text-muted text-sm p-3 glass-panel rounded-xl">No buses within 5 km</div>
            ) : (
              <div className="space-y-2">
                {nearbyResult.nearbyBuses.map((bus) => (
                  <div key={bus.busId}
                    className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: bus.routeColor || '#3b82f6' }} />
                        <div>
                          <div className="font-bold">{bus.plate}</div>
                          <div className="text-xs text-text-muted">{bus.routeName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-primary">{formatDistance(bus.distanceMeters)}</div>
                        {bus.status === 'delayed' ? (
                          <span className="text-xs text-danger border border-danger/30 bg-danger/10 px-1 rounded">DELAYED</span>
                        ) : (
                          <span className="text-xs text-accent border border-accent/30 bg-accent/10 px-1 rounded">ON TIME</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-warning" />
                        ETA {formatEta(bus.etaSeconds)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-accent" />
                        {bus.passengers}/{bus.capacity}
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {Math.round(bus.speed)} km/h
                      </div>
                    </div>
                    {bus.nextStopName && (
                      <div className="mt-2 text-xs text-text-muted border-t border-border/50 pt-2">
                        Next stop: <span className="text-white font-semibold">{bus.nextStopName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nearby Stops */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-accent" />
              Nearest Stops ({nearbyResult.nearbyStops.length})
            </h3>
            {nearbyResult.nearbyStops.length === 0 ? (
              <div className="text-text-muted text-sm p-3 glass-panel rounded-xl">No stops within 3 km</div>
            ) : (
              <div className="space-y-2">
                {nearbyResult.nearbyStops.map((stop) => (
                  <div key={stop.stopId}
                    className="glass-panel p-3 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0 border-2"
                        style={{ borderColor: stop.routeColor || '#10b981', backgroundColor: 'transparent' }} />
                      <div>
                        <div className="font-semibold text-sm">{stop.stopName}</div>
                        <div className="text-xs text-text-muted">{stop.routeName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{formatDistance(stop.distanceMeters)}</div>
                      <div className="text-xs text-text-muted flex items-center gap-1 justify-end">
                        🚶 {formatEta(stop.walkTimeSeconds)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
