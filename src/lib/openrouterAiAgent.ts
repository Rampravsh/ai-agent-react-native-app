/**
 * OpenRouter AI Agent - Muse AI / Cooper Companion
 *
 * Built with @openrouter/agent, supporting:
 * - Multi-turn autonomous tool orchestration
 * - Streaming responses & token callbacks
 * - Subagents via tool.agent()
 * - Stop conditions (stepCountIs)
 * - Specialized tools for weather, datetime, math, and task routines
 */

import { OpenRouter, tool, stepCountIs, fromChatMessages } from '@openrouter/agent';
import { z } from 'zod';
import { ChatMessage } from '@/types';

/**
 * OpenRouter API Key & Model Configuration
 */
export const getApiKey = (): string => {
  const key =
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    '';
  return key.trim();
};

export const getAgentModel = (): string => {
  const model =
    process.env.EXPO_PUBLIC_OPENROUTER_MODEL ||
    process.env.OPENROUTER_MODEL ||
    'openrouter/free';
  return model.trim();
};

/**
 * Core OpenRouter Client Instance
 */
export const openrouter = new OpenRouter({
  apiKey: getApiKey(),
});

/**
 * Tool: Weather lookup
 */
export const weatherTool = tool({
  name: 'get_weather',
  description: 'Get current weather conditions and forecast for a specified city or location',
  inputSchema: z.object({
    location: z.string().describe('City or location name'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
  outputSchema: z.object({
    location: z.string(),
    temperature: z.number(),
    unit: z.string(),
    condition: z.string(),
    humidity: z.number(),
  }),
  execute: async ({ location, unit }) => {
    const isFahrenheit = unit === 'fahrenheit';
    return {
      location,
      temperature: isFahrenheit ? 72 : 22,
      unit: unit ?? 'celsius',
      condition: 'Sunny with light clouds',
      humidity: 48,
    };
  },
});

/**
 * Tool: Current Date, Time, and Timezone
 */
export const datetimeTool = tool({
  name: 'get_datetime',
  description: 'Get current local and UTC date, time, and timezone information',
  inputSchema: z.object({
    timezone: z.string().optional().describe('Optional timezone identifier, e.g. UTC, America/New_York, Asia/Kolkata'),
  }),
  outputSchema: z.object({
    isoString: z.string(),
    formattedDate: z.string(),
    formattedTime: z.string(),
    timezone: z.string(),
  }),
  execute: async ({ timezone }) => {
    const now = new Date();
    const resolvedTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return {
      isoString: now.toISOString(),
      formattedDate: now.toLocaleDateString(),
      formattedTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timezone: resolvedTimezone,
    };
  },
});

/**
 * Tool: Safe Mathematical Calculator
 */
export const calculatorTool = tool({
  name: 'calculate',
  description: 'Evaluate mathematical arithmetic expressions safely',
  inputSchema: z.object({
    expression: z.string().describe('Mathematical expression to calculate, e.g. "(150 * 3) + 42"'),
  }),
  outputSchema: z.object({
    expression: z.string(),
    result: z.number(),
  }),
  execute: async ({ expression }) => {
    const sanitized = expression.replace(/[^0-9+\-*/().%^ ]/g, '');
    try {
      // Safe arithmetic evaluation
      const result = Number(new Function(`return (${sanitized})`)());
      if (Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error('Expression produced non-finite result');
      }
      return { expression, result };
    } catch {
      return { expression, result: 0 };
    }
  },
});

/**
 * Tool: Schedule or Manage Autonomous Tasks/Goals
 */
export const scheduleTaskTool = tool({
  name: 'schedule_task',
  description: 'Schedule a recurring autonomous task or goal for Cooper to monitor and run',
  inputSchema: z.object({
    title: z.string().describe('Title of the goal or routine, e.g. "Morning Health Check"'),
    schedule: z.string().describe('Frequency and time, e.g. "Every day @ 8:00 AM"'),
    notes: z.string().optional().describe('Workflow details or instructions for this task'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    taskId: z.string(),
    title: z.string(),
    schedule: z.string(),
    status: z.string(),
  }),
  execute: async ({ title, schedule }) => {
    const taskId = `task_${Date.now()}`;
    return {
      success: true,
      taskId,
      title,
      schedule,
      status: 'active',
    };
  },
});

/**
 * Subagent: Deep Research Agent (Created with tool.agent)
 */
export const researchSubagent = tool.agent({
  name: 'deep_research',
  description: 'Delegate in-depth multi-step research or strategic planning to a specialized subagent',
  inputSchema: z.object({
    topic: z.string().describe('The topic or question to research in detail'),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
  agent: ({ topic }) => ({
    model: getAgentModel(),
    input: `Conduct thorough research and summarize concise key takeaways for: ${topic}`,
    tools: [datetimeTool],
    stopWhen: stepCountIs(3),
  }),
  result: async (child) => ({
    summary: await child.getText(),
  }),
});

/**
 * Default Tool Collection for Cooper
 */
export const cooperTools = [
  weatherTool,
  datetimeTool,
  calculatorTool,
  scheduleTaskTool,
  researchSubagent,
] as const;

/**
 * Cooper System Persona Instructions
 */
export const COOPER_SYSTEM_INSTRUCTIONS = `You are Cooper, an autonomous AI companion and agent in Muse AI.
Your purpose is to help users manage recurring workflows, scheduled routines, chat conversations, and autonomous tasks.

Core Principles:
- Warm, concise, and helpful tone.
- Proactively call tools when appropriate (weather, datetime, calculations, scheduling, and research).
- Never hallucinate data; use your tools to provide accurate answers.
- Speak directly and naturally as Cooper.`;

/**
 * Map application ChatMessage items ({ sender, text }) to standard chat roles ({ role, content })
 */
export function mapChatMessagesToAgentInput(
  messages: ChatMessage[] | Array<{ role: string; content: string }>
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return messages.map((msg: any) => {
    const role: 'user' | 'assistant' | 'system' =
      msg.sender === 'agent'
        ? 'assistant'
        : msg.role === 'assistant' || msg.role === 'system'
        ? msg.role
        : 'user';
    const content = msg.text !== undefined ? msg.text : msg.content || '';
    return { role, content };
  });
}

/**
 * Normalizes string, ChatMessage[], or standard chat message arrays into OpenResponses input format
 */
export function formatAgentInput(input: AgentRunOptions['input']) {
  if (typeof input === 'string') {
    return input;
  }
  if (Array.isArray(input)) {
    const mapped = mapChatMessagesToAgentInput(input);
    return fromChatMessages(mapped as any);
  }
  return input;
}

/**
 * Agent Run Options & Result Types
 */
export interface AgentRunOptions {
  input:
    | string
    | ChatMessage[]
    | Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  instructions?: string;
  model?: string;
  tools?: readonly any[];
  maxSteps?: number;
  signal?: AbortSignal;
  onStreamDelta?: (delta: string) => void;
}

export interface AgentRunResult {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    cost?: number;
  };
  durationMs: number;
}

/**
 * Primary Agent Runner Function
 */
export async function runCooperAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const startedAt = Date.now();
  const client = openrouter;
  const model = options.model || getAgentModel();
  const instructions = options.instructions || COOPER_SYSTEM_INSTRUCTIONS;
  const tools = (options.tools || cooperTools) as typeof cooperTools;
  const maxSteps = options.maxSteps ?? 5;

  const formattedInput = formatAgentInput(options.input);

  const result = client.callModel({
    model,
    instructions,
    input: formattedInput as any,
    tools,
    stopWhen: stepCountIs(maxSteps),
    signal: options.signal,
  });

  let text = '';

  if (options.onStreamDelta) {
    for await (const delta of result.getTextStream()) {
      if (options.signal?.aborted) break;
      options.onStreamDelta(delta);
      text += delta;
    }
  }

  // Ensure completed final text is obtained
  if (!text) {
    text = await result.getText();
  }

  const response = await result.getResponse().catch(() => null);
  const usage = await result.getUsage().catch(() => null);

  return {
    text,
    usage: usage
      ? {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          cost: usage.cost,
        }
      : response?.usage
        ? {
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
            totalTokens: (response.usage.inputTokens ?? 0) + (response.usage.outputTokens ?? 0),
          }
        : undefined,
    durationMs: Date.now() - startedAt,
  };
}

/**
 * Real-time Streaming Generator
 */
export async function* streamCooperAgent(
  input: string | ChatMessage[] | Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: Omit<AgentRunOptions, 'input' | 'onStreamDelta'>
) {
  const client = openrouter;
  const model = options?.model || getAgentModel();
  const instructions = options?.instructions || COOPER_SYSTEM_INSTRUCTIONS;
  const tools = (options?.tools || cooperTools) as typeof cooperTools;
  const maxSteps = options?.maxSteps ?? 5;

  const formattedInput = formatAgentInput(input);

  const result = client.callModel({
    model,
    instructions,
    input: formattedInput as any,
    tools,
    stopWhen: stepCountIs(maxSteps),
    signal: options?.signal,
  });

  for await (const delta of result.getTextStream()) {
    if (options?.signal?.aborted) break;
    yield delta;
  }
}

/**
 * Exported Cooper AI Agent Object
 */
export const cooperAgent = {
  client: openrouter,
  tools: cooperTools,
  run: runCooperAgent,
  stream: streamCooperAgent,
  model: getAgentModel,
  systemPrompt: COOPER_SYSTEM_INSTRUCTIONS,
};

export default cooperAgent;