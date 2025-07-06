import { Map as MapIcon, Layers, Target, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNearbyLocations } from "../hooks/use-aqi";
import { useAppStore } from "../store/app-store";
import { getAqiColor } from "../lib/aqi-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { api } from "../lib/api";

export function Map() {
  const { data: nearbyData, isLoading } = useNearbyLocations();
  const { currentLocation, setCurrentLocation } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
          <Button variant="outline" size="sm" className="glass-card">
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm" className="glass-card">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setIsSearching(true);
                  try {
                    const results = await api.searchLocations(searchQuery.trim());
                    if (results && results.length > 0) {
                      setCurrentLocation(results[0]);
                    }
                  } catch (error) {
                    console.error('Search failed:', error);
                  } finally {
                    setIsSearching(false);
                  }
                }
              }}
              disabled={isSearching}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="glass-card border-none">
        <CardContent className="p-0">
          <div className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl overflow-hidden">
            {/* Map Background - In a real app, this would be Leaflet/Mapbox */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600"></div>
            
            {/* Location Markers */}
            <div className="absolute top-16 left-16">
              <div className="relative">
                <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse cursor-pointer shadow-lg"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  Andheri: AQI 156
                </div>
              </div>
            </div>
            
            <div className="absolute top-32 right-24">
              <div className="relative">
                <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse cursor-pointer shadow-lg"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  Powai: AQI 78
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-24 left-32">
              <div className="relative">
                <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse cursor-pointer shadow-lg"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  Worli: AQI 189
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-16 right-16">
              <div className="relative">
                <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse cursor-pointer shadow-lg"></div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  Bandra: AQI 124
                </div>
              </div>
            </div>
            
            {/* Current Location */}
            {currentLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg">
                    <div className="w-full h-full bg-blue-600 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                    {currentLocation.city}
                  </div>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass-card p-3 rounded-xl">
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
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Andheri West</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">156</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unhealthy for Sensitive</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">3.2 km away</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Updated 15 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Powai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">78</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Moderate</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">5.8 km away</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Updated 8 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Worli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">189</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unhealthy</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">7.1 km away</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Updated 22 min ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
