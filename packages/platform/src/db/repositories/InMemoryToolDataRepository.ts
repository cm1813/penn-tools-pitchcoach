import type { ToolDataRepository, UpsertToolDataInput } from "@penntools/core/repositories";
import type { ToolData, UserId } from "@penntools/core/types";
import { v4 as uuidv4 } from "uuid";

export class InMemoryToolDataRepository implements ToolDataRepository {
  private readonly store = new Map<string, ToolData>();

  private key(userId: UserId, toolId: string, key: string) {
    return `${userId}::${toolId}::${key}`;
  }

  async get(userId: UserId, toolId: string, key: string): Promise<ToolData | null> {
    return this.store.get(this.key(userId, toolId, key)) ?? null;
  }

  async upsert(input: UpsertToolDataInput): Promise<ToolData> {
    const k = this.key(input.userId, input.toolId, input.key);
    const existing = this.store.get(k);
    const now = new Date();
    const record: ToolData = {
      id: existing?.id ?? uuidv4(),
      userId: input.userId,
      toolId: input.toolId,
      key: input.key,
      jsonValue: input.jsonValue,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.store.set(k, record);
    return record;
  }

  async deleteByUser(userId: UserId, toolId: string): Promise<void> {
    for (const [k] of this.store) {
      if (k.startsWith(`${userId}::${toolId}::`)) this.store.delete(k);
    }
  }
}
