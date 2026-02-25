// GET /api/chats  — list all chats for the current user
// POST /api/chats — handled in /api/chats/new/route.ts (kept separate for clarity)

import { NextResponse } from "next/server";
import { resolveIdentity } from "@/lib/resolveIdentity";
import { repositories } from "@/lib/container";

export async function GET(): Promise<NextResponse> {
  const { userId } = await resolveIdentity();
  const chats = await repositories.chats.findAllByUser(userId);
  return NextResponse.json({ chats });
}
