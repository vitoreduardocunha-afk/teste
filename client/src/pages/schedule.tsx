import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { insertSessionSchema, User, Session } from "@shared/schema";
import { authManager } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus, Calendar } from "lucide-react";

const scheduleFormSchema = z.object({
  mentorId: z.string().min(1, "Selecione um mentor"),
  topic: z.string().min(3, "Tópico deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Selecione data e horário"),
  duration: z.number().min(30, "Duração mínima é de 30 minutos"),
});

type ScheduleFormData = z.infer<typeof scheduleFormSchema>;

interface SessionWithDetails extends Session {
  mentorName?: string;
  mentorAvatar?: string | null;
}

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(authManager.getCurrentUser());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      mentorId: "",
      topic: "",
      description: "",
      scheduledAt: "",
      duration: 60,
    },
  });

  const { data: mentors = [], isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users/mentors"],
  });

  const { data: userSessions = [], isLoading: sessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/user", user?.id],
    enabled: !!user,
    select: (sessions: Session[]): SessionWithDetails[] =>
      sessions.map((session): SessionWithDetails => {
        const mentor = mentors.find((m) => m.id === session.mentorId);
        return {
          ...session,
          mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : "Mentor Desconhecido",
          mentorAvatar: mentor?.avatarUrl || null,
        };
      }),
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: ScheduleFormData) => {
      if (!user) throw new Error("Usuário não autenticado");
      
      const sessionData = {
        studentId: user.id,
        mentorId: data.mentorId,
        topic: data.topic,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        duration: data.duration,
        status: "pending",
      };

      const response = await apiRequest("POST", "/api/sessions", sessionData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sessão agendada com sucesso!",
        description: "Sua solicitação foi enviada ao mentor para confirmação.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro ao agendar sessão",
        description: error.message || "Tente novamente mais tarde.",
      });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    createSessionMutation.mutate(data);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      confirmed: { label: "Confirmado", variant: "default" as const },
      completed: { label: "Concluído", variant: "outline" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge variant={statusInfo.variant} data-testid={`status-${status}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  // Generate time slots for today and next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      // Available hours: 9-17
      for (let hour = 9; hour <= 17; hour++) {
        const slot = new Date(date);
        slot.setHours(hour, 0, 0, 0);
        
        // Skip past times for today
        if (slot > new Date()) {
          slots.push(slot);
        }
      }
    }
    
    return slots.slice(0, 20); // Limit to 20 slots
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-8" data-testid="schedule-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="title-schedule">
          Agendamento de Sessões
        </h1>
        <p className="text-muted-foreground mt-2">
          Agende suas sessões de mentoria de forma rápida e fácil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scheduling Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5" />
                Nova Sessão de Mentoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="mentorId">Mentor</Label>
                  <Select 
                    value={form.watch("mentorId")} 
                    onValueChange={(value) => form.setValue("mentorId", value)}
                  >
                    <SelectTrigger data-testid="select-mentor">
                      <SelectValue placeholder="Selecione um mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentorsLoading ? (
                        <SelectItem value="loading" disabled>
                          Carregando mentores...
                        </SelectItem>
                      ) : (
                        mentors.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.firstName} {mentor.lastName} - {mentor.area}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.mentorId && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.mentorId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="scheduledAt">Data e Horário</Label>
                  <Select 
                    value={form.watch("scheduledAt")} 
                    onValueChange={(value) => form.setValue("scheduledAt", value)}
                  >
                    <SelectTrigger data-testid="select-datetime">
                      <SelectValue placeholder="Selecione data e horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.toISOString()} value={slot.toISOString()}>
                          {formatDateTime(slot.toISOString())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.scheduledAt && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.scheduledAt.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Select 
                    value={form.watch("duration").toString()} 
                    onValueChange={(value) => form.setValue("duration", parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.duration && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="topic">Tópico da Sessão</Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Revisão de portfolio, dúvidas sobre React..."
                    {...form.register("topic")}
                    data-testid="input-topic"
                  />
                  {form.formState.errors.topic && (
                    <p className="text-destructive text-sm mt-1">
                      {form.formState.errors.topic.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Descreva o que você gostaria de discutir na sessão..."
                    {...form.register("description")}
                    data-testid="textarea-description"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createSessionMutation.isPending}
                  data-testid="button-schedule-session"
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {createSessionMutation.isPending ? "Agendando..." : "Agendar Sessão"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Suas Sessões
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div>
                          <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                          <div className="h-3 bg-muted rounded w-16"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : userSessions.length > 0 ? (
                <div className="space-y-4">
                  {userSessions
                    .sort((a: SessionWithDetails, b: SessionWithDetails) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .slice(0, 5)
                    .map((session: SessionWithDetails) => (
                      <div 
                        key={session.id} 
                        className="border border-border rounded-lg p-4"
                        data-testid={`session-${session.id}`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={session.mentorAvatar || undefined} />
                            <AvatarFallback>
                              {session.mentorName?.split(" ").map((n: string) => n[0]).join("") || "M"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground" data-testid={`session-mentor-${session.id}`}>
                              {session.mentorName}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`session-topic-${session.id}`}>
                              {session.topic}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(session.scheduledAt.toString())}
                          </span>
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))}
                    
                  {userSessions.length > 5 && (
                    <Button variant="ghost" className="w-full text-sm" data-testid="button-view-all-sessions">
                      Ver todas as sessões ({userSessions.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="no-sessions">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">Nenhuma sessão agendada</p>
                  <p className="text-sm text-muted-foreground">
                    Agende sua primeira sessão usando o formulário ao lado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
