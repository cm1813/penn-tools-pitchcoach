// ─────────────────────────────────────────────────────────────────────────────
// PostHog analytics adapter — STUB
//
// Replace the TODO bodies with posthog-node calls when ready.
// Falls back to NoopAnalytics if POSTHOG_API_KEY is not set.
// ─────────────────────────────────────────────────────────────────────────────

import type { Analytics, EventProperties } from "@penntools/core/analytics";
import type { UserId } from "@penntools/core/types";

export class PostHogAnalytics implements Analytics {
  // TODO: private client: PostHog (from "posthog-node")

  constructor(
    private readonly apiKey: string,
    private readonly host: string
  ) {
    // TODO: this.client = new PostHog(apiKey, { host });
    void apiKey;
    void host;
  }

  track(userId: UserId, event: string, props?: EventProperties): void {
    // TODO: this.client.capture({ distinctId: userId, event, properties: props });
    void userId; void event; void props;
  }

  identify(userId: UserId, traits?: EventProperties): void {
    // TODO: this.client.identify({ distinctId: userId, properties: traits });
    void userId; void traits;
  }

  async flush(): Promise<void> {
    // TODO: await this.client.flush();
  }
}
