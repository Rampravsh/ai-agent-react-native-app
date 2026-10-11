/**
 * OpenRouter AI Agent - Muse AI / Cooper Companion
 *
 * Lightweight, direct chat agent:
 * - Direct conversational model execution (no bloated tool schemas)
 * - Minimal token overhead for maximum response speed and cost efficiency
 * - Real-time streaming support
 * - Clean system instructions
 */

import { OpenRouter, stepCountIs, fromChatMessages } from '@openrouter/agent';
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
 * Empty Tool Collection (Zero token bloat)
 */
export const cooperTools = [] as const;

/**
 * Cooper System Persona Instructions
 */
export const COOPER_SYSTEM_INSTRUCTIONS = `You are Cooper, an intelligent, friendly AI companion and assistant in Muse AI.
Your purpose is to assist users with their questions, tasks, workflows, writing, problem-solving, and conversations.

Core Principles:
- Warm, concise, and helpful tone.
- Give direct, accurate, and insightful responses.
- Speak naturally and engagingly as Cooper.`;

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
 * Primary Agent Runner Function (Zero tool overhead)
 */
export async function runCooperAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const startedAt = Date.now();
  const client = openrouter;
  const model = options.model || getAgentModel();
  const instructions = options.instructions || COOPER_SYSTEM_INSTRUCTIONS;
  const maxSteps = options.maxSteps ?? 5;

  const formattedInput = formatAgentInput(options.input);

  const callParams: any = {
    model,
    instructions,
    input: formattedInput as any,
    stopWhen: stepCountIs(maxSteps),
    signal: options.signal,
  };

  // Only attach tools if explicitly supplied
  if (options.tools && options.tools.length > 0) {
    callParams.tools = options.tools;
  }

  const result = client.callModel(callParams);

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
  const maxSteps = options?.maxSteps ?? 5;

  const formattedInput = formatAgentInput(input);

  const callParams: any = {
    model,
    instructions,
    input: formattedInput as any,
    stopWhen: stepCountIs(maxSteps),
    signal: options?.signal,
  };

  if (options?.tools && options.tools.length > 0) {
    callParams.tools = options.tools;
  }

  const result = client.callModel(callParams);

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