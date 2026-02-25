# PennTools Architecture

## Layers

```
┌──────────────────────────────────────────────────────────┐
│  apps/web  (Next.js)                                     │
│   └─ route handlers → container.ts (DI root)            │
│   └─ React components → hooks → fetch()                 │
├──────────────────────────────────────────────────────────┤
│  packages/platform  (reads env vars, constructs clients) │
│   ├─ Prisma repositories                                 │
│   ├─ LLM adapters (OpenAI, Anthropic)                    │
│   ├─ Analytics (PostHog)                                 │
│   └─ AnonymousIdentityService                            │
├──────────────────────────────────────────────────────────┤
│  packages/core  (pure interfaces, no env, no vendor SDK) │
│   ├─ Tool, ToolRegistry, ToolRunner, ToolContext         │
│   ├─ LLMProvider interface                               │
│   ├─ Analytics interface                                 │
│   ├─ IdentityService interface                           │
│   └─ Repository interfaces (Chat, Message, ToolData…)   │
├──────────────────────────────────────────────────────────┤
│  tools/<tool_id>  (one folder per tool)                  │
│   └─ extend Tool, implement execute(input, context)      │
└──────────────────────────────────────────────────────────┘
```

### Dependency rules

| Package | May import from | Must NOT import from |
|---------|----------------|---------------------|
| `core` | nothing except Node builtins | `platform`, `env`, any vendor SDK |
| `platform` | `core`, vendor SDKs, `process.env` | `apps/web`, `tools/*` |
| `tools/*` | `core` only | `platform`, `process.env`, fetch, Prisma |
| `apps/web` | `core`, `platform`, `tools/*` | — |

---

## Tool system

### Adding a new tool

1. `mkdir tools/my-tool && cd tools/my-tool`
2. Copy the structure of `tools/course-finder`.
3. Extend `Tool<MyInput, MyOutput>` and fill in `manifest` + `execute()`.
4. Add `@penntools/tool-my-tool` to `apps/web/package.json` dependencies.
5. In `apps/web/src/lib/container.ts`, add one import + one `toolRegistry.register(new MyTool())` call (guarded by the duplicate-id check).
6. Write tests in `src/__tests__/`.

### How the registry works

Tools are registered **explicitly** at server startup (not at import time).
This avoids hidden ordering dependencies and allows isolated registries in tests.

```ts
// container.ts (server-only, runs once per process)
import { toolRegistry } from "@penntools/core/tools";
import { CourseFinderTool } from "@penntools/tool-course-finder";

if (!toolRegistry.get("course-finder")) {
  toolRegistry.register(new CourseFinderTool());
}
```

`ToolRunner.run(toolId, input, userId)` looks up the tool, checks `canAccess()`,
builds a `ToolContext` (injecting db, llm, analytics, logger, config), and
calls `tool.execute(input, context)`.

### Tool invocation routing (v1)

User sends a message like:
```
/tool course-finder { "query": "ML for non-majors" }
```

The `/api/chat/send` route detects the `/tool` prefix, parses the id and JSON
input, and calls `ToolRunner.run()`.  For all other messages it calls the LLM
directly.

**v2 upgrade**: Replace the prefix check with a model-based tool-selection step:
1. Call LLM with the message + serialised tool manifests in the system prompt.
2. Parse the model's `tool_call` output.
3. Run the selected tool, append a `tool` role message.
4. Call LLM again with the tool output for a final synthesised reply.

---

## Multi-user readiness (authless v1)

- On first visit, `AnonymousIdentityService.getOrCreateAnonymousUserId()` creates
  a UUID and writes it as an HTTP-only cookie (`penntools_uid`).
- Every repository method receives `userId` explicitly — there are no implicit
  "current user" globals.
- When UPenn SSO is added (v2):
  1. Implement `IdentityService.linkToAuthenticatedUser(anonymousId, pennId)`.
  2. Insert a `users` row with `type=authenticated`.
  3. All historical rows (chats, messages, tool_data) remain associated with the
     original UUID — no data migration needed.

---

## Data model

See `packages/platform/prisma/schema.prisma` for the canonical schema.

Key design choices:
- `tool_data` uses a generic `(userId, toolId, key) → jsonValue` pattern so tools
  can persist state without needing their own migrations.
- `messages.tool_id` is nullable — set only when `role = TOOL`.
- The `tools` table in the schema is **optional** metadata for admin UIs;
  the runtime registry is code-based (no DB sync required for tools to work).

---

## Configuration

All env var reads happen in `packages/platform` and `apps/web/src/lib/container.ts`.
Core interfaces and tools never access `process.env`.

| Variable | Used by | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | platform/prisma | Postgres connection |
| `OPENAI_API_KEY` | platform/llm | OpenAI adapter |
| `ANTHROPIC_API_KEY` | platform/llm | Anthropic adapter |
| `POSTHOG_API_KEY` | platform/analytics | Event tracking |
| `POSTHOG_HOST` | platform/analytics | PostHog instance URL |
