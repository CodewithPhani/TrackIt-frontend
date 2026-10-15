export interface BusStop {
  id: string;
  name: string;
  location: [number, number]; // [lat, lng]
  estimatedArrival?: number; // In seconds
}

export interface Route {
  id: string;
  name: string;
  type: string;
  color: string;
  path: [number, number][]; // Array of [lat, lng] points
  stops: BusStop[];
}

export interface Bus {
  id: string;
  routeId: string;
  plate: string;
  driverName: string;
  capacity: number;
  passengers: number;
  location: [number, number]; // [lat, lng]
  speed: number; // km/h
  heading: number; // degrees
  nextStopId: string;
  status: 'on_time' | 'delayed' | 'early' | 'stopped';
  delayInSeconds: number;
  locationSource?: 'gps' | 'simulation';
  lastLocationUpdate?: string | null;
  gpsAccuracy?: number;
}

export interface SimulationState {
  routes: Route[];
  buses: Bus[];
  simulationSpeed: number;
  isPlaying: boolean;
}

export interface Alert {
  id: string;
  busId: string;
  type: 'traffic' | 'mechanical' | 'emergency';
  message: string;
  timestamp: string;
}
