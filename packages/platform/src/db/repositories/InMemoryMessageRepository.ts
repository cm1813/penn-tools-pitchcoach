import type { MessageRepository, CreateMessageInput } from "@penntools/core/repositories";
import type { Message, MessageId, ChatId } from "@penntools/core/types";
import { v4 as uuidv4 } from "uuid";

export class InMemoryMessageRepository implements MessageRepository {
  private readonly store = new Map<MessageId, Message>();

  async findById(id: MessageId): Promise<Message | null> {
    return this.store.get(id) ?? null;
  }

  async findByChatId(chatId: ChatId): Promise<Message[]> {
    return Array.from(this.store.values())
      .filter((m) => m.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      chatId: input.chatId,
      userId: input.userId,
      role: input.role,
      content: input.content,
      toolId: input.toolId ?? null,
      createdAt: new Date(),
    };
    this.store.set(message.id, message);
    return message;
  }

  async deleteByChatId(chatId: ChatId): Promise<void> {
    for (const [id, msg] of this.store) {
      if (msg.chatId === chatId) this.store.delete(id);
    }
  }
}
