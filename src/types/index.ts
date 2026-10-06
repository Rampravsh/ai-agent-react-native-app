/**
 * Muse AI Clone - Core Type Definitions & Data Contracts
 *
 * Centralized TypeScript interfaces and types for application state,
 * navigation, companion chat, scheduler tasks, ideas, and settings.
 */

/**
 * Message object representing a chat utterance in the conversation history.
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Origin of the message: 'user' for current user, 'agent' for Cooper AI, or 'system' */
  sender: 'user' | 'agent' | 'system';
  /** Plaintext or markdown formatted message content */
  text: string;
  /** Formatted timestamp display string (e.g. "3:35 PM") */
  timestamp: string;
}

/**
 * Chat topic item listed under "Side chats" in the sliding sidebar drawer.
 */
export interface SideChatItem {
  /** Unique identifier for the side chat thread */
  id: string;
  /** Title or subject of the side chat */
  title: string;
  /** Indicates whether unread updates exist in this side thread */
  hasUnreadDot?: boolean;
}

/**
 * Inspiration card template for the Ideas tab.
 */
export interface IdeaItem {
  /** Unique idea identifier */
  id: string;
  /** 3D emoji or icon representing the domain */
  icon: string;
  /** Prominent bold action title */
  title: string;
  /** Descriptive preview of what Cooper will build or research */
  description: string;
  /** Full prompt automatically loaded into chat input upon selection */
  prompt: string;
}

/**
 * Status of scheduled goals or routines.
 */
export type TaskStatus = 'active' | 'paused' | 'done';

/**
 * Scheduled goal or recurring autonomous workflow tracked in Tasks tab.
 */
export interface TaskGoalItem {
  /** Unique task identifier */
  id: string;
  /** Name of the goal or routine check */
  title: string;
  /** Frequency and time specification (e.g. "Every day @ 8:00 AM") */
  schedule: string;
  /** Current operating status */
  status: TaskStatus;
  /** Lifetime count of automated runs completed */
  runsCount: number;
}

/**
 * External workspace tool connector available in Settings.
 */
export interface ConnectorItem {
  /** Unique connector identifier */
  id: string;
  /** Tool brand name (e.g. "Google Workspace", "Notion") */
  name: string;
  /** Description of features enabled by connecting */
  description: string;
  /** Distinct brand background color for connector icon emblem */
  iconBg: string;
  /** Connection status */
  connected: boolean;
  /** Category grouping (e.g. "Productivity", "Developer", "Workspace") */
  category: string;
  /** Linked account identifier or email when active */
  accountEmail?: string;
}

/**
 * Account usage stats and quota details in Settings.
 */
export interface PlanData {
  planName: string;
  percentUsed: number;
  resetText: string;
  creditsUsed: number;
  creditsTotal: number;
  remainingCredits: number;
}

/**
 * Agent Mascot Customization parameters
 */
export interface AgentProfile {
  name: string;
  subtitle: string;
  icon: string;
  color: string;
}

/**
 * Valid navigation tab identifiers
 */
export type TabKey = 'chat' | 'feed' | 'ideas' | 'tasks' | 'settings';

/**
 * Tab dock destination item specification
 */
export interface TabItem {
  key: TabKey;
  label: string;
  route: string;
  icon: any;
}

