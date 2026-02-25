// ─────────────────────────────────────────────────────────────────────────────
// Unit tests for CourseFinderTool + ToolRegistry discovery
//
// Key things tested:
//   1. The tool registers and can be looked up by id.
//   2. execute() returns the required output shape.
//   3. canAccess() defaults to true for all users.
//
// All platform services are stubbed — no DB or LLM calls in unit tests.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ToolRegistry } from "@penntools/core/tools";
import { NoopAnalytics } from "@penntools/core/analytics";
import type { ToolContext } from "@penntools/core/tools";
import type { LLMProvider } from "@penntools/core/llm";
import { CourseFinderTool } from "../CourseFinderTool.js";

// ── Stub services ─────────────────────────────────────────────────────────────

const stubLLM: LLMProvider = {
  providerName: "stub",
  async complete(req) {
    return {
      content: `Stub response for: ${req.messages.at(-1)?.content ?? ""}`,
      model: "stub",
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    };
  },
  async *stream(req) {
    const res = await stubLLM.complete(req);
    yield { delta: res.content, done: false };
    yield { delta: "", done: true };
  },
};

const stubRepo = {
  findById: vi.fn().mockResolvedValue(null),
  findAllByUser: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue(undefined),
  findByChatId: vi.fn().mockResolvedValue([]),
  deleteByChatId: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(null),
  upsert: vi.fn().mockResolvedValue({}),
  deleteByUser: vi.fn().mockResolvedValue(undefined),
};

const stubContext: ToolContext = {
  userId: "test-user-id",
  db: {
    chats: stubRepo as any,
    messages: stubRepo as any,
    toolData: stubRepo as any,
    users: stubRepo as any,
  },
  llm: stubLLM,
  analytics: new NoopAnalytics(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  config: { toolId: "course-finder" },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CourseFinderTool", () => {
  let registry: ToolRegistry;
  let tool: CourseFinderTool;

  beforeEach(() => {
    // Use a fresh isolated registry per test — never reuse the process singleton.
    registry = new ToolRegistry();
    tool = new CourseFinderTool();
    registry.register(tool);
  });

  it("registers successfully and can be looked up by id", () => {
    expect(registry.get("course-finder")).toBe(tool);
  });

  it("lists the manifest in registry.listManifests()", () => {
    const manifests = registry.listManifests();
    expect(manifests).toHaveLength(1);
    expect(manifests[0]?.id).toBe("course-finder");
    expect(manifests[0]?.title).toBeTruthy();
  });

  it("throws when registering a duplicate id", () => {
    expect(() => registry.register(new CourseFinderTool())).toThrow(
      /already registered/
    );
  });

  it("canAccess() returns true for any userId (v1 authless)", () => {
    expect(tool.canAccess("any-user")).toBe(true);
    expect(tool.canAccess("")).toBe(true);
  });

  it("execute() returns assistantMessage and artifacts", async () => {
    const output = await tool.execute(
      { query: "machine learning", limit: 2 },
      stubContext
    );

    expect(output.assistantMessage).toBeTruthy();
    expect(output.artifacts).toBeDefined();
    expect(output.artifacts?.[0]?.kind).toBe("json");
    // Respects the limit
    expect((output.artifacts?.[0]?.data as unknown[]).length).toBeLessThanOrEqual(2);
  });
});
