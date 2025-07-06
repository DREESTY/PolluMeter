import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { api } from '../lib/api';

export function useLocation() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentLocation } = useAppStore();

  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const location = await api.getLocationByCoords(latitude, longitude);
      
      if (location) {
        setCurrentLocation(location);
      } else {
        throw new Error('Could not determine location details');
      }
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred while detecting location.');
            break;
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to detect location');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  return {
    detectLocation,
    isDetecting,
    error
  };
}
