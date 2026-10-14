/**
 * OpenRouter AI Agent - Muse AI / Cooper Companion
 *
 * Built with @openrouter/agent, supporting:
 * - Autonomous web intelligence powered by Browserbase Cloud
 * - Live web search & clean markdown page extraction
 * - Cloud Chrome session creation
 * - Streaming responses & token callbacks
 */

import { OpenRouter, tool, stepCountIs, fromChatMessages } from '@openrouter/agent';
import { z } from 'zod';
import { ChatMessage } from '@/types';
import {
  fetchWebPageMarkdown,
  searchWeb,
  createCloudBrowserSession,
  stopCloudBrowserSession,
  isBrowserbaseConfigured,
} from '@/services/browserbase';

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
 * Global or per-run tool activity listener
 */
let currentToolActivityCallback: ((activity: string) => void) | null = null;

export const setToolActivityCallback = (cb: ((activity: string) => void) | null) => {
  currentToolActivityCallback = cb;
};

/**
 * Browserbase Cloud Browsing Tool
 *
 * Allows Cooper to search the web, fetch live webpage content in clean markdown,
 * or create & release an autonomous cloud browser session.
 */
export const browserbaseTool = tool({
  name: 'browserbase_browse',
  description:
    'Browse the live web or search the internet using Browserbase cloud. Can search web queries, fetch/scrape clean markdown from any URL (bypassing bot blockers), create a cloud browser session, or stop/release an existing cloud browser session.',
  inputSchema: z.object({
    action: z
      .enum(['search', 'fetch', 'create_session', 'stop_session'])
      .describe(
        'Action to perform: "search" to search the web, "fetch" to read a webpage URL, "create_session" to launch a cloud browser session, or "stop_session" to stop/release an active session'
      ),
    query: z.string().optional().describe('Search query (required if action is "search")'),
    url: z.string().optional().describe('Full webpage URL starting with http/https (required if action is "fetch")'),
    sessionId: z.string().optional().describe('Active cloud session ID (required if action is "stop_session")'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    action: z.string(),
    data: z.any(),
    error: z.string().optional(),
  }),
  execute: async ({ action, query, url, sessionId }) => {
    console.log('==================================================');
    console.log('[Agent Tool: browserbase_browse] 🚀 AI AGENT INVOKED BROWSERBASE TOOL!');
    console.log('[Agent Tool: browserbase_browse] 📦 Action:', action);
    console.log('[Agent Tool: browserbase_browse] 📋 Params:', { query, url, sessionId });

    try {
      if (action === 'search') {
        if (!query) {
          console.warn('[Agent Tool: browserbase_browse] ⚠️ Missing query for search');
          return { success: false, action, data: null, error: 'Query is required for search' };
        }
        currentToolActivityCallback?.(`Searching web for "${query.slice(0, 35)}..."`);
        console.log('[Agent Tool: browserbase_browse] 🔍 Running searchWeb for:', `"${query}"`);
        const results = await searchWeb(query, 5);
        console.log('[Agent Tool: browserbase_browse] ✅ Search returned', results?.results?.length ?? 0, 'results');
        console.log('==================================================');
        return { success: true, action, data: results };
      }

      if (action === 'fetch') {
        if (!url) {
          console.warn('[Agent Tool: browserbase_browse] ⚠️ Missing url for fetch');
          return { success: false, action, data: null, error: 'URL is required for fetch' };
        }
        currentToolActivityCallback?.(`Reading webpage: ${url.replace(/^https?:\/\//, '').slice(0, 30)}...`);
        console.log('[Agent Tool: browserbase_browse] 📄 Running fetchWebPageMarkdown for:', url);
        const markdown = await fetchWebPageMarkdown(url);
        console.log('[Agent Tool: browserbase_browse] ✅ Fetched markdown length:', markdown.length);
        // Truncate to reasonable token limit so it doesn't overload context
        const truncated =
          markdown.length > 3500
            ? `${markdown.slice(0, 3500)}\n\n...(content truncated for brevity)`
            : markdown;
        console.log('==================================================');
        return { success: true, action, data: { url, content: truncated } };
      }

      if (action === 'create_session') {
        currentToolActivityCallback?.('Launching Cloud Chrome Browser session...');
        console.log('[Agent Tool: browserbase_browse] 🖥️ Launching Browserbase Cloud Session...');
        const session = await createCloudBrowserSession(120);
        console.log('[Agent Tool: browserbase_browse] ✅ Session ready:', {
          id: session.id,
          liveViewUrl: session.liveViewUrl,
        });
        console.log('==================================================');
        return {
          success: true,
          action,
          data: {
            sessionId: session.id,
            liveViewUrl: session.liveViewUrl,
            status: session.status,
          },
        };
      }

      if (action === 'stop_session') {
        if (!sessionId) {
          console.warn('[Agent Tool: browserbase_browse] ⚠️ Missing sessionId for stop_session');
          return { success: false, action, data: null, error: 'sessionId is required for stop_session' };
        }
        currentToolActivityCallback?.('Closing Cloud Browser session...');
        console.log('[Agent Tool: browserbase_browse] 🛑 Releasing Browserbase session:', sessionId);
        const stopped = await stopCloudBrowserSession(sessionId);
        console.log('[Agent Tool: browserbase_browse] ✅ Session release result:', stopped);
        console.log('==================================================');
        return { success: stopped, action, data: { sessionId, stopped } };
      }

      console.warn('[Agent Tool: browserbase_browse] ⚠️ Unknown action requested:', action);
      return { success: false, action, data: null, error: 'Unknown action' };
    } catch (err: any) {
      console.error('[Agent Tool: browserbase_browse] ❌ Execution Error:', {
        message: err?.message,
        stack: err?.stack,
        details: err,
      });
      console.log('==================================================');
      return { success: false, action, data: null, error: err?.message || 'Browsing failed' };
    }
  },
});

/**
 * Default Tool Collection for Cooper
 */
export const cooperTools = [browserbaseTool] as const;

/**
 * Dynamic Cooper System Persona Instructions with Real-World Date & Time
 */
export function getCooperSystemInstructions(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const year = now.getFullYear();
  const month = now.toLocaleDateString('en-US', { month: 'long' });

  return `You are Cooper, an intelligent, friendly AI companion and autonomous agent in Muse AI.
Your purpose is to assist users with their questions, tasks, workflows, writing, problem-solving, and live web investigations.

CURRENT REAL-WORLD DATE & TEMPORAL CONTEXT:
- Today is: ${dateStr}.
- Current Year: ${year}.
- Current Month: ${month}.
- CRITICAL SEARCH RULE: Whenever asked for "current", "latest", "top", "upcoming", or new products, tech specs, prices, or news, ALWAYS use the current year (${year}) and relevant current month in your search queries. NEVER use outdated years (e.g. 2024 or 2025) or past months (like June) unless the user explicitly requests historical data.

You have access to the Browserbase cloud tool (\`browserbase_browse\`) which lets you:
1. Search the live internet for recent news, facts, products, and queries (action: "search").
2. Fetch and read the full content of any URL or website in clean markdown (action: "fetch").
3. Launch an interactive cloud Chrome browser session (action: "create_session").
4. Stop/release a cloud browser session when done to avoid lingering sessions (action: "stop_session", requires sessionId).

Core Presentation & Formatting Rules:
- Format all responses in clean, structured, beautiful Markdown.
- Use distinct headings (###), bold key terms (**term**), and bullet lists (- item) or numbered steps (1. item).
- When mentioning products, stores, or websites, format them as clean Markdown links: [Source or Product Name](URL).
- Avoid dumping raw, messy JSON or walls of unstructured text.
- Be insightful, warm, concise, and helpful.`;
}

export const COOPER_SYSTEM_INSTRUCTIONS = getCooperSystemInstructions();

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
  onToolActivity?: (activityText: string) => void;
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
  const instructions = options.instructions || getCooperSystemInstructions();
  const tools = (options.tools !== undefined ? options.tools : cooperTools) as typeof cooperTools;
  const maxSteps = options.maxSteps ?? 5;
  const browserbaseReady = isBrowserbaseConfigured();

  // Attach tool activity listener for real-time progress callbacks
  if (options.onToolActivity) {
    setToolActivityCallback(options.onToolActivity);
  }

  console.log('==================================================');
  console.log('[CooperAgent] 🤖 runCooperAgent invoked');
  console.log('[CooperAgent] 🧠 Model:', model);
  console.log('[CooperAgent] 🔑 OpenRouter API Key configured:', Boolean(getApiKey()));
  console.log('[CooperAgent] 🌐 Browserbase configured:', browserbaseReady ? '✅ YES' : '❌ NO');
  console.log(
    '[CooperAgent] 🛠️ Tools attached:',
    browserbaseReady && tools && tools.length > 0
      ? `✅ YES (${tools.length} tool(s) registered: ${tools.map((t: any) => t.name).join(', ')})`
      : '⚠️ NO (tools disabled because Browserbase key is missing or tools array empty)'
  );
  console.log('[CooperAgent] 🛑 Max Steps limit:', maxSteps);

  const formattedInput = formatAgentInput(options.input);

  const callParams: any = {
    model,
    instructions,
    input: formattedInput as any,
    stopWhen: stepCountIs(maxSteps),
    signal: options.signal,
  };

  // Only attach tools if Browserbase is configured and tools are provided
  if (browserbaseReady && tools && tools.length > 0) {
    callParams.tools = tools;
  }

  console.log('[CooperAgent] ⏳ Calling OpenRouter callModel with params:', {
    model: callParams.model,
    hasTools: Boolean(callParams.tools),
    stopCondition: `stepCountIs(${maxSteps})`,
  });

  try {
    const result = client.callModel(callParams);

    let text = '';

    if (options.onStreamDelta) {
      console.log('[CooperAgent] 🌊 Listening to text stream deltas...');
      for await (const delta of result.getTextStream()) {
        if (options.signal?.aborted) {
          console.warn('[CooperAgent] ⚠️ Stream aborted via AbortSignal');
          break;
        }
        options.onStreamDelta(delta);
        text += delta;
      }
    }

    // Ensure completed final text is obtained
    if (!text) {
      console.log('[CooperAgent] ⏳ Waiting for result.getText()...');
      text = await result.getText();
    }

    const response = await result.getResponse().catch((err) => {
      console.warn('[CooperAgent] ⚠️ Could not fetch raw response object:', err?.message);
      return null;
    });
    const usage = await result.getUsage().catch((err) => {
      console.warn('[CooperAgent] ⚠️ Could not fetch usage object:', err?.message);
      return null;
    });

    const durationMs = Date.now() - startedAt;
    console.log('[CooperAgent] ✅ Response completed successfully!');
    console.log('[CooperAgent] 📝 Output preview:', text.slice(0, 120) + (text.length > 120 ? '...' : ''));
    console.log('[CooperAgent] ⏱️ Duration:', `${durationMs}ms`);
    console.log('[CooperAgent] 📊 Token Usage:', usage || response?.usage || 'N/A');
    console.log('==================================================');

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
      durationMs,
    };
  } catch (error: any) {
    console.error('[CooperAgent] ❌ Error in runCooperAgent:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });
    console.log('==================================================');
    throw error;
  } finally {
    setToolActivityCallback(null);
  }
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
  const tools = (options?.tools !== undefined ? options.tools : cooperTools) as typeof cooperTools;
  const maxSteps = options?.maxSteps ?? 5;
  const browserbaseReady = isBrowserbaseConfigured();

  console.log('[CooperAgent Stream] 🌊 Starting streamCooperAgent for model:', model);
  console.log('[CooperAgent Stream] 🛠️ Tools attached:', browserbaseReady ? 'YES' : 'NO');

  const formattedInput = formatAgentInput(input);

  const callParams: any = {
    model,
    instructions,
    input: formattedInput as any,
    stopWhen: stepCountIs(maxSteps),
    signal: options?.signal,
  };

  if (browserbaseReady && tools && tools.length > 0) {
    callParams.tools = tools;
  }

  const result = client.callModel(callParams);

  for await (const delta of result.getTextStream()) {
    if (options?.signal?.aborted) {
      console.warn('[CooperAgent Stream] ⚠️ Aborted stream');
      break;
    }
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