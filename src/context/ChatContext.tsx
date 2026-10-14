/**
 * ChatContext.tsx
 *
 * Centralized Chat state manager for Cooper AI companion:
 * - Syncs with Supabase: `user`, `chat_threads`, `chat_messages`
 * - Manages active thread, thread history, and messages
 * - Handles optimistic updates, persistence, and AI response orchestration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CreateNewThread,
  getMainThread,
  getUserThreads,
  getThread,
  saveChatMessage,
  getThreadMessages,
  updateThreadTitle,
  deleteThread,
  clearThreadMessages,
  deleteAllSideThreads,
} from '@/services/chatHistory';
import { runCooperAgent } from '@/lib/openrouterAiAgent';
import { ChatMessage, ChatThread, DbChatMessage } from '@/types';
import { showToast } from '@/context/ToastContext';

interface ChatContextType {
  userEmail: string | null;
  threads: ChatThread[];
  activeThread: ChatThread | null;
  activeThreadId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isFetchingMessages: boolean;
  createNewChat: (title?: string) => Promise<ChatThread | null>;
  selectThread: (threadId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearCurrentChat: () => Promise<void>;
  deleteCurrentChat: () => Promise<void>;
  deleteChatById: (threadId: string) => Promise<void>;
  clearAllSideChats: () => Promise<void>;
  refreshThreads: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  // Map database message rows to ChatMessage UI model
  const mapDbToChatMessage = (dbMsg: DbChatMessage): ChatMessage => ({
    id: String(dbMsg.id),
    sender: dbMsg.role === 'assistant' ? 'agent' : 'user',
    text: dbMsg.content,
    timestamp: new Date(dbMsg.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    metadata: dbMsg.metadata,
  });

  // 1. Fetch user session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email ?? null;
        setUserEmail(email);
      } catch (err) {
        console.error('ChatContext: Error fetching session:', err);
      }
    };

    fetchSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch all user threads
  const refreshThreads = useCallback(async () => {
    if (!userEmail) return;
    try {
      const userThreads = await getUserThreads(userEmail);
      setThreads(userThreads);
    } catch (err) {
      console.error('ChatContext: Error refreshing threads:', err);
    }
  }, [userEmail]);

  // 3. Load messages for a given thread
  const loadThreadMessages = useCallback(async (threadId: string) => {
    setIsFetchingMessages(true);
    try {
      const dbMsgs = await getThreadMessages(threadId);
      const mapped = dbMsgs.map(mapDbToChatMessage);
      setMessages(mapped);
    } catch (err) {
      console.error('ChatContext: Error loading messages:', err);
      setMessages([]);
    } finally {
      setIsFetchingMessages(false);
    }
  }, []);

  // 4. Initialize Main Thread when userEmail is ready
  useEffect(() => {
    if (!userEmail) return;

    const initChat = async () => {
      try {
        // Fetch existing threads
        const userThreads = await getUserThreads(userEmail);
        setThreads(userThreads);

        // Find or create Main Thread
        let main = await getMainThread(userEmail);
        if (!main) {
          main = await CreateNewThread(userEmail, 'main', 'Main Chat');
          setThreads((prev) => [main!, ...prev]);
        }

        setActiveThread(main);
        if (main?.id) {
          await loadThreadMessages(main.id);
        }
      } catch (err) {
        console.error('ChatContext: Error initializing chat:', err);
      }
    };

    initChat();
  }, [userEmail, loadThreadMessages]);

  // 5. Select a thread
  const selectThread = useCallback(
    async (threadId: string) => {
      if (activeThread?.id === threadId) return;

      try {
        let target = threads.find((t) => t.id === threadId);
        if (!target) {
          const fetched = await getThread(threadId);
          if (fetched) target = fetched;
        }

        if (target) {
          setActiveThread(target);
          await loadThreadMessages(target.id);
        }
      } catch (err) {
        console.error('ChatContext: Error selecting thread:', err);
      }
    },
    [activeThread, threads, loadThreadMessages]
  );

  // 6. Create New Chat (Side thread)
  const createNewChat = useCallback(
    async (title?: string): Promise<ChatThread | null> => {
      if (!userEmail) return null;

      try {
        const newThread = await CreateNewThread(userEmail, 'side', title || 'New Chat');
        setThreads((prev) => [newThread, ...prev]);
        setActiveThread(newThread);
        setMessages([]);
        showToast('New chat started');
        return newThread;
      } catch (err) {
        console.error('ChatContext: Error creating new chat:', err);
        showToast('Failed to create new chat');
        return null;
      }
    },
    [userEmail]
  );

  // 7. Send message & save conversation in Supabase
  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || isLoading || !userEmail || !activeThread) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const agentMsgId = `agent-${Date.now()}`;
      const placeholderAgentMsg: ChatMessage = {
        id: agentMsgId,
        sender: 'agent',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
        statusMessage: 'Thinking...',
      };

      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, placeholderAgentMsg]);
      setIsLoading(true);

      // Async save user message to Supabase
      saveChatMessage(activeThread.id, userEmail, 'user', cleanText).catch((err) =>
        console.error('Error saving user message to Supabase:', err)
      );

      // Auto-update thread title if it's currently generic
      if (
        (activeThread.title === 'New Chat' || activeThread.title === 'Main Chat' || messages.length === 0) &&
        activeThread.type === 'side'
      ) {
        const dynamicTitle = cleanText.length > 30 ? cleanText.slice(0, 30) + '...' : cleanText;
        updateThreadTitle(activeThread.id, dynamicTitle).then((updated) => {
          if (updated) {
            setActiveThread(updated);
            setThreads((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }
        });
      }

      console.log('==================================================');
      console.log('[ChatContext] 📨 User sent message:', cleanText);
      console.log('[ChatContext] 🧵 Active Thread:', activeThread.id, `(${activeThread.title})`);
      console.log('[ChatContext] ⏳ Invoking runCooperAgent with streaming & total messages:', nextMessages.length);

      let accumulatedText = '';

      try {
        const result = await runCooperAgent({
          input: nextMessages,
          onToolActivity: (activityText: string) => {
            console.log('[ChatContext] 🛠️ Tool Activity Update:', activityText);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId
                  ? { ...m, statusMessage: activityText }
                  : m
              )
            );
          },
          onStreamDelta: (delta: string) => {
            accumulatedText += delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === agentMsgId
                  ? { ...m, text: accumulatedText, statusMessage: undefined }
                  : m
              )
            );
          },
        });

        const finalAgentText = (result.text || accumulatedText || "I'm here to help!").trim();

        console.log('[ChatContext] ✅ Agent response received successfully!');
        console.log('[ChatContext] 📝 Response length:', finalAgentText.length);
        console.log('[ChatContext] ⏱️ Duration:', `${result.durationMs}ms`);
        console.log('==================================================');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  text: finalAgentText,
                  isStreaming: false,
                  statusMessage: undefined,
                  metadata: {
                    usage: result.usage,
                    durationMs: result.durationMs,
                  },
                }
              : m
          )
        );

        // Save agent response to Supabase
        await saveChatMessage(activeThread.id, userEmail, 'assistant', finalAgentText, {
          usage: result.usage,
          durationMs: result.durationMs,
        });
      } catch (agentError: any) {
        console.error('==================================================');
        console.error('[ChatContext] ❌ Cooper Agent encountered an error:', {
          message: agentError?.message,
          status: agentError?.status,
          stack: agentError?.stack,
          error: agentError,
        });
        console.error('==================================================');
        showToast('Error getting AI response');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMsgId
              ? {
                  ...m,
                  isStreaming: false,
                  statusMessage: undefined,
                  text: `Sorry, I had trouble connecting: ${agentError?.message || 'Please check network and API keys.'}`,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, userEmail, activeThread, messages]
  );

  // 8. Clear current chat messages
  const clearCurrentChat = useCallback(async () => {
    if (!activeThread) return;
    try {
      await clearThreadMessages(activeThread.id);
      setMessages([]);
      showToast('Conversation cleared');
    } catch (err) {
      console.error('ChatContext: Error clearing messages:', err);
      showToast('Failed to clear conversation');
    }
  }, [activeThread]);

  // 9. Delete current chat thread (only for side chats)
  const deleteCurrentChat = useCallback(async () => {
    if (!activeThread || !userEmail) return;

    try {
      const threadToDelete = activeThread;
      await deleteThread(threadToDelete.id);
      setThreads((prev) => prev.filter((t) => t.id !== threadToDelete.id));

      // Switch back to Main Thread
      const main = await getMainThread(userEmail);
      if (main) {
        setActiveThread(main);
        await loadThreadMessages(main.id);
      } else {
        const newMain = await CreateNewThread(userEmail, 'main', 'Main Chat');
        setActiveThread(newMain);
        setMessages([]);
      }
      showToast('Chat deleted');
    } catch (err) {
      console.error('ChatContext: Error deleting chat:', err);
      showToast('Failed to delete chat');
    }
  }, [activeThread, userEmail, loadThreadMessages]);

  // 10. Delete a specific thread by ID (whether active or inactive)
  const deleteChatById = useCallback(
    async (threadId: string) => {
      if (!userEmail) return;

      try {
        const isCurrentActive = activeThread?.id === threadId;
        await deleteThread(threadId);
        setThreads((prev) => prev.filter((t) => t.id !== threadId));

        if (isCurrentActive) {
          // Switch back to Main Thread
          const main = await getMainThread(userEmail);
          if (main) {
            setActiveThread(main);
            await loadThreadMessages(main.id);
          } else {
            const newMain = await CreateNewThread(userEmail, 'main', 'Main Chat');
            setActiveThread(newMain);
            setMessages([]);
          }
        }
        showToast('Chat deleted');
      } catch (err) {
        console.error('ChatContext: Error deleting chat by id:', err);
        showToast('Failed to delete chat');
      }
    },
    [userEmail, activeThread, loadThreadMessages]
  );

  // 11. Clear all side chats
  const clearAllSideChats = useCallback(async () => {
    if (!userEmail) return;

    try {
      await deleteAllSideThreads(userEmail);
      setThreads((prev) => prev.filter((t) => t.type === 'main'));

      // If active thread was a side chat, switch back to Main Thread
      if (activeThread?.type === 'side') {
        const main = await getMainThread(userEmail);
        if (main) {
          setActiveThread(main);
          await loadThreadMessages(main.id);
        } else {
          const newMain = await CreateNewThread(userEmail, 'main', 'Main Chat');
          setActiveThread(newMain);
          setMessages([]);
        }
      }
      showToast('All side chats cleared');
    } catch (err) {
      console.error('ChatContext: Error clearing all side chats:', err);
      showToast('Failed to clear side chats');
    }
  }, [userEmail, activeThread, loadThreadMessages]);

  return (
    <ChatContext.Provider
      value={{
        userEmail,
        threads,
        activeThread,
        activeThreadId: activeThread?.id ?? null,
        messages,
        isLoading,
        isFetchingMessages,
        createNewChat,
        selectThread,
        sendMessage,
        clearCurrentChat,
        deleteCurrentChat,
        deleteChatById,
        clearAllSideChats,
        refreshThreads,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
