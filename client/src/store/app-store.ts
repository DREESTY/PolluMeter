import { create } from 'zustand';

interface Location {
  id: number;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface AppState {
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLocation: {
    id: 1,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 19.0760,
    longitude: 72.8777
  },
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  currentPage: "dashboard",
  setCurrentPage: (page) => set({ currentPage: page }),
}));
