import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { authManager } from "@/lib/auth";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronDown, GraduationCap } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [user, setUser] = useState<User | null>(authManager.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authManager.logout();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return location.startsWith(path) && path !== "/";
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <GraduationCap className="text-primary text-2xl" />
              <span className="text-xl font-bold text-foreground">MentorConnect</span>
            </Link>
            {user && (
              <nav className="hidden md:flex space-x-8">
                <Link 
                  href="/" 
                  className={`transition-colors ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-dashboard"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/mentors" 
                  className={`transition-colors ${isActive("/mentors") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-mentors"
                >
                  Mentores
                </Link>
                <Link 
                  href="/schedule" 
                  className={`transition-colors ${isActive("/schedule") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-schedule"
                >
                  Sessões
                </Link>
                <Link 
                  href="/kanban" 
                  className={`transition-colors ${isActive("/kanban") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  data-testid="link-kanban"
                >
                  Kanban
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-user-menu">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl || ""} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:block">
                        {user.firstName} {user.lastName}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem data-testid="menu-profile">Perfil</DropdownMenuItem>
                    <DropdownMenuItem data-testid="menu-settings">Configurações</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button data-testid="button-login">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
