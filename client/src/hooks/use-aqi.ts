import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAppStore } from '../store/app-store';

export function useCurrentAqi() {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['/api/current', currentLocation?.id],
    queryFn: () => currentLocation ? api.getCurrentData(currentLocation.id) : null,
    enabled: !!currentLocation,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
}

export function useAqiForecast() {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['/api/forecast', currentLocation?.id],
    queryFn: () => currentLocation ? api.getForecast(currentLocation.id) : null,
    enabled: !!currentLocation,
    staleTime: 30 * 60 * 1000, // Consider forecast stale after 30 minutes
  });
}

export function useAqiHistory(limit: number = 10) {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['/api/aqi/history', currentLocation?.id, limit],
    queryFn: () => currentLocation ? api.getAqiHistory(currentLocation.id, limit) : null,
    enabled: !!currentLocation,
  });
}

export function useNearbyLocations() {
  const { currentLocation } = useAppStore();
  
  return useQuery({
    queryKey: ['/api/nearby', currentLocation?.id],
    queryFn: () => currentLocation ? api.getNearbyLocations(currentLocation.id) : null,
    enabled: !!currentLocation,
  });
}
