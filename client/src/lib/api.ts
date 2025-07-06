import { apiRequest } from './queryClient';

export const api = {
  getCurrentData: (locationId: number) => 
    fetch(`/api/current/${locationId}`).then(res => res.json()),
    
  getForecast: (locationId: number) =>
    fetch(`/api/forecast/${locationId}`).then(res => res.json()),
    
  searchLocations: (query: string) =>
    fetch(`/api/locations/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
    
  getLocationByCoords: (lat: number, lon: number) =>
    fetch(`/api/locations/coords?lat=${lat}&lon=${lon}`).then(res => res.json()),
    
  getAqiHistory: (locationId: number, limit: number = 10) =>
    fetch(`/api/aqi/history/${locationId}?limit=${limit}`).then(res => res.json()),
    
  getAlerts: () =>
    fetch('/api/alerts').then(res => res.json()),
    
  updateAlerts: (alertData: any) =>
    apiRequest('POST', '/api/alerts', alertData).then(res => res.json()),
    
  getNearbyLocations: (locationId: number) =>
    fetch(`/api/nearby/${locationId}`).then(res => res.json()),
};
