import type { MessageRepository, CreateMessageInput } from "@penntools/core/repositories";
import type { Message, MessageId, ChatId, MessageRole } from "@penntools/core/types";
import type { PrismaClient } from "@prisma/client";
import { MessageRole as PrismaRole } from "@prisma/client";

function toRole(role: PrismaRole): MessageRole {
  const map: Record<PrismaRole, MessageRole> = {
    USER: "user",
    ASSISTANT: "assistant",
    TOOL: "tool",
  };
  return map[role];
}

function toPrismaRole(role: MessageRole): PrismaRole {
  const map: Record<MessageRole, PrismaRole> = {
    user: PrismaRole.USER,
    assistant: PrismaRole.ASSISTANT,
    tool: PrismaRole.TOOL,
  };
  return map[role];
}

function toMessage(record: {
  id: string;
  chatId: string;
  userId: string;
  role: PrismaRole;
  content: string;
  toolId: string | null;
  createdAt: Date;
}): Message {
  return {
    id: record.id,
    chatId: record.chatId,
    userId: record.userId,
    role: toRole(record.role),
    content: record.content,
    toolId: record.toolId,
    createdAt: record.createdAt,
  };
}

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: MessageId): Promise<Message | null> {
    const record = await this.db.message.findUnique({ where: { id } });
    return record ? toMessage(record) : null;
  }

  async findByChatId(chatId: ChatId): Promise<Message[]> {
    const records = await this.db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    return records.map(toMessage);
  }

  async create(input: CreateMessageInput): Promise<Message> {
    const record = await this.db.message.create({
      data: {
        chatId: input.chatId,
        userId: input.userId,
        role: toPrismaRole(input.role),
        content: input.content,
        toolId: input.toolId ?? null,
      },
    });
    return toMessage(record);
  }

  async deleteByChatId(chatId: ChatId): Promise<void> {
    await this.db.message.deleteMany({ where: { chatId } });
  }
}
