import type { Chat, ChatId, UserId } from "../types/index.js";

export interface CreateChatInput {
  userId: UserId;
  title: string;
}

export interface UpdateChatInput {
  title?: string;
}

export interface ChatRepository {
  findById(id: ChatId): Promise<Chat | null>;
  findAllByUser(userId: UserId): Promise<Chat[]>;
  create(input: CreateChatInput): Promise<Chat>;
  update(id: ChatId, input: UpdateChatInput): Promise<Chat>;
  delete(id: ChatId): Promise<void>;
}
