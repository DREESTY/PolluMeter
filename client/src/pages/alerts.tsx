import { Bell, SlidersVertical as SliderIcon, Mail, Smartphone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: alertSettings, isLoading } = useQuery({
    queryKey: ['/api/alerts'],
    queryFn: api.getAlerts,
  });

  const [threshold, setThreshold] = useState(alertSettings?.threshold || 100);
  const [emailNotifications, setEmailNotifications] = useState(alertSettings?.emailNotifications || true);
  const [pushNotifications, setPushNotifications] = useState(alertSettings?.pushNotifications || false);
  const [dailySummary, setDailySummary] = useState(alertSettings?.dailySummary || true);

  const updateAlertsMutation = useMutation({
    mutationFn: api.updateAlerts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Settings Saved",
        description: "Your alert preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save alert settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateAlertsMutation.mutate({
      threshold,
      emailNotifications,
      pushNotifications,
      dailySummary,
    });
  };

  // Update local state when data loads
  if (alertSettings && !isLoading) {
    if (threshold !== alertSettings.threshold) setThreshold(alertSettings.threshold);
    if (emailNotifications !== alertSettings.emailNotifications) setEmailNotifications(alertSettings.emailNotifications);
    if (pushNotifications !== alertSettings.pushNotifications) setPushNotifications(alertSettings.pushNotifications);
    if (dailySummary !== alertSettings.dailySummary) setDailySummary(alertSettings.dailySummary);
  }

  function getAqiLevel(aqi: number): string {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  }

  function getAqiColor(aqi: number): string {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-600";
    if (aqi <= 200) return "text-red-600";
    if (aqi <= 300) return "text-purple-600";
    return "text-red-800";
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="w-8 h-8 text-purple-500" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alert Settings</h1>
      </div>

      {/* Threshold Settings */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SliderIcon className="w-5 h-5 text-purple-500" />
            <span>AQI Alert Threshold</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-sm font-medium">Alert when AQI exceeds</Label>
              <span className={`text-lg font-bold ${getAqiColor(threshold)}`}>
                {threshold} ({getAqiLevel(threshold)})
              </span>
            </div>
            
            <Slider
              value={[threshold]}
              onValueChange={(value: number[]) => setThreshold(value[0])}
              max={300}
              min={0}
              step={10}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0 (Good)</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300 (Hazardous)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">0-50</p>
              <p className="text-xs font-medium">Good</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">51-100</p>
              <p className="text-xs font-medium">Moderate</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">101-150</p>
              <p className="text-xs font-medium">Unhealthy</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-1"></div>
              <p className="text-xs text-gray-600 dark:text-gray-400">151+</p>
              <p className="text-xs font-medium">Very Unhealthy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Receive email alerts when AQI exceeds your threshold
                </p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-500" />
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get instant push notifications on your device
                </p>
              </div>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <Label className="text-sm font-medium">Daily Summary</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Receive daily air quality reports at 8:00 AM
                </p>
              </div>
            </div>
            <Switch
              checked={dailySummary}
              onCheckedChange={setDailySummary}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle>Recent Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">AQI Alert Triggered</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AQI reached 167 in your area</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Air Quality Warning</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AQI exceeded 120 threshold</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Yesterday</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Daily Summary Sent</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Air quality report delivered to your email</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Today, 8:00 AM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateAlertsMutation.isPending}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2"
        >
          {updateAlertsMutation.isPending ? "Saving..." : "Save Alert Settings"}
        </Button>
      </div>
    </div>
  );
}
