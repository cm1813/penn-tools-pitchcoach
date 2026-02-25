import type { User, UserId, UserType } from "../types/index.js";

export interface CreateUserInput {
  id: UserId; // caller provides the UUID
  type: UserType;
}

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
