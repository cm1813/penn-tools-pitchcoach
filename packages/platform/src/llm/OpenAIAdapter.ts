// ─────────────────────────────────────────────────────────────────────────────
// OpenAI adapter
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from "openai";
import type {
  LLMProvider,
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
} from "@penntools/core/llm";

export class OpenAIAdapter implements LLMProvider {
  readonly providerName = "openai";

  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey: string, defaultModel = "gpt-4o") {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const openai = new OpenAI({ apiKey: this.apiKey });
    const model = request.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }

    for (const m of request.messages) {
      if (m.role === "system" && request.systemPrompt) continue;
      messages.push({ role: m.role, content: m.content });
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
      ...(request.maxTokens !== undefined && { max_tokens: request.maxTokens }),
      ...(request.temperature !== undefined && {
        temperature: request.temperature,
      }),
    });

    const content = response.choices[0]?.message.content ?? "";

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }

  async *stream(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const openai = new OpenAI({ apiKey: this.apiKey });
    const model = request.model ?? this.defaultModel;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }

    for (const m of request.messages) {
      if (m.role === "system" && request.systemPrompt) continue;
      messages.push({ role: m.role, content: m.content });
    }

    const stream = await openai.chat.completions.create({
      model,
      messages,
      ...(request.maxTokens !== undefined && { max_tokens: request.maxTokens }),
      ...(request.temperature !== undefined && {
        temperature: request.temperature,
      }),
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta.content ?? "";
      if (delta) {
        yield { delta, done: false };
      }
    }

    yield { delta: "", done: true };
  }
}
