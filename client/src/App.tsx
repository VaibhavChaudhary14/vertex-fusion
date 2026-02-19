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
import { useWebSockets } from "@/hooks/useWebSockets";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import VerifyEmail from "@/pages/VerifyEmail";
import CheckEmail from "@/pages/CheckEmail";
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <AuthenticatedLayout>
      <Component />
    </AuthenticatedLayout>
  );
}

function Router() {
  // AUTHENTICATION TEMPORARILY COMMENTED OUT - Users go directly to dashboard
  // const { isAuthenticated, isLoading } = useAuth();
  
  // Initialize WebSockets
  useWebSockets();

  // if (isLoading) {
  //   return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   return (
  //     <Switch>
  //       <Route path="/">
  //         {() => <Landing />}
  //       </Route>
  //       <Route path="/signup">
  //         {() => <SignUp />}
  //       </Route>
  //       <Route path="/login">
  //         {() => <Login />}
  //       </Route>
  //       <Route path="/forgot-password">
  //         {() => <ForgotPassword />}
  //       </Route>
  //       <Route path="/reset-password">
  //         {() => <ResetPassword />}
  //       </Route>
  //       <Route path="/verify-email">
  //         {() => <VerifyEmail />}
  //       </Route>
  //       <Route path="/check-email">
  //         {() => {
  //           const email = typeof window !== "undefined" ? sessionStorage.getItem("signupEmail") : undefined;
  //           return <CheckEmail email={email || "your email"} />;
  //         }}
  //       </Route>
  //       <Route component={NotFound} />
  //     </Switch>
  //   );
  // }

  return (
    <Switch>
      <Route path="/">
        {() => <Landing />}
      </Route>
      {/* Authentication routes - temporarily redirect to dashboard */}
      <Route path="/login">
        {() => <Login />}
      </Route>
      <Route path="/signup">
        {() => <SignUp />}
      </Route>
      <Route path="/forgot-password">
        {() => <ForgotPassword />}
      </Route>
      <Route path="/reset-password">
        {() => <ResetPassword />}
      </Route>
      <Route path="/verify-email">
        {() => <VerifyEmail />}
      </Route>
      <Route path="/check-email">
        {() => {
          const email = typeof window !== "undefined" ? sessionStorage.getItem("signupEmail") : undefined;
          return <CheckEmail email={email || "your email"} />;
        }}
      </Route>
      {/* Dashboard and app routes */}
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
