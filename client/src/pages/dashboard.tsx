import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { authManager } from "@/lib/auth";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, TrendingUp, Users, CalendarCheck } from "lucide-react";

interface DashboardStats {
  scheduledSessions: number;
  connectedMentors: number;
  mentoringHours: number;
  averageRating: number;
}

interface SessionWithMentor {
  id: string;
  topic: string;
  scheduledAt: string;
  mentorName: string;
  mentorAvatar?: string;
  status: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(authManager.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", user?.id],
    enabled: !!user,
  });

  const { data: upcomingSessions = [], isLoading: sessionsLoading } = useQuery<SessionWithMentor[]>({
    queryKey: ["/api/sessions/upcoming", user?.id],
    enabled: !!user,
    select: (sessions: any[]) =>
      sessions.map((session) => ({
        ...session,
        mentorName: "Mentor",
        scheduledAt: new Date(session.scheduledAt).toLocaleString("pt-BR"),
      })),
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (sessionDate.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    } else {
      return sessionDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="title-dashboard">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo de volta, {user.firstName}! Aqui está um resumo das suas atividades de mentoria.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Agendadas</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-scheduled-sessions">
                  {statsLoading ? "..." : stats?.scheduledSessions || 0}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <CalendarCheck className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mentores Conectados</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-connected-mentors">
                  {statsLoading ? "..." : stats?.connectedMentors || 0}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-full">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Horas de Mentoria</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-mentoring-hours">
                  {statsLoading ? "..." : stats?.mentoringHours || 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-average-rating">
                  {statsLoading ? "..." : stats?.averageRating || "4.8"}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-muted-foreground/20 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted-foreground/20 rounded mb-1"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-muted-foreground/20 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    data-testid={`upcoming-session-${session.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={session.mentorAvatar} />
                        <AvatarFallback>
                          {session.mentorName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`mentor-name-${session.id}`}>
                          {session.mentorName}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`session-topic-${session.id}`}>
                          {session.topic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatTime(session.scheduledAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.scheduledAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="no-upcoming-sessions">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma sessão agendada</p>
                <p className="text-sm text-muted-foreground">
                  Agende uma sessão com um mentor para começar
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sprint Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Sprint Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sprint 1 - Funcionalidades Básicas</span>
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Em andamento
                </Badge>
              </div>
              
              <div className="w-full">
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">60% completo</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="sprint-todo">8</p>
                  <p className="text-xs text-muted-foreground">To Do</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary" data-testid="sprint-in-progress">5</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent" data-testid="sprint-done">12</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duração da Sprint:</span>
                  <span className="font-medium">10/12 - 24/12 (2 semanas)</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Progresso diário:</span>
                  <span className="font-medium">5 story points/dia</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
