// GET /api/me — returns the current user's profile
//
// Used by the frontend to display user info (name, pennId, etc.).
// Returns 200 with the user object. name and pennId are null for
// anonymous (not-yet-logged-in) users.

import { NextResponse } from "next/server";
import { resolveIdentity } from "@/lib/resolveIdentity";
import { repositories } from "@/lib/container";

export async function GET(): Promise<NextResponse> {
  const { userId } = await resolveIdentity();
  const user = await repositories.users.findById(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    type: user.type,
    name: user.name,
    pennId: user.pennId,
  });
}
