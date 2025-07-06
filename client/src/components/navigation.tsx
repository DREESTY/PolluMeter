import { Home, TrendingUp, Map, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../store/app-store";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "map", label: "Map", icon: Map },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const { currentPage, setCurrentPage } = useAppStore();

  return (
    <nav className="glass-card mx-4 mt-4 sm:mx-6 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(item.id)}
                className={`
                  px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200
                  ${isActive 
                    ? "bg-blue-500 text-white shadow-lg" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/20"
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
