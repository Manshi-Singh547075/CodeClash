import { processNaturalLanguageInstruction } from "../openai";
import { storage } from "../storage";
import { AgentService } from "./agentService";
import type { ProcessedInstruction } from "../openai";

export class NLPService {
  static async processUserInstruction(userId: string, instruction: string): Promise<{
    taskId: number;
    processed: ProcessedInstruction;
    agentTaskIds: number[];
  }> {
    try {
      // Process the natural language instruction with OpenAI
      const processed = await processNaturalLanguageInstruction(instruction);
      
      // Create main task record
      const task = await storage.createTask({
        userId,
        originalInstruction: instruction,
        processedTasks: processed.tasks,
        status: 'pending',
        assignedAgents: []
      });

      // Log the instruction processing activity
      await storage.createActivity({
        userId,
        type: 'system',
        title: 'Natural language processed',
        description: `OpenAI API parsed instruction and created ${processed.tasks.length} sub-tasks for agent execution`,
        metadata: { 
          intent: processed.intent,
          confidence: processed.confidence,
          taskCount: processed.tasks.length
        }
      });

      // Assign tasks to agents based on execution order
      const agentTaskIds: number[] = [];
      const assignedAgentIds: number[] = [];

      for (const taskIndex of processed.executionOrder) {
        const taskDetails = processed.tasks[taskIndex];
        if (!taskDetails) continue;

        const agentTask = await AgentService.assignTaskToAgent(
          taskDetails.type,
          task.id,
          taskDetails
        );

        if (agentTask) {
          agentTaskIds.push(agentTask.id);
          assignedAgentIds.push(agentTask.agentId);

          // Log agent assignment activity
          await storage.createActivity({
            userId,
            agentId: agentTask.agentId,
            taskId: task.id,
            type: 'agent_action',
            title: `Task assigned to ${taskDetails.type} agent`,
            description: taskDetails.description,
            metadata: { 
              taskType: taskDetails.action,
              parameters: taskDetails.parameters 
            }
          });

          // Start agent task execution (async)
          AgentService.executeAgentTask(agentTask.id);
        }
      }

      // Update task with assigned agents
      await storage.updateTaskStatus(task.id, 'in_progress', {
        assignedAgents: assignedAgentIds
      });

      return {
        taskId: task.id,
        processed,
        agentTaskIds
      };

    } catch (error) {
      console.error('Failed to process user instruction:', error);
      
      // Log error activity
      await storage.createActivity({
        userId,
        type: 'system',
        title: 'Instruction processing failed',
        description: `Failed to process natural language instruction: ${(error as Error).message}`,
        metadata: { error: (error as Error).message }
      });

      throw new Error('Failed to process instruction: ' + (error as Error).message);
    }
  }

  static getQuickExamples(): string[] {
    return [
      "Schedule team meeting for next Tuesday at 2 PM and send invitations to all team members",
      "Follow up on the proposal we sent last week with a phone call and email reminder",
      "Book travel arrangements for the conference next month including flight and hotel",
      "Call the client to discuss project timeline and then schedule a follow-up meeting",
      "Reserve the main conference room for tomorrow's presentation and notify all attendees"
    ];
  }
}
