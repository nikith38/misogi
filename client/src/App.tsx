import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import FindMentors from "@/pages/find-mentors";
import MySessions from "@/pages/my-sessions";
import Profile from "@/pages/profile";
import Availability from "@/pages/availability";
import Feedback from "@/pages/feedback";
import BookSession from "@/pages/book-session";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ThemeProvider } from "@/components/theme/theme-provider";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/find-mentors" component={FindMentors} />
      <ProtectedRoute path="/my-sessions" component={MySessions} />
      <ProtectedRoute path="/book-session" component={BookSession} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/availability" component={Availability} />
      <ProtectedRoute path="/feedback" component={Feedback} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
