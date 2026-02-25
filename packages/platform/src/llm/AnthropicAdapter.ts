// ─────────────────────────────────────────────────────────────────────────────
// Anthropic adapter — STUB
// ─────────────────────────────────────────────────────────────────────────────

import type {
  LLMProvider,
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
    // TODO: import @anthropic-ai/sdk and call anthropic.messages.create(...)
    void this.apiKey;
    return {
      content: `[Anthropic stub] Echo: ${request.messages.at(-1)?.content ?? ""}`,
      model: request.model ?? this.defaultModel,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  async *stream(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    const response = await this.complete(request);
    yield { delta: response.content, done: false };
    yield { delta: "", done: true };
  }
}
