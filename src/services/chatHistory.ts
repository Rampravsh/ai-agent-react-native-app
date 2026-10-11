import { supabase } from "@/lib/supabase";
import { ChatThread, DbChatMessage } from "@/types";

export type ChatThreadType = 'main' | 'side';
export type ChatMessageRole = 'user' | 'assistant';

/**
 * Creates a new chat thread in `chat_threads` table
 */
export const CreateNewThread = async (
  userEmail: string,
  type: ChatThreadType,
  title?: string,
  threadId?: string
): Promise<ChatThread> => {
  // Ensure user exists in 'user' table to prevent foreign key constraint violations
  try {
    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('user').insert([
        {
          email: userEmail,
          name: userEmail.split('@')[0],
        },
      ]);
    }
  } catch (e) {
    console.warn('User table sync check:', e);
  }

  const payload: Record<string, any> = {
    user_email: userEmail,
    type: type,
    title: title || (type === 'main' ? 'Main Chat' : 'New Chat'),
  };
  if (threadId) {
    payload.id = threadId;
  }

  const { data, error } = await supabase
    .from('chat_threads')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as ChatThread;
};

/**
 * Retrieves the main thread for a user, or null if none exists
 */
export const getMainThread = async (userEmail: string): Promise<ChatThread | null> => {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_email', userEmail)
    .eq('type', 'main')
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) throw error;
  return data as ChatThread | null;
};

/**
 * Retrieves all threads belonging to a user, ordered by newest first
 */
export const getUserThreads = async (userEmail: string): Promise<ChatThread[]> => {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user threads:', error);
    throw error;
  }
  return (data || []) as ChatThread[];
};

/**
 * Retrieves a specific thread by its ID
 */
export const getThread = async (threadId: string): Promise<ChatThread | null> => {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();

  if (error) throw error;
  return data as ChatThread | null;
};

/**
 * Retrieves the latest thread for a user
 */
export const getLatestThread = async (userEmail: string): Promise<ChatThread | null> => {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ChatThread | null;
};

/**
 * Updates thread title (e.g. after user's first prompt)
 */
export const updateThreadTitle = async (threadId: string, title: string): Promise<ChatThread | null> => {
  const { data, error } = await supabase
    .from('chat_threads')
    .update({ title })
    .eq('id', threadId)
    .select()
    .single();

  if (error) {
    console.error('Error updating thread title:', error);
  }
  return data as ChatThread | null;
};

/**
 * Deletes a thread and its messages
 */
export const deleteThread = async (threadId: string): Promise<boolean> => {
  try {
    // Delete messages first to maintain relational integrity
    await supabase.from('chat_messages').delete().eq('thread_id', threadId);
    const { error } = await supabase.from('chat_threads').delete().eq('id', threadId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting thread:', err);
    return false;
  }
};

/**
 * Saves a single chat message (user or agent) into `chat_messages` table
 */
export const saveChatMessage = async (
  threadId: string,
  userEmail: string,
  role: ChatMessageRole,
  content: string,
  metadata?: Record<string, any>
): Promise<DbChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      {
        thread_id: threadId,
        user_email: userEmail,
        role: role,
        content: content,
        metadata: metadata || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
  return data as DbChatMessage;
};

/**
 * Retrieves all messages for a given thread, ordered chronologically
 */
export const getThreadMessages = async (threadId: string): Promise<DbChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching thread messages:', error);
    throw error;
  }
  return (data || []) as DbChatMessage[];
};

/**
 * Clears all messages from a thread
 */
export const clearThreadMessages = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('chat_messages').delete().eq('thread_id', threadId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error clearing thread messages:', err);
    return false;
  }
};