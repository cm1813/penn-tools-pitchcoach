import type { User, UserId, UserType } from "../types/index.js";

export interface CreateUserInput {
  id: UserId; // caller provides the UUID
  type: UserType;
}

export interface UpdateProfileInput {
  name?: string;
  pennId?: string;
}

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  /** Find a user by their UPenn identifier (set after SSO login). */
  findByPennId(pennId: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  /** Update profile fields on an existing user. Returns the updated user. */
  updateProfile(id: UserId, input: UpdateProfileInput): Promise<User>;
}
