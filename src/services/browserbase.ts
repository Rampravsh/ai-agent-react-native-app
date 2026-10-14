/**
 * Browserbase Service
 *
 * Cloud browser automation & intelligence service:
 * - Real Chrome cloud browser session management
 * - Fetch API for extracting clean markdown from any URL (bypassing bot blockers)
 * - Web Search API for structured search results
 * - Live View / Replay URLs for observing cloud browser sessions in real-time
 */

import { Browserbase } from '@browserbasehq/sdk';

/**
 * Retrieve the Browserbase API key from environment variables
 */
export const getBrowserbaseApiKey = (): string => {
  const expoKey = process.env.EXPO_PUBLIC_BROWSERBASE_API_KEY || '';
  const nodeKey = process.env.BROWSERBASE_API_KEY || '';
  const key = (expoKey || nodeKey).trim();

  console.log('[Browserbase] 🔑 Key check:', {
    hasExpoPublicKey: Boolean(expoKey),
    expoKeyPrefix: expoKey ? `${expoKey.slice(0, 8)}...` : 'NONE',
    hasNodeKey: Boolean(nodeKey),
    resolvedKeyLength: key.length,
    isResolved: Boolean(key),
  });

  return key;
};

/**
 * Check if Browserbase is configured
 */
export const isBrowserbaseConfigured = (): boolean => {
  const key = getBrowserbaseApiKey();
  const configured = Boolean(key);
  console.log(`[Browserbase] ⚙️ isBrowserbaseConfigured: ${configured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);
  return configured;
};

/**
 * Create a Browserbase client instance
 */
export const getBrowserbaseClient = (): Browserbase => {
  const apiKey = getBrowserbaseApiKey();
  if (!apiKey) {
    console.error('[Browserbase] ❌ Error: BROWSERBASE_API_KEY / EXPO_PUBLIC_BROWSERBASE_API_KEY is missing!');
    throw new Error('BROWSERBASE_API_KEY is not configured in .env');
  }
  console.log('[Browserbase] 🌐 Client created successfully with key prefix:', apiKey.slice(0, 8) + '...');
  return new Browserbase({ apiKey });
};

/**
 * Fetch and extract clean markdown from any web page using Browserbase Fetch API
 */
export async function fetchWebPageMarkdown(url: string): Promise<string> {
  console.log('[Browserbase] 📄 fetchWebPageMarkdown started for:', url);
  const client = getBrowserbaseClient();
  try {
    console.log('[Browserbase] ⏳ Sending fetchAPI.create request to Browserbase Cloud...');
    const response = await client.fetchAPI.create({
      url,
      format: 'markdown',
    });
    console.log('[Browserbase] 📥 Fetch response received:', {
      id: response?.id,
      statusCode: response?.statusCode,
      contentType: response?.contentType,
      contentLength: typeof response?.content === 'string' ? response.content.length : 'non-string',
    });

    if (!response.content) return '';
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);
    console.log('[Browserbase] ✅ Successfully extracted markdown, length:', content.length);
    return content;
  } catch (error: any) {
    console.error('[Browserbase] ❌ Error fetching webpage:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });
    throw error;
  }
}

/**
 * Search the web using Browserbase Search API
 */
export async function searchWeb(query: string, numResults: number = 5): Promise<any> {
  console.log('[Browserbase] 🔍 searchWeb started for query:', `"${query}"`, `(limit: ${numResults})`);
  const client = getBrowserbaseClient();
  try {
    console.log('[Browserbase] ⏳ Sending search.web request to Browserbase Cloud...');
    const results = await client.search.web({
      query,
      numResults,
    });
    console.log('[Browserbase] 📥 Search response received:', {
      query: results?.query,
      requestId: results?.requestId,
      resultsFound: results?.results?.length ?? 0,
    });
    if (results?.results && results.results.length > 0) {
      results.results.forEach((r: any, idx: number) => {
        console.log(`[Browserbase]   Result #${idx + 1}:`, r.title, '->', r.url);
      });
    }
    return results;
  } catch (error: any) {
    console.error('[Browserbase] ❌ Error performing web search:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });
    throw error;
  }
}

export interface CloudSessionInfo {
  id: string;
  status: string;
  createdAt: string;
  liveViewUrl: string;
  connectUrl?: string;
  seleniumRemoteUrl?: string;
}

/**
 * Start a real Chrome browser session in Browserbase cloud
 */
export async function createCloudBrowserSession(timeoutSeconds: number = 120): Promise<CloudSessionInfo> {
  console.log('[Browserbase] 🚀 createCloudBrowserSession started with auto-timeout:', `${timeoutSeconds}s`);
  const client = getBrowserbaseClient();
  try {
    console.log('[Browserbase] ⏳ Sending sessions.create request to Browserbase Cloud...');
    const session = await client.sessions.create({
      keepAlive: false,
      api_timeout: Math.max(60, Math.min(timeoutSeconds, 600)), // enforce short auto-timeout (default 2 mins)
    });

    const liveViewUrl = `https://www.browserbase.com/sessions/${session.id}`;
    console.log('[Browserbase] ✅ Cloud session created successfully:', {
      id: session.id,
      status: session.status,
      liveViewUrl,
      connectUrl: session.connectUrl,
      expiresAt: (session as any).expiresAt,
    });

    return {
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      liveViewUrl,
      connectUrl: session.connectUrl,
      seleniumRemoteUrl: session.seleniumRemoteUrl,
    };
  } catch (error: any) {
    console.error('[Browserbase] ❌ Error creating cloud browser session:', {
      message: error?.message,
      status: error?.status,
      stack: error?.stack,
    });
    throw error;
  }
}

/**
 * Stop and release an active cloud browser session immediately in Browserbase cloud
 */
export async function stopCloudBrowserSession(sessionId: string): Promise<boolean> {
  const cleanId = sessionId?.trim();
  if (!cleanId) {
    console.warn('[Browserbase] ⚠️ stopCloudBrowserSession called with empty sessionId');
    return false;
  }

  console.log('[Browserbase] 🛑 stopCloudBrowserSession: Requesting release for session:', cleanId);
  try {
    const client = getBrowserbaseClient();
    await client.sessions.update(cleanId, {
      status: 'REQUEST_RELEASE',
    });
    console.log('[Browserbase] ✅ Session released & stopped successfully:', cleanId);
    return true;
  } catch (error: any) {
    console.error('[Browserbase] ❌ Error stopping cloud session:', {
      sessionId: cleanId,
      message: error?.message,
      status: error?.status,
    });
    return false;
  }
}

/**
 * Retrieve debug and Live View inspector URLs for an active cloud session
 */
export async function getSessionLiveView(sessionId: string): Promise<string> {
  const url = `https://www.browserbase.com/sessions/${sessionId}`;
  console.log('[Browserbase] 👁️ Live View URL for session', sessionId, ':', url);
  return url;
}

export default {
  getBrowserbaseApiKey,
  isBrowserbaseConfigured,
  getBrowserbaseClient,
  fetchWebPageMarkdown,
  searchWeb,
  createCloudBrowserSession,
  stopCloudBrowserSession,
  getSessionLiveView,
};

