// ─────────────────────────────────────────────────────────────────────────────
// Shared domain types
// These are pure data shapes with no runtime dependencies — safe to import
// everywhere (web, platform, tools).
// ─────────────────────────────────────────────────────────────────────────────

export type UserId = string; // UUID

export type UserType = "anonymous" | "authenticated";

export interface User {
  id: UserId;
  type: UserType;
  createdAt: Date;
  /** Display name — null until the user logs in via SSO. */
  name: string | null;
  /**
   * UPenn identifier (e.g. pennid / eppn) from SSO.
   * Null for anonymous users; set when linkToAuthenticatedUser is called.
   */
  pennId: string | null;
}

// ── Chat ────────────────────────────────────────────────────────────────────

export type ChatId = string;

export interface Chat {
  id: ChatId;
  userId: UserId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Message ─────────────────────────────────────────────────────────────────

export type MessageId = string;

export type MessageRole = "user" | "assistant" | "tool";

export interface Message {
  id: MessageId;
  chatId: ChatId;
  userId: UserId;
  role: MessageRole;
  content: string;
  /** Set when role === 'tool'; identifies which tool produced the message. */
  toolId: string | null;
  createdAt: Date;
}

// ── Tool data ────────────────────────────────────────────────────────────────

export type ToolDataId = string;

/**
 * Generic key-value store scoped to (userId, toolId).
 * json_value allows each tool to store arbitrary structured data without
 * needing its own table in early iterations.
 */
export interface ToolData {
  id: ToolDataId;
  userId: UserId;
  toolId: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonValue: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
