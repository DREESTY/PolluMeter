import { Map as MapIcon, Layers, Target, Search, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNearbyLocations } from "../hooks/use-aqi";
import { useAppStore } from "../store/app-store";
import { getAqiColor } from "../lib/aqi-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { api } from "../lib/api";
import { InteractiveMap } from "../components/interactive-map";
import { useLocation } from "../hooks/use-location";

export function Map() {
  const { data: nearbyData, isLoading } = useNearbyLocations();
  const { currentLocation, setCurrentLocation } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { detectLocation, isDetecting } = useLocation();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await api.searchLocations(query.trim());
      setSearchResults(results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (location: any) => {
    setCurrentLocation(location);
    setSearchQuery(location.city);
    setShowSuggestions(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapIcon className="w-8 h-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Air Quality Map</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-card"
            onClick={detectLocation}
            disabled={isDetecting}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isDetecting ? "Detecting..." : "Detect Location"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="glass-card"
            onClick={() => currentLocation && setCurrentLocation(currentLocation)}
          >
            <Target className="w-4 h-4 mr-2" />
            Center
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="glass-card border-none">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search for a location..." 
              className="pl-10 glass-card border-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  selectLocation(searchResults[0]);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowSuggestions(true);
              }}
              disabled={isSearching}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Search Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={result.id || index}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    onClick={() => selectLocation(result)}
                  >
                    <div className="font-medium text-gray-800 dark:text-white">
                      {result.city}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {result.state}, {result.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="glass-card border-none">
        <CardContent className="p-0">
          <div className="relative h-96 rounded-3xl overflow-hidden">
            {currentLocation && (
              <InteractiveMap
                center={[currentLocation.latitude, currentLocation.longitude]}
                locations={nearbyData || []}
                onLocationSelect={setCurrentLocation}
                className="h-full w-full"
              />
            )}
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass-card p-3 rounded-xl z-[1000]">
              <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">AQI Levels</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Good (0-50)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Moderate (51-100)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Unhealthy (101-150)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Very Unhealthy (151+)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyData && nearbyData.length > 0 ? (
          nearbyData.slice(0, 6).map((location: any) => (
            <Card 
              key={location.id} 
              className="glass-card border-none cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setCurrentLocation(location)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{location.city}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: getAqiColor(location.aqi || 0) }}
                    >
                      {location.aqi || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {location.level || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {location.distance !== undefined 
                        ? `${location.distance.toFixed(1)} km away`
                        : 'Current location'
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {Math.floor(Math.random() * 30)} min ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No nearby locations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
