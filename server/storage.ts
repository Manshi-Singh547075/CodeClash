import {
  users,
  agents,
  tasks,
  agentTasks,
  activities,
  integrations,
  type User,
  type UpsertUser,
  type Agent,
  type InsertAgent,
  type Task,
  type InsertTask,
  type AgentTask,
  type InsertAgentTask,
  type Activity,
  type InsertActivity,
  type Integration,
  type InsertIntegration,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Agent operations
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: number, status: string, currentTask?: string): Promise<void>;
  updateAgentStats(id: number, stats: any): Promise<void>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTasks(userId: string, limit?: number): Promise<Task[]>;
  updateTaskStatus(id: number, status: string, results?: any): Promise<void>;
  
  // Agent task operations
  createAgentTask(agentTask: InsertAgentTask): Promise<AgentTask>;
  getAgentTasks(agentId: number): Promise<AgentTask[]>;
  updateAgentTask(id: number, updates: Partial<AgentTask>): Promise<void>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  
  // Integration operations
  getAllIntegrations(): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegrationUsage(name: string, usage: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Agent operations
  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.isActive, true));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }

  async updateAgentStatus(id: number, status: string, currentTask?: string): Promise<void> {
    await db
      .update(agents)
      .set({ 
        status, 
        currentTask: currentTask || null,
        updatedAt: new Date() 
      })
      .where(eq(agents.id, id));
  }

  async updateAgentStats(id: number, stats: any): Promise<void> {
    await db
      .update(agents)
      .set({ stats, updatedAt: new Date() })
      .where(eq(agents.id, id));
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getUserTasks(userId: string, limit = 50): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async updateTaskStatus(id: number, status: string, results?: any): Promise<void> {
    await db
      .update(tasks)
      .set({ 
        status, 
        results: results || undefined,
        updatedAt: new Date() 
      })
      .where(eq(tasks.id, id));
  }

  // Agent task operations
  async createAgentTask(agentTask: InsertAgentTask): Promise<AgentTask> {
    const [newAgentTask] = await db.insert(agentTasks).values(agentTask).returning();
    return newAgentTask;
  }

  async getAgentTasks(agentId: number): Promise<AgentTask[]> {
    return await db
      .select()
      .from(agentTasks)
      .where(eq(agentTasks.agentId, agentId))
      .orderBy(desc(agentTasks.createdAt));
  }

  async updateAgentTask(id: number, updates: Partial<AgentTask>): Promise<void> {
    await db
      .update(agentTasks)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(agentTasks.id, id));
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getUserActivities(userId: string, limit = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Integration operations
  async getAllIntegrations(): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.isActive, true));
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [newIntegration] = await db.insert(integrations).values(integration).returning();
    return newIntegration;
  }

  async updateIntegrationUsage(name: string, usage: any): Promise<void> {
    await db
      .update(integrations)
      .set({ usage, updatedAt: new Date() })
      .where(eq(integrations.name, name));
  }
}

export const storage = new DatabaseStorage();
