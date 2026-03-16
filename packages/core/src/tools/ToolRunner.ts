// ─────────────────────────────────────────────────────────────────────────────
// ToolRunner
//
// Responsibilities:
//   1. List tools from the registry.
//   2. Validate a tool id before execution.
//   3. Check access permissions.
//   4. Build a ToolContext and call tool.execute().
//   5. Attach basic telemetry (duration) if the tool doesn't report its own.
//
// ToolRunner is instantiated by the platform layer (apps/web/src/lib/container)
// with concrete service implementations.  Nothing in this class imports env
// vars or vendor SDKs.
// ─────────────────────────────────────────────────────────────────────────────

import type { ToolManifest, ToolOutput } from "./Tool.js";
import type { ToolContext, Logger } from "./ToolContext.js";
import type { ToolRegistry } from "./ToolRegistry.js";
import type { UserId } from "../types/index.js";
import type { LLMProvider } from "../llm/LLMProvider.js";

// ── Errors ────────────────────────────────────────────────────────────────────

export class ToolNotFoundError extends Error {
  constructor(toolId: string) {
    super(`Tool "${toolId}" is not registered.`);
    this.name = "ToolNotFoundError";
  }
}

export class ToolAccessDeniedError extends Error {
  constructor(toolId: string, userId: UserId) {
    super(`User "${userId}" is not permitted to run tool "${toolId}".`);
    this.name = "ToolAccessDeniedError";
  }
}

// ── Runner deps ───────────────────────────────────────────────────────────────

/**
 * Dependencies the ToolRunner needs from the platform layer.
 * These are the same services that will be forwarded into ToolContext,
 * plus the registry and logger.
 */
export interface ToolRunnerDeps {
  registry: ToolRegistry;
  contextFactory: (toolId: string, userId: UserId) => ToolContext | Promise<ToolContext>;
  logger: Logger;
}

// ── ToolRunner ────────────────────────────────────────────────────────────────

export class ToolRunner {
  private readonly registry: ToolRegistry;
  private readonly contextFactory: (toolId: string, userId: UserId) => ToolContext | Promise<ToolContext>;
  private readonly logger: Logger;

  constructor(deps: ToolRunnerDeps) {
    this.registry = deps.registry;
    this.contextFactory = deps.contextFactory;
    this.logger = deps.logger;
  }

  /** Return manifests for all registered tools. */
  listTools(): ToolManifest[] {
    return this.registry.listManifests();
  }

  /**
   * Execute a tool by id.
   *
   * @throws ToolNotFoundError      if the id is not registered.
   * @throws ToolAccessDeniedError  if canAccess() returns false.
   */
  async run(
    toolId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any,
    userId: UserId,
    options?: { llm?: LLMProvider }
  ): Promise<ToolOutput> {
    const tool = this.registry.get(toolId);
    if (!tool) {
      throw new ToolNotFoundError(toolId);
    }

    if (!tool.canAccess(userId)) {
      throw new ToolAccessDeniedError(toolId, userId);
    }

    const context = await this.contextFactory(toolId, userId);
    const effectiveContext = options?.llm ? { ...context, llm: options.llm } : context;
    const start = Date.now();

    this.logger.info("tool.run.start", { toolId, userId });

    const output = await tool.execute(input, effectiveContext);

    const durationMs = Date.now() - start;
    this.logger.info("tool.run.complete", { toolId, userId, durationMs });

    // Attach timing if the tool didn't self-report telemetry.
    if (!output.telemetry) {
      output.telemetry = { durationMs };
    }

    return output;
  }
}
