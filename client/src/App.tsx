import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import BottomNavigation from "./components/BottomNavigation";
import GoalsPage from "./pages/goals";
import WellbeingPage from "./pages/wellbeing";
import PlannerPage from "./pages/planner";
import CalendarPage from "./pages/calendar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="relative">
      <Switch>
        <Route path="/" component={GoalsPage} />
        <Route path="/wellbeing" component={WellbeingPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/profile" component={() => <div className="app-container screen-container text-center py-20"><h1 className="text-2xl font-semibold text-foreground">Профиль</h1><p className="text-muted-foreground mt-2">Скоро появится</p></div>} />
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
        <div className="bg-background min-h-screen">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
