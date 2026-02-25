// ─────────────────────────────────────────────────────────────────────────────
// AnonymousIdentityService
//
// Implements IdentityService for v1 (no real auth).
//
// Flow:
//   1. On each request, read the penntools_uid cookie.
//   2. If present and found in DB → return it.
//   3. If absent or not in DB → create a new UUID, insert into users, set
//      cookie on the response (caller must apply Set-Cookie header).
//
// The caller (Next.js route handler) is responsible for:
//   a. Parsing incoming cookies and passing them as a Record<string, string>.
//   b. Reading isNew from the result and setting the Set-Cookie header if true.
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from "uuid";
import type { IdentityService } from "@penntools/core/identity";
import { ANONYMOUS_USER_COOKIE } from "@penntools/core/identity";
import type { UserRepository } from "@penntools/core/repositories";
import type { User, UserId } from "@penntools/core/types";

export class AnonymousIdentityService implements IdentityService {
  constructor(private readonly users: UserRepository) {}

  async getOrCreateAnonymousUserId(
    cookies: Record<string, string>
  ): Promise<{ userId: UserId; isNew: boolean }> {
    const existingId = cookies[ANONYMOUS_USER_COOKIE];

    if (existingId) {
      const user = await this.users.findById(existingId);
      if (user) {
        return { userId: user.id, isNew: false };
      }
      // Cookie exists but user row is missing (e.g. DB was wiped in dev).
      // Fall through to create a new user below.
    }

    const newId = uuidv4();
    await this.users.create({ id: newId, type: "anonymous" });
    return { userId: newId, isNew: true };
  }

  async getUser(userId: UserId): Promise<User | null> {
    return this.users.findById(userId);
  }

  async linkToAuthenticatedUser(
    _anonymousId: UserId,
    _authenticatedId: string
  ): Promise<UserId> {
    // v2: look up or create an authenticated user row, create a mapping,
    //     and return the canonical userId.
    throw new Error(
      "linkToAuthenticatedUser is not implemented in v1 (authless mode)."
    );
  }
}
