// ─────────────────────────────────────────────────────────────────────────────
// OpenAI adapter — STUB
//
// Replace the TODO bodies with the openai npm package calls when ready.
// The interface contract is fully defined in @penntools/core/llm.
// ─────────────────────────────────────────────────────────────────────────────

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
    // TODO: import openai and call openai.chat.completions.create(...)
    // Example:
    //   const openai = new OpenAI({ apiKey: this.apiKey });
    //   const res = await openai.chat.completions.create({
    //     model: request.model ?? this.defaultModel,
    //     messages: request.messages,
    //     max_tokens: request.maxTokens,
    //   });
    //   return { content: res.choices[0].message.content ?? "", ... };

    void this.apiKey; // suppress unused warning in stub
    return {
      content: `[OpenAI stub] Echo: ${request.messages.at(-1)?.content ?? ""}`,
      model: request.model ?? this.defaultModel,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }

  async *stream(request: CompletionRequest): AsyncGenerator<StreamChunk> {
    // TODO: use openai streaming API
    const response = await this.complete(request);
    yield { delta: response.content, done: false };
    yield { delta: "", done: true };
  }
}
