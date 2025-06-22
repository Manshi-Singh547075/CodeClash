import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ProcessedInstruction {
  intent: string;
  tasks: Array<{
    type: 'communication' | 'booking' | 'followup';
    action: string;
    description: string;
    parameters: Record<string, any>;
    priority: number;
    dependencies?: string[];
  }>;
  confidence: number;
  executionOrder: number[];
}

export async function processNaturalLanguageInstruction(instruction: string): Promise<ProcessedInstruction> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI agent orchestrator. Break down natural language instructions into specific tasks for specialized agents.

Available agent types:
- communication: Makes phone calls, handles voice interactions
- booking: Schedules meetings, reserves rooms, manages calendar events  
- followup: Sends emails, manages follow-up communications

Respond with JSON in this exact format:
{
  "intent": "brief description of the overall goal",
  "tasks": [
    {
      "type": "agent_type",
      "action": "specific_action",
      "description": "detailed description",
      "parameters": {"key": "value"},
      "priority": 1-10,
      "dependencies": ["optional_task_references"]
    }
  ],
  "confidence": 0.0-1.0,
  "executionOrder": [0, 1, 2]
}

Make tasks specific and actionable. Include all relevant parameters.`
        },
        {
          role: "user",
          content: instruction,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      intent: result.intent || "Unknown intent",
      tasks: result.tasks || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
      executionOrder: result.executionOrder || result.tasks?.map((_: any, i: number) => i) || []
    };
  } catch (error) {
    console.error("Failed to process natural language instruction:", error);
    throw new Error("Failed to process instruction: " + (error as Error).message);
  }
}

export async function generateAgentResponse(agentType: string, action: string, context: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a ${agentType} agent. Generate a realistic response for the action: ${action}. Keep responses concise and professional.`
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(context)}. Provide a brief status update or result.`
        }
      ],
    });

    return response.choices[0].message.content || "Task completed";
  } catch (error) {
    console.error("Failed to generate agent response:", error);
    return "Task completed with unknown status";
  }
}
