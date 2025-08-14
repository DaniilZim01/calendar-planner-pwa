import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import BottomNavigation from "./components/BottomNavigation";
import GoalsPage from "./pages/goals";
import WellbeingPage from "./pages/wellbeing";
import PlannerPage from "./pages/planner";
import CalendarPage from "./pages/calendar";
import EventPage from "./pages/event";
import ProfilePage from "./pages/profile";
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";
import AuthPage from "./pages/auth";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="relative">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={GoalsPage} />
        <Route path="/wellbeing" component={WellbeingPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/event/:id">{() => <EventPage />}</Route>
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="bg-background min-h-screen">
            <Router />
          </div>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
