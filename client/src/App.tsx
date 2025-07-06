import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Layout } from "@/components/layout";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/pages/dashboard";
import { Forecast } from "@/pages/forecast";
import { Map } from "@/pages/map";
import { Alerts } from "@/pages/alerts";
import { Settings } from "@/pages/settings";
import { useAppStore } from "@/store/app-store";
import NotFound from "@/pages/not-found";

function Router() {
  const { currentPage } = useAppStore();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "forecast":
        return <Forecast />;
      case "map":
        return <Map />;
      case "alerts":
        return <Alerts />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Switch>
      <Route path="/" component={() => (
        <Layout>
          <Navigation />
          {renderCurrentPage()}
        </Layout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="pollumeter-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
