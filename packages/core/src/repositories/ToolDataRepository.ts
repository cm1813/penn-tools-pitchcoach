import type { ToolData, UserId } from "../types/index.js";

export interface UpsertToolDataInput {
  userId: UserId;
  toolId: string;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonValue: Record<string, any>;
}

export interface ToolDataRepository {
  get(userId: UserId, toolId: string, key: string): Promise<ToolData | null>;
  upsert(input: UpsertToolDataInput): Promise<ToolData>;
  deleteByUser(userId: UserId, toolId: string): Promise<void>;
}
