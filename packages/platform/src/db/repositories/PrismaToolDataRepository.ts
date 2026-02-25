import type { ToolDataRepository, UpsertToolDataInput } from "@penntools/core/repositories";
import type { ToolData, UserId } from "@penntools/core/types";
import type { PrismaClient } from "@prisma/client";

function toToolData(record: {
  id: string;
  userId: string;
  toolId: string;
  key: string;
  jsonValue: unknown;
  createdAt: Date;
  updatedAt: Date;
}): ToolData {
  return {
    id: record.id,
    userId: record.userId,
    toolId: record.toolId,
    key: record.key,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonValue: record.jsonValue as Record<string, any>,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PrismaToolDataRepository implements ToolDataRepository {
  constructor(private readonly db: PrismaClient) {}

  async get(userId: UserId, toolId: string, key: string): Promise<ToolData | null> {
    const record = await this.db.toolData.findUnique({
      where: { userId_toolId_key: { userId, toolId, key } },
    });
    return record ? toToolData(record) : null;
  }

  async upsert(input: UpsertToolDataInput): Promise<ToolData> {
    const record = await this.db.toolData.upsert({
      where: {
        userId_toolId_key: {
          userId: input.userId,
          toolId: input.toolId,
          key: input.key,
        },
      },
      update: { jsonValue: input.jsonValue },
      create: {
        userId: input.userId,
        toolId: input.toolId,
        key: input.key,
        jsonValue: input.jsonValue,
      },
    });
    return toToolData(record);
  }

  async deleteByUser(userId: UserId, toolId: string): Promise<void> {
    await this.db.toolData.deleteMany({ where: { userId, toolId } });
  }
}
