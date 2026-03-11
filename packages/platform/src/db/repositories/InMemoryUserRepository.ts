import type { UserRepository, CreateUserInput, UpdateProfileInput } from "@penntools/core/repositories";
import type { User, UserId } from "@penntools/core/types";

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<UserId, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByPennId(pennId: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.pennId === pennId) return user;
    }
    return null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: input.id,
      type: input.type,
      createdAt: new Date(),
      name: null,
      pennId: null,
    };
    this.store.set(user.id, user);
    return user;
  }

  async updateProfile(id: UserId, input: UpdateProfileInput): Promise<User> {
    const user = this.store.get(id);
    if (!user) throw new Error(`User not found: ${id}`);
    const updated: User = {
      ...user,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.pennId !== undefined && { pennId: input.pennId }),
    };
    this.store.set(id, updated);
    return updated;
  }
}
