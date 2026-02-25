import type { Message, MessageId, ChatId, UserId, MessageRole } from "../types/index.js";

export interface CreateMessageInput {
  chatId: ChatId;
  userId: UserId;
  role: MessageRole;
  content: string;
  toolId?: string;
}

export interface MessageRepository {
  findById(id: MessageId): Promise<Message | null>;
  findByChatId(chatId: ChatId): Promise<Message[]>;
  create(input: CreateMessageInput): Promise<Message>;
  /** Hard delete — messages are never soft-deleted to keep audit trails clean. */
  deleteByChatId(chatId: ChatId): Promise<void>;
}
