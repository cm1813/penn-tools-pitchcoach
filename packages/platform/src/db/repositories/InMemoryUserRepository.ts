import type { UserRepository, CreateUserInput } from "@penntools/core/repositories";
import type { User, UserId } from "@penntools/core/types";

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<UserId, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user: User = { id: input.id, type: input.type, createdAt: new Date() };
    this.store.set(user.id, user);
    return user;
  }
}
