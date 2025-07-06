import { TrendingUp, Calendar, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAqiForecast } from "../hooks/use-aqi";
import { getAqiColor, getAqiLevel } from "../lib/aqi-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

export function Forecast() {
  const { data: forecastData, isLoading } = useAqiForecast();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Forecast Data</h3>
            <p className="text-gray-600 dark:text-gray-400">Unable to load forecast data for this location.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const chartData = forecastData.map((item: any) => ({
    hour: item.hour === 0 ? 'Now' : 
          item.hour < 24 ? `${item.hour}h` : 
          `${item.hour - 24}h (+1d)`,
    aqi: item.predictedAqi,
    level: item.predictedLevel,
    time: item.hour === 0 ? 'Now' : 
          item.hour < 24 ? `${new Date(Date.now() + item.hour * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric' })}` :
          `${new Date(Date.now() + item.hour * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric' })} (+1d)`
  }));

  // Get next 24 hours for detailed view
  const next24Hours = forecastData.slice(0, 24);

  // Get daily summaries
  const today = forecastData.slice(0, 24);
  const tomorrow = forecastData.slice(24, 48);

  const todayAvg = Math.round(today.reduce((sum: number, item: any) => sum + item.predictedAqi, 0) / today.length);
  const tomorrowAvg = Math.round(tomorrow.reduce((sum: number, item: any) => sum + item.predictedAqi, 0) / tomorrow.length);

  const todayMax = Math.max(...today.map((item: any) => item.predictedAqi));
  const tomorrowMax = Math.max(...tomorrow.map((item: any) => item.predictedAqi));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <TrendingUp className="w-8 h-8 text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">48-Hour AQI Forecast</h1>
      </div>

      {/* Main Chart */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <span>Detailed Forecast</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                  interval={5}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-gray-600 dark:text-gray-400"
                  domain={[0, 'dataMax + 50']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-card p-3 rounded-lg shadow-lg">
                          <p className="font-medium">{data.time}</p>
                          <p className={`text-sm ${getAqiColor(data.aqi)}`}>
                            AQI: {data.aqi} ({data.level})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#aqiGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average AQI</span>
                <span className={`font-bold text-xl ${getAqiColor(todayAvg)}`}>{todayAvg}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Peak AQI</span>
                <span className={`font-bold ${getAqiColor(todayMax)}`}>{todayMax}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Air Quality</span>
                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                  getAqiLevel(todayAvg) === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  getAqiLevel(todayAvg) === 'Moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {getAqiLevel(todayAvg)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="text-lg">Tomorrow's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average AQI</span>
                <span className={`font-bold text-xl ${getAqiColor(tomorrowAvg)}`}>{tomorrowAvg}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Peak AQI</span>
                <span className={`font-bold ${getAqiColor(tomorrowMax)}`}>{tomorrowMax}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Air Quality</span>
                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                  getAqiLevel(tomorrowAvg) === 'Good' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  getAqiLevel(tomorrowAvg) === 'Moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {getAqiLevel(tomorrowAvg)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Breakdown */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Next 24 Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {next24Hours.slice(0, 8).map((item: any, index: number) => (
              <div key={index} className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {index === 0 ? 'Now' : `${item.hour}h`}
                </p>
                <p className={`text-lg font-bold ${getAqiColor(item.predictedAqi)}`}>
                  {item.predictedAqi}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.predictedLevel.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
