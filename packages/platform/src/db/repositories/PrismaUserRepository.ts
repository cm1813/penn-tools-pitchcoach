import type { UserRepository, CreateUserInput, UpdateProfileInput } from "@penntools/core/repositories";
import type { User, UserId, UserType } from "@penntools/core/types";
import type { PrismaClient } from "@prisma/client";
import { UserType as PrismaUserType } from "@prisma/client";

function toUserType(t: PrismaUserType): UserType {
  return t === PrismaUserType.AUTHENTICATED ? "authenticated" : "anonymous";
}

function toUser(record: {
  id: string;
  type: PrismaUserType;
  createdAt: Date;
  name: string | null;
  pennId: string | null;
}): User {
  return {
    id: record.id,
    type: toUserType(record.type),
    createdAt: record.createdAt,
    name: record.name,
    pennId: record.pennId,
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { id } });
    return record ? toUser(record) : null;
  }

  async findByPennId(pennId: string): Promise<User | null> {
    const record = await this.db.user.findUnique({ where: { pennId } });
    return record ? toUser(record) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const record = await this.db.user.create({
      data: {
        id: input.id,
        type:
          input.type === "authenticated"
            ? PrismaUserType.AUTHENTICATED
            : PrismaUserType.ANONYMOUS,
      },
    });
    return toUser(record);
  }

  async updateProfile(id: UserId, input: UpdateProfileInput): Promise<User> {
    const record = await this.db.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.pennId !== undefined && { pennId: input.pennId }),
      },
    });
    return toUser(record);
  }
}
