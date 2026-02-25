// ─────────────────────────────────────────────────────────────────────────────
// Identity interface + types
//
// v1: Authless — every visitor gets a UUID stored in a cookie.
//     All persistence is scoped by that UUID.
//
// v2 (UPenn SSO): The UPenn user's sub/eppn maps to the same UUID via a
//     lookup table, so historic data is preserved.  The IdentityService
//     interface keeps this migration path open without changing call sites.
//
// Multi-user readiness without real auth:
//   - getOrCreateAnonymousUserId() creates a UUID on first visit and stores it
//     in an HTTP-only cookie (server) or localStorage (client fallback).
//   - Every repository query receives userId as an explicit parameter — there
//     are no implicit "current user" globals.
//   - When UPenn SSO is added, replace the cookie UUID with the SSO sub after
//     linking the two in a users table.  All historical records stay intact
//     because they're keyed by the UUID, not by an email/pennid.
// ─────────────────────────────────────────────────────────────────────────────

import type { UserId, User } from "../types/index.js";

export interface IdentityService {
  /**
   * Returns the current userId from the incoming request context.
   * If none exists, creates a new anonymous user and returns their id.
   *
   * @param cookies - Parsed cookies from the request (string map).
   *                  Platform implementation reads/writes the cookie value.
   */
  getOrCreateAnonymousUserId(
    cookies: Record<string, string>
  ): Promise<{ userId: UserId; isNew: boolean }>;

  /**
   * Resolve a userId to a User record.
   * Returns null if the user has been deleted or the id is invalid.
   */
  getUser(userId: UserId): Promise<User | null>;

  /**
   * Extension point: link an anonymous UUID to an authenticated identity.
   * Implemented in v2 when UPenn SSO is added.
   * Noop in v1 — throws a NotImplementedError.
   */
  linkToAuthenticatedUser(
    anonymousId: UserId,
    authenticatedId: string
  ): Promise<UserId>;
}

/** Cookie name used to persist the anonymous user id. */
export const ANONYMOUS_USER_COOKIE = "penntools_uid";
