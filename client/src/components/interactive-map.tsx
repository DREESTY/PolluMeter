import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAqiColor } from '../lib/aqi-utils';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  id: number;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  aqi?: number;
  level?: string;
  distance?: number;
}

interface InteractiveMapProps {
  center: [number, number];
  locations: Location[];
  onLocationSelect?: (location: Location) => void;
  className?: string;
}

// Custom marker icon creator
const createCustomMarker = (aqi: number) => {
  const color = getAqiColor(aqi);
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-size: 8px; font-weight: bold;">${aqi}</span>
    </div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Component to handle map centering
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  
  return null;
}

export function InteractiveMap({ 
  center, 
  locations, 
  onLocationSelect, 
  className = "" 
}: InteractiveMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  if (!mapLoaded) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-3xl overflow-hidden`}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-3xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController center={center} />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={location.aqi ? createCustomMarker(location.aqi) : new L.Icon.Default()}
            eventHandlers={{
              click: () => onLocationSelect?.(location),
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-800">{location.city}</h3>
                <p className="text-sm text-gray-600">{location.state}</p>
                {location.aqi && (
                  <div className="mt-2">
                    <p className="text-lg font-bold" style={{ color: getAqiColor(location.aqi) }}>
                      AQI: {location.aqi}
                    </p>
                    <p className="text-xs text-gray-500">{location.level}</p>
                    {location.distance !== undefined && (
                      <p className="text-xs text-gray-500">{location.distance.toFixed(1)} km away</p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}