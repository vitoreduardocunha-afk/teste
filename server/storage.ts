import { type User, type InsertUser, type Session, type InsertSession, type KanbanItem, type InsertKanbanItem, type UserWithStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getMentors(): Promise<User[]>;
  getStudents(): Promise<User[]>;

  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getUserSessions(userId: string): Promise<Session[]>;
  getUpcomingSessions(userId: string): Promise<Session[]>;
  updateSessionStatus(id: string, status: string): Promise<Session | undefined>;

  // Kanban methods
  getKanbanItems(): Promise<KanbanItem[]>;
  createKanbanItem(item: InsertKanbanItem): Promise<KanbanItem>;
  updateKanbanItem(id: string, item: Partial<KanbanItem>): Promise<KanbanItem | undefined>;
  deleteKanbanItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, Session>;
  private kanbanItems: Map<string, KanbanItem>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.kanbanItems = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed mentors
    const mentor1: User = {
      id: "mentor1",
      email: "ana@mentorconnect.com",
      password: "password123",
      firstName: "Ana",
      lastName: "Rodrigues",
      userType: "mentor",
      area: "Tecnologia",
      bio: "Especialista em React, Vue.js e desenvolvimento frontend moderno. 5+ anos de experiência em startups.",
      skills: ["React", "JavaScript", "CSS", "TypeScript", "Vue.js"],
      hourlyRate: 80,
      rating: 49,
      reviewCount: 23,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date(),
    };

    const mentor2: User = {
      id: "mentor2",
      email: "roberto@mentorconnect.com",
      password: "password123",
      firstName: "Roberto",
      lastName: "Silva",
      userType: "mentor",
      area: "Negócios",
      bio: "Expert em estratégia de produto e growth. Ajudou 3 startups a escalar de 0 a 1M+ usuários.",
      skills: ["Product Strategy", "Growth", "Analytics", "Leadership"],
      hourlyRate: 120,
      rating: 48,
      reviewCount: 31,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      createdAt: new Date(),
    };

    const mentor3: User = {
      id: "mentor3",
      email: "marina@mentorconnect.com",
      password: "password123",
      firstName: "Marina",
      lastName: "Costa",
      userType: "mentor",
      area: "Design",
      bio: "Designer experiente em UX/UI para produtos digitais. Especialista em pesquisa de usuário e design systems.",
      skills: ["UX Design", "Figma", "Research", "Prototyping", "Design Systems"],
      hourlyRate: 100,
      rating: 50,
      reviewCount: 18,
      avatarUrl: "https://pixabay.com/get/geedf745d233a212f5c89ef71e170484f207c809c870ff0361c58185cf8efbd06edfc0c519e00accabea262039a7c9411b62f3b1e8d5f2ab06a3f8ffd963d7109_1280.jpg",
      createdAt: new Date(),
    };

    // Seed student
    const student: User = {
      id: "student1",
      email: "joao@student.com",
      password: "password123",
      firstName: "João",
      lastName: "Silva",
      userType: "student",
      area: "Tecnologia",
      bio: "Estudante de Ciência da Computação buscando mentoria em desenvolvimento frontend.",
      skills: ["JavaScript", "HTML", "CSS"],
      hourlyRate: 0,
      rating: 0,
      reviewCount: 0,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      createdAt: new Date(),
    };

    this.users.set(mentor1.id, mentor1);
    this.users.set(mentor2.id, mentor2);
    this.users.set(mentor3.id, mentor3);
    this.users.set(student.id, student);

    // Seed sessions
    const session1: Session = {
      id: "session1",
      studentId: "student1",
      mentorId: "mentor1",
      topic: "React Performance",
      description: "Revisar técnicas de otimização em React",
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 60,
      status: "confirmed",
      createdAt: new Date(),
    };

    const session2: Session = {
      id: "session2",
      studentId: "student1",
      mentorId: "mentor2",
      topic: "Product Strategy",
      description: "Discussão sobre estratégias de produto",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      duration: 90,
      status: "pending",
      createdAt: new Date(),
    };

    this.sessions.set(session1.id, session1);
    this.sessions.set(session2.id, session2);

    // Seed Kanban items
    const kanbanItemsData: KanbanItem[] = [
      {
        id: "kanban1",
        title: "Sistema de autenticação completo",
        description: "Como usuário, quero poder me cadastrar e fazer login",
        type: "epic",
        status: "backlog",
        points: 8,
        assignee: "João Silva",
        priority: "high",
        progress: 0,
        createdAt: new Date(),
      },
      {
        id: "kanban2",
        title: "Listagem de mentores com filtros",
        description: "Como estudante, quero filtrar mentores por área",
        type: "story",
        status: "backlog",
        points: 5,
        assignee: "Ana Santos",
        priority: "medium",
        progress: 0,
        createdAt: new Date(),
      },
      {
        id: "kanban3",
        title: "Sistema de avaliações",
        description: "Permitir avaliação de sessões de mentoria",
        type: "feature",
        status: "backlog",
        points: 3,
        assignee: "Carlos Lima",
        priority: "low",
        progress: 0,
        createdAt: new Date(),
      },
      {
        id: "kanban4",
        title: "Formulário de cadastro de usuário",
        description: "Criar formulário para estudantes se cadastrarem",
        type: "story",
        status: "todo",
        points: 3,
        assignee: "Maria Costa",
        priority: "high",
        progress: 0,
        createdAt: new Date(),
      },
      {
        id: "kanban5",
        title: "Design do dashboard principal",
        description: "Criar wireframes e protótipos",
        type: "task",
        status: "todo",
        points: 2,
        assignee: "Pedro Silva",
        priority: "medium",
        progress: 0,
        createdAt: new Date(),
      },
      {
        id: "kanban6",
        title: "API de autenticação",
        description: "Implementar login/logout com JWT",
        type: "story",
        status: "in_progress",
        points: 5,
        assignee: "João Silva",
        priority: "high",
        progress: 70,
        createdAt: new Date(),
      },
      {
        id: "kanban7",
        title: "Sistema de agendamento",
        description: "Permitir agendamento de sessões",
        type: "feature",
        status: "in_progress",
        points: 8,
        assignee: "Ana Santos",
        priority: "high",
        progress: 40,
        createdAt: new Date(),
      },
      {
        id: "kanban8",
        title: "Configuração inicial do projeto",
        description: "Setup React + Node.js + PostgreSQL",
        type: "setup",
        status: "done",
        points: 1,
        assignee: "João Silva",
        priority: "high",
        progress: 100,
        createdAt: new Date(),
      },
      {
        id: "kanban9",
        title: "Protótipo de alta fidelidade",
        description: "Design completo no Figma",
        type: "design",
        status: "done",
        points: 3,
        assignee: "Maria Costa",
        priority: "medium",
        progress: 100,
        createdAt: new Date(),
      },
      {
        id: "kanban10",
        title: "Landing page",
        description: "Página inicial com informações da plataforma",
        type: "story",
        status: "done",
        points: 2,
        assignee: "Pedro Silva",
        priority: "medium",
        progress: 100,
        createdAt: new Date(),
      },
    ];

    kanbanItemsData.forEach(item => this.kanbanItems.set(item.id, item));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      rating: 0,
      reviewCount: 0,
      bio: insertUser.bio || null,
      skills: insertUser.skills ? [...insertUser.skills] : null,
      hourlyRate: insertUser.hourlyRate || null,
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getMentors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.userType === "mentor");
  }

  async getStudents(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.userType === "student");
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      description: insertSession.description || null,
      status: insertSession.status || "pending",
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.studentId === userId || session.mentorId === userId
    );
  }

  async getUpcomingSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => (session.studentId === userId || session.mentorId === userId) &&
                 session.scheduledAt > new Date() &&
                 session.status !== "cancelled"
    );
  }

  async updateSessionStatus(id: string, status: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, status };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getKanbanItems(): Promise<KanbanItem[]> {
    return Array.from(this.kanbanItems.values());
  }

  async createKanbanItem(insertItem: InsertKanbanItem): Promise<KanbanItem> {
    const id = randomUUID();
    const item: KanbanItem = {
      ...insertItem,
      id,
      description: insertItem.description || null,
      points: insertItem.points || null,
      assignee: insertItem.assignee || null,
      priority: insertItem.priority || null,
      progress: insertItem.progress || null,
      status: insertItem.status || "backlog",
      createdAt: new Date(),
    };
    this.kanbanItems.set(id, item);
    return item;
  }

  async updateKanbanItem(id: string, itemData: Partial<KanbanItem>): Promise<KanbanItem | undefined> {
    const item = this.kanbanItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemData };
    this.kanbanItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteKanbanItem(id: string): Promise<boolean> {
    return this.kanbanItems.delete(id);
  }
}

export const storage = new MemStorage();
