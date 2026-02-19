import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { ScanEffect } from "@/components/ScanEffect";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import VirtualLab from "@/pages/VirtualLab";
import Knowledge from "@/pages/Knowledge";
import Assistant from "@/pages/Assistant";
import Threats from "@/pages/Threats";
import Datasets from "@/pages/Datasets";
import Profile from "@/pages/Profile";
import BackendSetup from "@/pages/BackendSetup";
import MLDatasetsAndModels from "@/pages/MLDatasetsAndModels";
import PythonUtilities from "@/pages/PythonUtilities";
import DigitalTwinDashboard from "@/components/DigitalTwinDashboard";
import MetricsDashboard from "@/components/MetricsDashboard";

import { GlassLayout } from "@/components/layout/GlassLayout";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlassLayout>
      {children}
    </GlassLayout>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

import Landing from "@/pages/Landing";

function Router() {
  const { user, isLoading } = useAuth();
  // Removed isLoading and !user checks as per instructions.
  // The application now assumes the user is authenticated or handles authentication outside this router.

  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={Landing} />

      {/* Main Application Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/virtual-lab">
        {() => <ProtectedRoute component={VirtualLab} />}
      </Route>
      <Route path="/knowledge">
        {() => <ProtectedRoute component={Knowledge} />}
      </Route>
      <Route path="/assistant">
        {() => <ProtectedRoute component={Assistant} />}
      </Route>
      <Route path="/threats">
        {() => <ProtectedRoute component={Threats} />}
      </Route>
      <Route path="/datasets">
        {() => <ProtectedRoute component={Datasets} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/backend-setup">
        {() => <ProtectedRoute component={BackendSetup} />}
      </Route>
      <Route path="/ml-datasets">
        {() => <ProtectedRoute component={MLDatasetsAndModels} />}
      </Route>
      <Route path="/python-utilities">
        {() => <ProtectedRoute component={PythonUtilities} />}
      </Route>
      {/* Digital Twin Dashboard */}
      <Route path="/digital-twin">
        {() => <ProtectedRoute component={DigitalTwinDashboard} />}
      </Route>

      {/* Cyber-Physical Modules */}
      <Route path="/performance">
        {() => <ProtectedRoute component={MetricsDashboard} />}
      </Route>
      <Route path="/shap">
        {/* Reusing SHAPPanel in a layout wrapper or standalone page if needed */}
        {/* For now, let's just route it to the dashboard or a specific view */}
        {() => <ProtectedRoute component={DigitalTwinDashboard} />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ScanEffect />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
