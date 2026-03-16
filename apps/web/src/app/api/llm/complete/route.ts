import { NextRequest, NextResponse } from "next/server";
import { llm, createLLMFromKey } from "@/lib/container";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { prompt } = (await req.json()) as { prompt: string };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const userApiKey = req.headers.get("X-Api-Key");
  const requestLlm = userApiKey ? createLLMFromKey(userApiKey) : llm;

  const result = await requestLlm.complete({
    messages: [{ role: "user", content: prompt }],
  });

  return NextResponse.json({ content: result.content, model: result.model, usage: result.usage });
}
