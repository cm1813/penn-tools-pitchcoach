import type { ChatRepository, CreateChatInput, UpdateChatInput } from "@penntools/core/repositories";
import type { Chat, ChatId, UserId } from "@penntools/core/types";
import { v4 as uuidv4 } from "uuid";

export class InMemoryChatRepository implements ChatRepository {
  private readonly store = new Map<ChatId, Chat>();

  async findById(id: ChatId): Promise<Chat | null> {
    return this.store.get(id) ?? null;
  }

  async findAllByUser(userId: UserId): Promise<Chat[]> {
    return Array.from(this.store.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async create(input: CreateChatInput): Promise<Chat> {
    const now = new Date();
    const chat: Chat = { id: uuidv4(), userId: input.userId, title: input.title, createdAt: now, updatedAt: now };
    this.store.set(chat.id, chat);
    return chat;
  }

  async update(id: ChatId, input: UpdateChatInput): Promise<Chat> {
    const chat = this.store.get(id);
    if (!chat) throw new Error(`Chat ${id} not found`);
    const updated = { ...chat, ...(input.title !== undefined && { title: input.title }), updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: ChatId): Promise<void> {
    this.store.delete(id);
  }
}
