import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { ScanEffect } from "@/components/ScanEffect";
import { useWebSockets } from "@/hooks/useWebSockets";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
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

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function Router() {
  useWebSockets();

  return (
    <Switch>
      <Route path="/">
        {() => <Landing />}
      </Route>
      <Route path="/dashboard">
        {() => <AppRoute component={Dashboard} />}
      </Route>
      <Route path="/virtual-lab">
        {() => <AppRoute component={VirtualLab} />}
      </Route>
      <Route path="/knowledge">
        {() => <AppRoute component={Knowledge} />}
      </Route>
      <Route path="/assistant">
        {() => <AppRoute component={Assistant} />}
      </Route>
      <Route path="/threats">
        {() => <AppRoute component={Threats} />}
      </Route>
      <Route path="/datasets">
        {() => <AppRoute component={Datasets} />}
      </Route>
      <Route path="/profile">
        {() => <AppRoute component={Profile} />}
      </Route>
      <Route path="/backend-setup">
        {() => <AppRoute component={BackendSetup} />}
      </Route>
      <Route path="/ml-datasets">
        {() => <AppRoute component={MLDatasetsAndModels} />}
      </Route>
      <Route path="/python-utilities">
        {() => <AppRoute component={PythonUtilities} />}
      </Route>
      {/* Redirect old auth routes to home */}
      <Route path="/login">
        {() => { window.location.replace("/"); return null; }}
      </Route>
      <Route path="/signup">
        {() => { window.location.replace("/"); return null; }}
      </Route>
      <Route path="/forgot-password">
        {() => { window.location.replace("/"); return null; }}
      </Route>
      <Route path="/reset-password">
        {() => { window.location.replace("/"); return null; }}
      </Route>
      <Route path="/verify-email">
        {() => { window.location.replace("/"); return null; }}
      </Route>
      <Route path="/check-email">
        {() => { window.location.replace("/"); return null; }}
      </Route>
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
