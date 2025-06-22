import { storage } from "../storage";
import { generateAgentResponse } from "../openai";
import { TwilioService } from "./twilioService";
import { SendGridService } from "./sendgridService";
import { SlackService } from "./slackService";
import { GoogleCalendarService } from "./googleCalendarService";
import { SocketService } from "./socketService";
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
    try {
      // Get the agent task details
      const agentTask = await storage.getAgentTaskById(agentTaskId);
      if (!agentTask) {
        throw new Error(`Agent task ${agentTaskId} not found`);
      }

      const agent = await storage.getAgent(agentTask.agentId);
      if (!agent) {
        throw new Error(`Agent ${agentTask.agentId} not found`);
      }

      const mainTask = await storage.getTask(agentTask.taskId);
      if (!mainTask) {
        throw new Error(`Main task ${agentTask.taskId} not found`);
      }

      // Update task status to in_progress
      await storage.updateAgentTask(agentTaskId, {
        status: 'in_progress',
        startedAt: new Date()
      });

      // Broadcast task start to Slack
      await SlackService.sendTaskNotification({
        taskId: agentTask.taskId,
        instruction: agentTask.description,
        agentType: agent.type,
        status: 'started'
      });

      let result: any = {};

      // Execute based on agent type using real services
      switch (agent.type) {
        case 'communication':
          result = await AgentService.executeCommunicationTask(agentTask);
          break;
        case 'booking':
          result = await AgentService.executeBookingTask(agentTask);
          break;
        case 'followup':
          result = await AgentService.executeFollowupTask(agentTask);
          break;
        default:
          throw new Error(`Unknown agent type: ${agent.type}`);
      }

      // Update task as completed
      await storage.updateAgentTask(agentTaskId, {
        status: 'completed',
        result,
        completedAt: new Date()
      });

      // Send completion notification to Slack
      await SlackService.sendTaskNotification({
        taskId: agentTask.taskId,
        instruction: agentTask.description,
        agentType: agent.type,
        status: 'completed',
        results: result
      });

      // Create activity record
      await storage.createActivity({
        userId: mainTask.userId,
        agentId: agent.id,
        taskId: agentTask.taskId,
        type: 'agent_action',
        title: `${agent.name} completed task`,
        description: `Successfully completed: ${agentTask.description}`,
        metadata: { result }
      });

      // Update agent back to active status
      const remainingTasks = await storage.getAgentTasks(agent.id);
      const pendingTasks = remainingTasks.filter(task => task.status === 'pending');
      
      if (pendingTasks.length === 0) {
        await storage.updateAgentStatus(agent.id, 'active');
      }

    } catch (error) {
      console.error('Agent task execution failed:', error);
      await storage.updateAgentTask(agentTaskId, {
        status: 'failed',
        result: { error: (error as Error).message }
      });

      // Send failure notification to Slack
      try {
        const agentTask = await storage.getAgentTaskById(agentTaskId);
        if (agentTask) {
          const agent = await storage.getAgent(agentTask.agentId);
          if (agent) {
            await SlackService.sendTaskNotification({
              taskId: agentTask.taskId,
              instruction: agentTask.description,
              agentType: agent.type,
              status: 'failed'
            });
          }
        }
      } catch (slackError) {
        console.error('Failed to send Slack failure notification:', slackError);
      }
    }
  }

  private static async executeCommunicationTask(agentTask: AgentTask): Promise<any> {
    const params = agentTask.parameters as any;
    
    // Extract phone number and message from parameters
    const phoneNumber = params.phoneNumber || params.to || '+1234567890'; // Default for demo
    const message = params.message || agentTask.description;
    
    // Make actual Twilio call
    const callResult = await TwilioService.makeCall({
      to: phoneNumber,
      message: message
    });

    if (callResult.success) {
      // Wait a bit and get call status
      setTimeout(async () => {
        if (callResult.callSid) {
          const status = await TwilioService.getCallStatus(callResult.callSid);
          console.log('Call status update:', status);
        }
      }, 10000); // Check after 10 seconds
    }

    return {
      type: 'communication',
      service: 'twilio',
      phoneNumber,
      message,
      callSid: callResult.callSid,
      success: callResult.success,
      status: callResult.status,
      error: callResult.error,
      timestamp: new Date().toISOString()
    };
  }

  private static async executeBookingTask(agentTask: AgentTask): Promise<any> {
    const params = agentTask.parameters as any;
    
    // Extract booking details from parameters
    const eventDetails = {
      summary: params.title || params.summary || 'Meeting',
      description: params.description || agentTask.description,
      start: {
        dateTime: params.startTime || new Date(Date.now() + 24*60*60*1000).toISOString(), // Tomorrow
        timeZone: params.timeZone || 'America/New_York'
      },
      end: {
        dateTime: params.endTime || new Date(Date.now() + 25*60*60*1000).toISOString(), // Tomorrow + 1 hour
        timeZone: params.timeZone || 'America/New_York'
      },
      attendees: params.attendees || [],
      location: params.location || 'Conference Room'
    };

    // Create calendar event
    const bookingResult = await GoogleCalendarService.createEvent(eventDetails);

    return {
      type: 'booking',
      service: 'google_calendar',
      eventDetails,
      eventId: bookingResult.eventId,
      eventUrl: bookingResult.eventUrl,
      success: bookingResult.success,
      error: bookingResult.error,
      timestamp: new Date().toISOString()
    };
  }

  private static async executeFollowupTask(agentTask: AgentTask): Promise<any> {
    const params = agentTask.parameters as any;
    
    // Extract email details from parameters
    const emailDetails = {
      to: params.email || params.to || 'example@example.com', // Default for demo
      recipientName: params.recipientName || params.name || 'Recipient',
      subject: params.subject || 'Follow-up from OmniDimension',
      meetingDetails: params.meetingDetails,
      callSummary: params.callSummary || agentTask.description,
      nextSteps: params.nextSteps || ['Schedule follow-up meeting', 'Review project requirements']
    };

    // Send follow-up email
    const emailResult = await SendGridService.sendFollowUpEmail(emailDetails);

    return {
      type: 'followup',
      service: 'sendgrid',
      emailDetails,
      messageId: emailResult.messageId,
      success: emailResult.success,
      error: emailResult.error,
      timestamp: new Date().toISOString()
    };
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
