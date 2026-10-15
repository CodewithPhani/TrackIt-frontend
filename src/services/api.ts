import { Route, Bus, Alert } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export interface AuthResult { name: string; role: 'student' | 'driver' | 'admin'; email: string; assignedBusId?: string; token: string; }

async function authRequest(path: string, payload: Record<string, string>): Promise<AuthResult> {
  const res = await fetch(`${API_BASE_URL}/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Authentication failed. Check the backend and your details.');
  return data as AuthResult;
}

export const apiService = {
  login(email: string, password: string, role: string) { return authRequest('login', { email, password, role }); },
  signup(name: string, email: string, password: string, busNumber: string) { return authRequest('signup', { name, email, password, busNumber }); },
  // Fetch all routes from Spring Boot backend
  async getRoutes(): Promise<Route[]> {
    const res = await fetch(`${API_BASE_URL}/routes`);
    if (!res.ok) throw new Error('Failed to fetch routes from backend');
    return res.json();
  },

  // Fetch all buses from Spring Boot backend
  async getBuses(): Promise<Bus[]> {
    const res = await fetch(`${API_BASE_URL}/buses`);
    if (!res.ok) throw new Error('Failed to fetch buses from backend');
    return res.json();
  },

  // Send a driver's current GPS fix to the backend. Browser speed is m/s.
  async updateBusLocation(busId: string, location: { latitude: number; longitude: number; accuracy: number; heading: number; speed: number }, token?: string): Promise<Bus> {
    const res = await fetch(`${API_BASE_URL}/buses/${busId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(location)
    });
    if (!res.ok) throw new Error(res.status === 404 ? 'Bus not found' : 'Failed to send bus GPS location');
    return res.json();
  },

  // Report bus incident/delay to Spring Boot backend
  async reportIncident(busId: string, delayInSeconds: number = 600, alertType: string = 'emergency', message: string = 'Incident reported', token?: string): Promise<Bus> {
    const res = await fetch(`${API_BASE_URL}/buses/${busId}/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ busId, delayInSeconds, alertType, message })
    });
    if (!res.ok) throw new Error('Failed to report incident to backend');
    return res.json();
  },

  // Fetch recent alerts
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts from backend');
    return res.json();
  },

  // Toggle simulation play/pause in backend
  async toggleSimulation(token?: string): Promise<{ isPlaying: boolean; simulationSpeed: number }> {
    const res = await fetch(`${API_BASE_URL}/simulation/toggle`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to toggle simulation in backend');
    return res.json();
  },

  // Set simulation speed in backend
  async setSimulationSpeed(speed: number, token?: string): Promise<{ isPlaying: boolean; simulationSpeed: number }> {
    const res = await fetch(`${API_BASE_URL}/simulation/speed?speed=${speed}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error('Failed to set simulation speed in backend');
    return res.json();
  },

  // Fetch Location API configuration key
  async getLocationConfig(): Promise<{ locationApiKey: string; status: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/location/config`);
      if (res.ok) return res.json();
    } catch {
      // Fallback to local env key if backend unaccessible
    }
    return {
      locationApiKey: import.meta.env.VITE_LOCATION_API_KEY || '',
      status: 'ACTIVE'
    };
  }
};

