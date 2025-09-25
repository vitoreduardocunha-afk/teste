import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { authManager } from "./lib/auth";
import { User } from "@shared/schema";

import Header from "./components/header";
import Footer from "./components/footer";
import Dashboard from "./pages/dashboard";
import MentorsPage from "./pages/mentors";
import SchedulePage from "./pages/schedule";
import KanbanPage from "./pages/kanban";
import AuthPage from "./pages/auth";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [user, setUser] = useState<User | null>(authManager.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return <AuthPage />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/mentors" component={() => <ProtectedRoute component={MentorsPage} />} />
      <Route path="/schedule" component={() => <ProtectedRoute component={SchedulePage} />} />
      <Route path="/kanban" component={() => <ProtectedRoute component={KanbanPage} />} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Router />
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
