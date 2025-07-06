import { Settings as SettingsIcon, Globe, MapPin, Palette, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import { useAppStore } from "../store/app-store";
import { useState } from "react";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { currentLocation } = useAppStore();
  const [language, setLanguage] = useState("en");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [units, setUnits] = useState("metric");

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
      </div>

      {/* Location Settings */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <span>Location Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Current Location</Label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="font-medium text-gray-800 dark:text-white">
                {currentLocation ? `${currentLocation.city}, ${currentLocation.state}` : "No location set"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : ""}
              </p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Manual Location Entry</Label>
            <Input placeholder="Enter city name" className="glass-card border-none" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-detect Location</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatically use your current location for air quality data
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-500" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="glass-card border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="glass-card border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Units</Label>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger className="glass-card border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (°C, km/h)</SelectItem>
                <SelectItem value="imperial">Imperial (°F, mph)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <span>Data & Privacy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-refresh Data</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Automatically refresh air quality data every 5 minutes
              </p>
            </div>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Share Usage Data</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Help improve the app by sharing anonymous usage statistics
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Offline Mode</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cache data for offline viewing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-indigo-500" />
            <span>About PolluMeter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              PolluMeter is a real-time air quality monitoring application designed to empower 
              communities with accurate, accessible air quality data. Our mission is to make 
              environmental health information available to everyone, especially in underserved areas.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">v1.0.0</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Version</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-lg font-bold text-gray-800 dark:text-white">OpenAQ</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Data Source</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full glass-card">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full glass-card">
              Terms of Service
            </Button>
            <Button variant="outline" className="w-full glass-card">
              Report an Issue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
