import "server-only";
import { cookies } from "next/headers";
import { identityService } from "./container.js";
import { ANONYMOUS_USER_COOKIE } from "@penntools/core/identity";
import type { UserId } from "@penntools/core/types";

/**
 * Resolve the current user's id from cookies.
 * If no user exists, creates one and returns a Set-Cookie directive.
 *
 * @returns userId and, if newly created, the cookie value to set on the response.
 */
export async function resolveIdentity(): Promise<{
  userId: UserId;
  setCookie?: { name: string; value: string; httpOnly: boolean; path: string };
}> {
  const cookieStore = await cookies();
  const cookieMap: Record<string, string> = {};

  for (const cookie of cookieStore.getAll()) {
    cookieMap[cookie.name] = cookie.value;
  }

  const { userId, isNew } = await identityService.getOrCreateAnonymousUserId(cookieMap);

  if (isNew) {
    return {
      userId,
      setCookie: {
        name: ANONYMOUS_USER_COOKIE,
        value: userId,
        httpOnly: true,
        path: "/",
      },
    };
  }

  return { userId };
}
