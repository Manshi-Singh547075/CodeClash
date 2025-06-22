import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { NLPService } from "./services/nlpService";
import { AgentService } from "./services/agentService";
import { SocketService } from "./services/socketService";
import { insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default agents
  await AgentService.initializeDefaultAgents();

  // Initialize default integrations
  await initializeDefaultIntegrations();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Agent routes
  app.get('/api/agents', isAuthenticated, async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Task routes
  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { originalInstruction } = insertTaskSchema.parse(req.body);

      const result = await NLPService.processUserInstruction(userId, originalInstruction);

      // Broadcast task creation to user
      SocketService.broadcastTaskUpdate(userId, {
        taskId: result.taskId,
        status: 'created',
        instruction: originalInstruction,
        processed: result.processed
      });

      res.json(result);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Integration routes
  app.get('/api/integrations', isAuthenticated, async (req, res) => {
    try {
      const integrations = await storage.getAllIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  // Quick examples route
  app.get('/api/examples', isAuthenticated, async (req, res) => {
    try {
      const examples = NLPService.getQuickExamples();
      res.json(examples);
    } catch (error) {
      console.error("Error fetching examples:", error);
      res.status(500).json({ message: "Failed to fetch examples" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  SocketService.initialize(httpServer);

  return httpServer;
}

async function initializeDefaultIntegrations(): Promise<void> {
  const integrations = await storage.getAllIntegrations();
  if (integrations.length > 0) return;

  const defaultIntegrations = [
    {
      name: "Twilio",
      type: "communication",
      status: "connected",
      config: { apiKey: "configured" },
      usage: { callsToday: 12, callsLimit: 100 }
    },
    {
      name: "Google Calendar",
      type: "calendar", 
      status: "connected",
      config: { clientId: "configured" },
      usage: { eventsScheduled: 8, eventsLimit: 50 }
    },
    {
      name: "SendGrid",
      type: "email",
      status: "connected", 
      config: { apiKey: "configured" },
      usage: { emailsSent: 24, emailsLimit: 100 }
    },
    {
      name: "OpenAI",
      type: "ai",
      status: "connected",
      config: { apiKey: "configured" },
      usage: { tokensUsed: 1200, tokensLimit: 10000 }
    }
  ];

  for (const integration of defaultIntegrations) {
    await storage.createIntegration(integration as any);
  }
}
