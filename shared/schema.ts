import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent definitions
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'communication', 'booking', 'followup'
  status: varchar("status", { length: 50 }).notNull().default("idle"), // 'idle', 'active', 'busy', 'error'
  capabilities: jsonb("capabilities").notNull(), // array of capabilities
  currentTask: text("current_task"),
  stats: jsonb("stats").notNull().default('{}'), // performance stats
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks and instructions
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  originalInstruction: text("original_instruction").notNull(),
  processedTasks: jsonb("processed_tasks").notNull(), // array of subtasks
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'failed'
  assignedAgents: jsonb("assigned_agents").notNull().default('[]'), // array of agent IDs
  results: jsonb("results").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual agent tasks
export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  type: varchar("type", { length: 100 }).notNull(), // 'call', 'booking', 'email', etc.
  description: text("description").notNull(),
  parameters: jsonb("parameters").notNull().default('{}'),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  result: jsonb("result"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity log for real-time feed
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => agents.id),
  taskId: integer("task_id").references(() => tasks.id),
  type: varchar("type", { length: 100 }).notNull(), // 'agent_action', 'task_update', 'system'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// External service integrations
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'communication', 'calendar', 'email', 'ai'
  status: varchar("status", { length: 50 }).notNull().default("connected"),
  config: jsonb("config").notNull().default('{}'),
  usage: jsonb("usage").notNull().default('{}'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertAgent = typeof agents.$inferInsert;
export type Agent = typeof agents.$inferSelect;

export type InsertTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;

export type InsertAgentTask = typeof agentTasks.$inferInsert;
export type AgentTask = typeof agentTasks.$inferSelect;

export type InsertActivity = typeof activities.$inferInsert;
export type Activity = typeof activities.$inferSelect;

export type InsertIntegration = typeof integrations.$inferInsert;
export type Integration = typeof integrations.$inferSelect;

// Zod schemas
export const insertTaskSchema = createInsertSchema(tasks).pick({
  originalInstruction: true,
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).pick({
  type: true,
  description: true,
  parameters: true,
});
