import { storage } from "../storage";
import { generateAgentResponse } from "../openai";
import type { Agent, AgentTask } from "@shared/schema";

export class AgentService {
  static async initializeDefaultAgents(): Promise<void> {
    const existingAgents = await storage.getAllAgents();
    if (existingAgents.length > 0) return;

    const defaultAgents = [
      {
        name: "Communication Agent",
        type: "communication",
        capabilities: ["phone_calls", "voice_interaction", "customer_contact"],
        stats: { callsToday: 0, successRate: 94, totalCalls: 0 }
      },
      {
        name: "Booking Agent", 
        type: "booking",
        capabilities: ["calendar_management", "room_booking", "scheduling"],
        stats: { bookingsToday: 0, availability: 98, totalBookings: 0 }
      },
      {
        name: "Follow-up Agent",
        type: "followup", 
        capabilities: ["email_sending", "follow_up_management", "communication"],
        stats: { emailsSent: 0, responseRate: 87, totalEmails: 0 }
      }
    ];

    for (const agent of defaultAgents) {
      await storage.createAgent(agent);
    }
  }

  static async assignTaskToAgent(agentType: string, taskId: number, taskDetails: any): Promise<AgentTask | null> {
    const agents = await storage.getAllAgents();
    const availableAgent = agents.find(agent => 
      agent.type === agentType && 
      (agent.status === 'idle' || agent.status === 'active')
    );

    if (!availableAgent) {
      console.warn(`No available ${agentType} agent found`);
      return null;
    }

    // Update agent status
    await storage.updateAgentStatus(availableAgent.id, 'busy', taskDetails.description);

    // Create agent task
    const agentTask = await storage.createAgentTask({
      taskId,
      agentId: availableAgent.id,
      type: taskDetails.action,
      description: taskDetails.description,
      parameters: taskDetails.parameters || {},
      status: 'pending'
    });

    return agentTask;
  }

  static async executeAgentTask(agentTaskId: number): Promise<void> {
    // This simulates task execution - in production this would integrate with actual services
    
    setTimeout(async () => {
      try {
        // Simulate task execution time
        await storage.updateAgentTask(agentTaskId, {
          status: 'in_progress',
          startedAt: new Date()
        });

        // Simulate processing time (2-5 seconds)
        const processingTime = 2000 + Math.random() * 3000;
        
        setTimeout(async () => {
          // Generate realistic result using AI
          const result = await this.simulateTaskCompletion(agentTaskId);
          
          await storage.updateAgentTask(agentTaskId, {
            status: 'completed',
            result,
            completedAt: new Date()
          });

          // Update agent back to active status
          const agentTask = await storage.getAgentTasks(result.agentId);
          const pendingTasks = agentTask.filter(task => task.status === 'pending');
          
          if (pendingTasks.length === 0) {
            await storage.updateAgentStatus(result.agentId, 'active');
          }

        }, processingTime);

      } catch (error) {
        console.error('Agent task execution failed:', error);
        await storage.updateAgentTask(agentTaskId, {
          status: 'failed',
          result: { error: 'Task execution failed' }
        });
      }
    }, 1000);
  }

  private static async simulateTaskCompletion(agentTaskId: number): Promise<any> {
    // In production, this would make actual API calls to external services
    // For now, we'll simulate realistic responses
    
    const successRate = 0.9; // 90% success rate
    const isSuccess = Math.random() < successRate;

    const mockResults = {
      communication: {
        success: isSuccess,
        callDuration: isSuccess ? `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 60)}s` : null,
        contactReached: isSuccess,
        response: isSuccess ? "Contact confirmed meeting availability" : "No answer, left voicemail"
      },
      booking: {
        success: isSuccess,
        bookingId: isSuccess ? `BK${Date.now()}` : null,
        roomBooked: isSuccess ? `Conference Room ${Math.floor(Math.random() * 5) + 1}` : null,
        timeSlot: isSuccess ? "Tuesday 2:00 PM - 3:00 PM" : null
      },
      followup: {
        success: isSuccess,
        emailsSent: isSuccess ? Math.floor(Math.random() * 3) + 1 : 0,
        deliveryStatus: isSuccess ? "All emails delivered successfully" : "Some emails failed to send",
        trackingIds: isSuccess ? [`${Date.now()}-1`, `${Date.now()}-2`] : []
      }
    };

    // Return random result based on agent type
    const types = Object.keys(mockResults);
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      agentId: Math.floor(Math.random() * 3) + 1, // Mock agent ID
      ...mockResults[randomType as keyof typeof mockResults],
      completedAt: new Date().toISOString()
    };
  }
}
