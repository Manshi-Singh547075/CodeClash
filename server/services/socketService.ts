import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from "../storage";

interface ClientConnection {
  ws: WebSocket;
  userId: string;
  lastActivity: Date;
}

export class SocketService {
  private static wss: WebSocketServer;
  private static clients = new Map<string, ClientConnection>();

  static initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Basic verification - in production add proper auth
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Cleanup inactive connections every 30 seconds
    setInterval(this.cleanupConnections.bind(this), 30000);
    
    console.log('WebSocket server initialized on /ws');
  }

  private static handleConnection(ws: WebSocket, request: any): void {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      this.removeClient(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.removeClient(ws);
    });

    // Send connection confirmation
    this.sendToClient(ws, {
      type: 'connection',
      status: 'connected',
      timestamp: new Date().toISOString()
    });
  }

  private static handleMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'auth':
        this.authenticateClient(ws, message.userId);
        break;
      case 'subscribe':
        this.subscribeToUpdates(ws, message.userId);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private static authenticateClient(ws: WebSocket, userId: string): void {
    if (!userId) {
      this.sendToClient(ws, { type: 'error', message: 'User ID required' });
      return;
    }

    this.clients.set(userId, {
      ws,
      userId,
      lastActivity: new Date()
    });

    this.sendToClient(ws, {
      type: 'authenticated',
      userId,
      timestamp: new Date().toISOString()
    });

    console.log(`Client authenticated: ${userId}`);
  }

  private static subscribeToUpdates(ws: WebSocket, userId: string): void {
    const client = this.clients.get(userId);
    if (!client) {
      this.sendToClient(ws, { type: 'error', message: 'Not authenticated' });
      return;
    }

    client.lastActivity = new Date();
    
    this.sendToClient(ws, {
      type: 'subscribed',
      message: 'Subscribed to real-time updates',
      timestamp: new Date().toISOString()
    });
  }

  private static removeClient(ws: WebSocket): void {
    for (const [userId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        this.clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        break;
      }
    }
  }

  private static cleanupConnections(): void {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [userId, client] of this.clients.entries()) {
      if (now.getTime() - client.lastActivity.getTime() > timeout) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.close();
        }
        this.clients.delete(userId);
        console.log(`Cleaned up inactive client: ${userId}`);
      }
    }
  }

  private static sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  // Public methods for broadcasting updates
  static broadcastToUser(userId: string, data: any): void {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      this.sendToClient(client.ws, data);
    }
  }

  static broadcastAgentUpdate(userId: string, agentData: any): void {
    this.broadcastToUser(userId, {
      type: 'agent_update',
      data: agentData,
      timestamp: new Date().toISOString()
    });
  }

  static broadcastTaskUpdate(userId: string, taskData: any): void {
    this.broadcastToUser(userId, {
      type: 'task_update', 
      data: taskData,
      timestamp: new Date().toISOString()
    });
  }

  static broadcastActivity(userId: string, activity: any): void {
    this.broadcastToUser(userId, {
      type: 'new_activity',
      data: activity,
      timestamp: new Date().toISOString()
    });
  }

  static broadcastSystemStatus(userId: string, status: any): void {
    this.broadcastToUser(userId, {
      type: 'system_status',
      data: status,
      timestamp: new Date().toISOString()
    });
  }
}
