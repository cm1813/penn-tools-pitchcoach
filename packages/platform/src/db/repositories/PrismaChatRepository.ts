import type { ChatRepository, CreateChatInput, UpdateChatInput } from "@penntools/core/repositories";
import type { Chat, ChatId, UserId } from "@penntools/core/types";
import type { PrismaClient } from "@prisma/client";

/** Maps a Prisma Chat record to the core Chat domain type. */
function toChat(record: {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}): Chat {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaChatRepository implements ChatRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ChatId): Promise<Chat | null> {
    const record = await this.db.chat.findUnique({ where: { id } });
    return record ? toChat(record) : null;
  }

  async findAllByUser(userId: UserId): Promise<Chat[]> {
    const records = await this.db.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return records.map(toChat);
  }

  async create(input: CreateChatInput): Promise<Chat> {
    const record = await this.db.chat.create({
      data: { userId: input.userId, title: input.title },
    });
    return toChat(record);
  }

  async update(id: ChatId, input: UpdateChatInput): Promise<Chat> {
    const record = await this.db.chat.update({
      where: { id },
      data: { ...(input.title !== undefined && { title: input.title }) },
    });
    return toChat(record);
  }

  async delete(id: ChatId): Promise<void> {
    await this.db.chat.delete({ where: { id } });
  }
}
