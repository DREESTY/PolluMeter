import { useCurrentAqi } from './use-aqi';

export function useWeather() {
  const { data, isLoading, error } = useCurrentAqi();
  
  return {
    weather: data?.weather,
    isLoading,
    error
  };
}
