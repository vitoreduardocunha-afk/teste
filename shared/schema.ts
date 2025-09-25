import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").notNull(), // 'student' | 'mentor'
  area: text("area").notNull(),
  bio: text("bio"),
  skills: jsonb("skills").$type<string[]>().default([]),
  hourlyRate: integer("hourly_rate"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id),
  mentorId: varchar("mentor_id").notNull().references(() => users.id),
  topic: text("topic").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // minutes
  status: text("status").notNull().default("pending"), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const kanbanItems = pgTable("kanban_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'epic' | 'story' | 'feature' | 'task' | 'bug'
  status: text("status").notNull().default("backlog"), // 'backlog' | 'todo' | 'in_progress' | 'done'
  points: integer("points").default(0),
  assignee: text("assignee"),
  priority: text("priority").default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  progress: integer("progress").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertKanbanItemSchema = createInsertSchema(kanbanItems).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertKanbanItem = z.infer<typeof insertKanbanItemSchema>;
export type KanbanItem = typeof kanbanItems.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export type UserWithStats = User & {
  upcomingSessionsCount?: number;
  completedSessionsCount?: number;
};
