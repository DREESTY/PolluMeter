import { AlertTriangle, Heart, TrendingUp, Cloud, MapPin, Bell, Eye, Droplets, Wind as WindIcon, CheckCircle, Home as HomeIcon, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentAqi, useAqiForecast, useAqiHistory } from "../hooks/use-aqi";
import { getAqiGradient, getHealthRecommendations, formatPollutantValue } from "../lib/aqi-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const iconMap = {
  AlertTriangle,
  CheckCircle,
  Home: HomeIcon,
  Shield,
  Wind: WindIcon,
  AlertCircle: AlertTriangle
};

function getWeatherIcon(iconCode: string) {
  // Simplified weather icon mapping
  if (iconCode?.includes('01')) return '☀️';
  if (iconCode?.includes('02')) return '⛅';
  if (iconCode?.includes('03')) return '☁️';
  if (iconCode?.includes('04')) return '☁️';
  if (iconCode?.includes('09')) return '🌦️';
  if (iconCode?.includes('10')) return '🌧️';
  if (iconCode?.includes('11')) return '⛈️';
  if (iconCode?.includes('13')) return '❄️';
  if (iconCode?.includes('50')) return '🌫️';
  return '☁️';
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">AQI: </span>
          <span className="text-blue-600 dark:text-blue-400">{data.value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const { data: currentData, isLoading: currentLoading } = useCurrentAqi();
  const { data: forecastData, isLoading: forecastLoading } = useAqiForecast();
  const { data: historyData, isLoading: historyLoading } = useAqiHistory();

  if (currentLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400">Unable to load air quality data for this location.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { aqi, weather, location } = currentData;
  const recommendations = aqi ? getHealthRecommendations(aqi.aqi) : [];

  // Prepare chart data
  const chartData = forecastData?.slice(0, 8).map((item: any, index: number) => ({
    hour: index === 0 ? 'Now' : `${index * 6}h`,
    aqi: item.predictedAqi
  })) || [];

  return (
    <div className="space-y-8">
      {/* Current AQI Section */}
      {aqi && (
        <section>
          <div className={`glass-card rounded-3xl p-6 sm:p-8 ${getAqiGradient(aqi.level)} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 float-animation"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">Current Air Quality Index</p>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">{aqi.aqi}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                      {aqi.level}
                    </span>
                    <span className="text-white/80 text-sm">
                      Updated {new Date(aqi.timestamp || new Date()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="text-white w-8 h-8" />
                  </div>
                </div>
              </div>
              
              {/* Pollutants */}
              {aqi.pollutants && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs font-medium mb-1">PM2.5</p>
                    <p className="text-white text-lg font-bold">
                      {formatPollutantValue(aqi.pollutants.pm25)}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs font-medium mb-1">PM10</p>
                    <p className="text-white text-lg font-bold">
                      {formatPollutantValue(aqi.pollutants.pm10)}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs font-medium mb-1">O₃</p>
                    <p className="text-white text-lg font-bold">
                      {formatPollutantValue(aqi.pollutants.o3)}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs font-medium mb-1">NO₂</p>
                    <p className="text-white text-lg font-bold">
                      {formatPollutantValue(aqi.pollutants.no2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Weather and Health Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Card */}
        {weather && (
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Cloud className="mr-2 text-blue-500" />
              Current Weather
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
                  {Math.round(weather.temperature)}°C
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-2 capitalize">
                  {weather.description}
                </p>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Visibility: {weather.visibility} km
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Droplets className="w-4 h-4 mr-2" />
                    Humidity: {weather.humidity}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <WindIcon className="w-4 h-4 mr-2" />
                    Wind: {weather.windSpeed} km/h
                  </p>
                </div>
              </div>
              
              <div className="text-6xl float-animation">
                {getWeatherIcon(weather.icon)}
              </div>
            </div>
          </div>
        )}
        
        {/* Health Recommendations */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Heart className="mr-2 text-red-500" />
            Health Recommendations
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const IconComponent = iconMap[rec.icon as keyof typeof iconMap] || AlertTriangle;
              return (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-xl ${
                    rec.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' :
                    rec.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <IconComponent className={`mt-1 w-5 h-5 ${
                    rec.type === 'danger' ? 'text-red-500' :
                    rec.type === 'warning' ? 'text-orange-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{rec.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Forecast Chart */}
      {!forecastLoading && chartData.length > 0 && (
        <section className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <TrendingUp className="mr-2 text-purple-500" />
              48-Hour AQI Forecast
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>AQI Values</span>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent Readings */}
      {!historyLoading && historyData && historyData.length > 0 && (
        <section className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <TrendingUp className="mr-2 text-indigo-500" />
            Recent Readings
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Time</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">AQI</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Level</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Primary Pollutant</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((reading: any) => (
                  <tr key={reading.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-800 dark:text-white">
                      {reading.aqi}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        reading.level === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        reading.level === 'Moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {reading.level}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {reading.primaryPollutant}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
