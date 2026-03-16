// ─────────────────────────────────────────────────────────────────────────────
// Anthropic adapter
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  LLMMessage,
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
} from "@penntools/core/llm";

export class AnthropicAdapter implements LLMProvider {
  readonly providerName = "anthropic";

  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(apiKey: string, defaultModel = "claude-sonnet-4-6") {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const anthropic = new Anthropic({ apiKey: this.apiKey });
    const model = request.model ?? this.defaultModel;

    const systemPrompt =
      request.systemPrompt ??
      (request.messages[0]?.role === "system"
        ? request.messages[0].content
        : undefined);

    const messages: LLMMessage[] = systemPrompt
      ? request.messages.filter((m) => m.role !== "system")
      : request.messages;

    const response = await anthropic.messages.create({
      model,
      max_tokens: request.maxTokens ?? 1024,
      ...(request.temperature !== undefined && {
        temperature: request.temperature,
      }),
      ...(systemPrompt && { system: systemPrompt }),
      messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const content = textBlock?.type === "text" ? textBlock.text : "";

    return {
      content,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  async *stream(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const anthropic = new Anthropic({ apiKey: this.apiKey });
    const model = request.model ?? this.defaultModel;

    const systemPrompt =
      request.systemPrompt ??
      (request.messages[0]?.role === "system"
        ? request.messages[0].content
        : undefined);

    const messages: LLMMessage[] = systemPrompt
      ? request.messages.filter((m) => m.role !== "system")
      : request.messages;

    const stream = anthropic.messages.stream({
      model,
      max_tokens: request.maxTokens ?? 1024,
      ...(request.temperature !== undefined && {
        temperature: request.temperature,
      }),
      ...(systemPrompt && { system: systemPrompt }),
      messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield { delta: event.delta.text, done: false };
      }
    }

    yield { delta: "", done: true };
  }
}
