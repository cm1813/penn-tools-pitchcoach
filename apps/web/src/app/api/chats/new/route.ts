// POST /api/chats/new — create a new chat session

import { NextRequest, NextResponse } from "next/server";
import { resolveIdentity } from "@/lib/resolveIdentity";
import { repositories } from "@/lib/container";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, setCookie } = await resolveIdentity();
  const body = await req.json().catch(() => ({})) as { title?: string };
  const title = body.title ?? "New chat";

  const chat = await repositories.chats.create({ userId, title });

  const response = NextResponse.json({ chat }, { status: 201 });
  if (setCookie) {
    response.cookies.set(setCookie.name, setCookie.value, {
      httpOnly: setCookie.httpOnly,
      path: setCookie.path,
    });
  }
  return response;
}
