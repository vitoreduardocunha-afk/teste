import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { authManager } from "@/lib/auth";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, UserPlus, LogIn } from "lucide-react";

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Confirmação de senha deve ter pelo menos 6 caracteres"),
  terms: z.boolean().refine(val => val, "Você deve aceitar os termos de uso"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      userType: "student" as const,
      area: "",
      bio: "",
      skills: [],
      hourlyRate: 0,
      terms: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      authManager.login(data.user, data.token);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${data.user.firstName}!`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      const { confirmPassword, terms, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return await response.json();
    },
    onSuccess: (data) => {
      authManager.login(data.user, data.token);
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${data.user.firstName}! Sua conta foi criada.`,
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
      });
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="text-primary text-3xl" />
              <h1 className="text-3xl font-bold text-foreground">MentorConnect</h1>
            </div>
            <p className="text-muted-foreground">
              Cadastre-se como estudante ou mentor para começar sua jornada.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Entrar na Plataforma</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        {...loginForm.register("email")}
                        data-testid="input-email-login"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-destructive text-sm mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        data-testid="input-password-login"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-destructive text-sm mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-submit-login"
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Nova Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          placeholder="Seu nome"
                          {...registerForm.register("firstName")}
                          data-testid="input-first-name"
                        />
                        {registerForm.formState.errors.firstName && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          placeholder="Seu sobrenome"
                          {...registerForm.register("lastName")}
                          data-testid="input-last-name"
                        />
                        {registerForm.formState.errors.lastName && (
                          <p className="text-destructive text-sm mt-1">
                            {registerForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registerEmail">Email</Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="seu@email.com"
                        {...registerForm.register("email")}
                        data-testid="input-email-register"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="registerPassword">Senha</Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("password")}
                        data-testid="input-password-register"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("confirmPassword")}
                        data-testid="input-confirm-password"
                      />
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Tipo de Conta</Label>
                      <Select 
                        value={registerForm.watch("userType")} 
                        onValueChange={(value) => {
                          if (value === "student" || value === "mentor") {
                            registerForm.setValue("userType", value);
                          }
                        }}
                      >
                        <SelectTrigger data-testid="select-user-type">
                          <SelectValue placeholder="Selecione o tipo de conta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Estudante</SelectItem>
                          <SelectItem value="mentor">Mentor</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.userType && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.userType.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Área de Interesse/Especialidade</Label>
                      <Select 
                        value={registerForm.watch("area")} 
                        onValueChange={(value) => registerForm.setValue("area", value)}
                      >
                        <SelectTrigger data-testid="select-area">
                          <SelectValue placeholder="Selecione uma área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Negócios">Negócios</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Ciências">Ciências</SelectItem>
                          <SelectItem value="Educação">Educação</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerForm.formState.errors.area && (
                        <p className="text-destructive text-sm mt-1">
                          {registerForm.formState.errors.area.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={registerForm.watch("terms")}
                        onCheckedChange={(checked) => registerForm.setValue("terms", !!checked)}
                        data-testid="checkbox-terms"
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Aceito os{" "}
                        <a href="#" className="text-primary hover:underline">
                          termos de uso
                        </a>{" "}
                        e{" "}
                        <a href="#" className="text-primary hover:underline">
                          política de privacidade
                        </a>
                      </Label>
                    </div>
                    {registerForm.formState.errors.terms && (
                      <p className="text-destructive text-sm">
                        {registerForm.formState.errors.terms.message}
                      </p>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                      disabled={registerMutation.isPending}
                      data-testid="button-submit-register"
                    >
                      {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Por que escolher o MentorConnect?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="text-2xl text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Mentores Experientes</h4>
                  <p className="text-sm text-muted-foreground">
                    Conecte-se com profissionais qualificados e experientes em diversas áreas
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-check text-2xl text-accent"></i>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Agendamento Flexível</h4>
                  <p className="text-sm text-muted-foreground">
                    Agende sessões de acordo com sua disponibilidade e necessidades
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-line text-2xl text-orange-600"></i>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Acompanhe seu Progresso</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitore seu desenvolvimento e conquiste seus objetivos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
