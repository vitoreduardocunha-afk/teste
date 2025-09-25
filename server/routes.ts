import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSessionSchema, insertKanbanItemSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      // In a real app, generate JWT token here
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email já está em uso" });
      }

      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // User routes
  app.get("/api/users/mentors", async (req, res) => {
    try {
      const mentors = await storage.getMentors();
      const mentorsWithoutPassword = mentors.map(({ password: _, ...mentor }) => mentor);
      res.json(mentorsWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mentores" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  // Session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar sessão" });
    }
  });

  app.get("/api/sessions/user/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUserSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar sessões" });
    }
  });

  app.get("/api/sessions/upcoming/:userId", async (req, res) => {
    try {
      const sessions = await storage.getUpcomingSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar sessões próximas" });
    }
  });

  app.patch("/api/sessions/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const session = await storage.updateSessionStatus(req.params.id, status);
      if (!session) {
        return res.status(404).json({ message: "Sessão não encontrada" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar sessão" });
    }
  });

  // Kanban routes
  app.get("/api/kanban", async (req, res) => {
    try {
      const items = await storage.getKanbanItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar itens do kanban" });
    }
  });

  app.post("/api/kanban", async (req, res) => {
    try {
      const itemData = insertKanbanItemSchema.parse(req.body);
      const item = await storage.createKanbanItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar item do kanban" });
    }
  });

  app.patch("/api/kanban/:id", async (req, res) => {
    try {
      const item = await storage.updateKanbanItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar item do kanban" });
    }
  });

  app.delete("/api/kanban/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteKanbanItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar item do kanban" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const allSessions = await storage.getUserSessions(userId);
      const upcomingSessions = await storage.getUpcomingSessions(userId);
      const completedSessions = allSessions.filter(s => s.status === "completed");
      const connectedMentors = new Set(allSessions.map(s => s.mentorId)).size;
      const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
      
      const stats = {
        scheduledSessions: upcomingSessions.length,
        connectedMentors,
        mentoringHours: Math.round(totalHours),
        averageRating: 4.8, // Mock for now
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
