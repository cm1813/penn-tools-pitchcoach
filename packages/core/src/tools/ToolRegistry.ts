// ─────────────────────────────────────────────────────────────────────────────
// ToolRegistry
//
// Registration strategy: EXPLICIT register() call, not import-time
// auto-registration.
//
// Rationale:
//   - Import-time side effects make the registry a hidden global whose state
//     depends on module load order. That's fine for simple CLIs but breaks
//     unit tests (you can't clear/reset it easily) and server-side rendering
//     (the registry might be partially populated depending on which code paths
//     Next.js tree-shakes).
//   - Explicit registration at app startup (e.g. in a server-only bootstrap
//     file) is predictable, easy to trace in a debugger, and trivial to stub
//     in tests.
//
// Usage:
//   // apps/web/src/lib/toolBootstrap.ts  (server-only)
//   import { toolRegistry } from "@penntools/core/tools";
//   import { CourseFinderTool } from "@penntools/tool-course-finder";
//   toolRegistry.register(new CourseFinderTool());
// ─────────────────────────────────────────────────────────────────────────────

import type { Tool, ToolManifest } from "./Tool.js";

export class ToolRegistry {
  // Map from tool id → Tool instance. Private to prevent external mutation.
  private readonly tools = new Map<string, Tool>();

  /**
   * Register a tool instance.
   * Throws if a tool with the same id is already registered — this makes
   * duplicate registrations a loud, immediate error rather than a silent
   * override.
   */
  register(tool: Tool): void {
    const { id } = tool.manifest;
    if (this.tools.has(id)) {
      throw new Error(
        `ToolRegistry: a tool with id "${id}" is already registered. ` +
          "Tool ids must be globally unique."
      );
    }
    this.tools.set(id, tool);
  }

  /** Remove a tool by id. Useful in tests to reset state. */
  unregister(id: string): void {
    this.tools.delete(id);
  }

  /** Retrieve a single tool, or undefined if not found. */
  get(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  /** List all registered tool manifests (safe to expose to clients). */
  listManifests(): ToolManifest[] {
    return Array.from(this.tools.values()).map((t) => t.manifest);
  }

  /** Total number of registered tools. */
  get size(): number {
    return this.tools.size;
  }
}

/**
 * Singleton registry for the running process.
 *
 * Why a singleton?  The registry is deliberately process-scoped (one per
 * server instance) and populated at startup.  Using a singleton avoids
 * threading the registry through every call site.  If you need an isolated
 * registry in tests, instantiate `new ToolRegistry()` directly.
 */
export const toolRegistry = new ToolRegistry();
