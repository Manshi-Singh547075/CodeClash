import { WebClient } from '@slack/web-api';

if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN environment variable must be set");
}

if (!process.env.SLACK_CHANNEL_ID) {
  throw new Error("SLACK_CHANNEL_ID environment variable must be set");
}

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

interface SlackMessageOptions {
  channel?: string;
  text?: string;
  blocks?: any[];
  thread_ts?: string;
}

export class SlackService {
  static async sendMessage(options: SlackMessageOptions): Promise<{
    success: boolean;
    timestamp?: string;
    error?: string;
  }> {
    try {
      const message: any = {
        channel: options.channel || process.env.SLACK_CHANNEL_ID!,
        text: options.text,
        thread_ts: options.thread_ts
      };

      if (options.blocks) {
        message.blocks = options.blocks;
      }

      const response = await slack.chat.postMessage(message);

      return {
        success: true,
        timestamp: response.ts
      };
    } catch (error) {
      console.error('Slack message failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  static async sendTaskNotification(params: {
    taskId: number;
    instruction: string;
    agentType: string;
    status: 'started' | 'completed' | 'failed';
    results?: any;
  }): Promise<{
    success: boolean;
    timestamp?: string;
    error?: string;
  }> {
    const { taskId, instruction, agentType, status, results } = params;
    
    const statusEmoji = {
      started: '🚀',
      completed: '✅',
      failed: '❌'
    };

    const statusColor = {
      started: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444'
    };

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${statusEmoji[status]} *Agent Task ${status.charAt(0).toUpperCase() + status.slice(1)}*`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Task ID:*\n${taskId}`
          },
          {
            type: 'mrkdwn',
            text: `*Agent Type:*\n${agentType.charAt(0).toUpperCase() + agentType.slice(1)}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Instruction:*\n${instruction}`
        }
      }
    ];

    if (status === 'completed' && results) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Results:*\n\`\`\`${JSON.stringify(results, null, 2)}\`\`\``
        }
      });
    }

    return this.sendMessage({
      blocks,
      text: `Agent task ${status}: ${instruction}`
    });
  }

  static async sendAgentUpdate(params: {
    agentName: string;
    status: string;
    currentTask?: string;
    stats?: any;
  }): Promise<{
    success: boolean;
    timestamp?: string;
    error?: string;
  }> {
    const { agentName, status, currentTask, stats } = params;
    
    const statusEmoji = {
      active: '🟢',
      busy: '🟡',
      idle: '⚪',
      error: '🔴'
    };

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${statusEmoji[status as keyof typeof statusEmoji] || '⚪'} *${agentName}* is now *${status}*`
        }
      }
    ];

    if (currentTask) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Current Task:*\n${currentTask}`
        }
      });
    }

    if (stats && Object.keys(stats).length > 0) {
      const statsText = Object.entries(stats)
        .map(([key, value]) => `*${key}:* ${value}`)
        .join('\n');
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stats:*\n${statsText}`
        }
      });
    }

    return this.sendMessage({
      blocks,
      text: `${agentName} status update: ${status}`
    });
  }

  static async sendSystemAlert(params: {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    metadata?: any;
  }): Promise<{
    success: boolean;
    timestamp?: string;
    error?: string;
  }> {
    const { title, message, severity, metadata } = params;
    
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🚨'
    };

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${severityEmoji[severity]} *${title}*\n${message}`
        }
      }
    ];

    if (metadata && Object.keys(metadata).length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``
        }
      });
    }

    return this.sendMessage({
      blocks,
      text: `System ${severity}: ${title}`
    });
  }
}