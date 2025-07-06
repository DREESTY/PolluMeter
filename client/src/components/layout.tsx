import { Wind, MapPin, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { useLocation } from "../hooks/use-location";
import { useAppStore } from "../store/app-store";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { detectLocation, isDetecting, error } = useLocation();
  const { currentLocation } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wind className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">PolluMeter</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {currentLocation ? `${currentLocation.city}, ${currentLocation.state}` : "Select Location"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Location Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={detectLocation}
              disabled={isDetecting}
              className="glass-card text-gray-700 dark:text-gray-300 hover:bg-white/20"
            >
              <MapPin className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline text-sm">
                {isDetecting ? "Detecting..." : "Detect Location"}
              </span>
            </Button>
            
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-card text-gray-700 dark:text-gray-300 hover:bg-white/20"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-card mx-4 sm:mx-6 mb-6 rounded-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wind className="text-white w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">PolluMeter</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Empowering communities with air quality data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-blue-500 transition-colors duration-200">About</a>
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <span className="text-blue-500 font-medium">OpenAQ & OpenWeather</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
