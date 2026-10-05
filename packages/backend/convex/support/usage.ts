// "Where did my usage go?" as shares of what they spent, never as dollars.
//
// The per-reply cost on a message is the provider's raw figure, before any
// usage multiplier or markup, and the markups are deliberately unpublished.
// Shares of the window survive both: they're what the usage tab's donut
// shows, and they can't be multiplied back into a price.

import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertSupportSecret } from "./guard";
import { modelLabel, threadLabel } from "./labels";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 30;

/* Same cap and reason as replies.ts. `truncated` tells the agent when a
   heavy month ran past it, so it doesn't present a partial total as whole. */
const SCAN_LIMIT = 400;

function share(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

type Bucket = { replies: number; cost: number };

function bump(map: Map<string, Bucket>, key: string, cost: number) {
  const bucket = map.get(key) ?? { replies: 0, cost: 0 };
  bucket.replies += 1;
  bucket.cost += cost;
  map.set(key, bucket);
}

/**
 * Which models, modes and threads the customer's replies spent their
 * allowance on over the last `days`. Replies only: titles, compaction and
 * voice transcription are billed too, but they're small and not per-reply.
 */
export const usageBreakdown = query({
  args: { secret: v.string(), externalId: v.string(), days: v.number() },
  handler: async (ctx, { secret, externalId, days }) => {
    assertSupportSecret(secret);

    const window = Math.min(MAX_DAYS, Math.max(1, Math.round(days)));
    const since = Date.now() - window * DAY_MS;
    const replies = await ctx.db
      .query("messages")
      .withIndex("by_user_role_created_at", (q) =>
        q.eq("userId", externalId).eq("role", "assistant").gte("createdAt", since),
      )
      .order("desc")
      .take(SCAN_LIMIT);

    const models = new Map<string, string>();
    const byModel = new Map<string, Bucket>();
    const byThread = new Map<Id<"threads">, Bucket>();
    let total = 0;
    let thinkingCost = 0;
    let searchCost = 0;
    let billedReplies = 0;
    let extraUsageReplies = 0;
    const billed: Doc<"messages">[] = [];

    for (const reply of replies) {
      const cost = reply.usageCost ?? 0;
      if (!(cost > 0)) continue;

      billedReplies += 1;
      total += cost;
      if (reply.thinking) thinkingCost += cost;
      if (reply.search) searchCost += cost;
      if ((reply.extraUsageCost ?? 0) > 0) extraUsageReplies += 1;

      bump(byModel, await modelLabel(ctx, reply.model, models), cost);
      bump(byThread, reply.threadId, cost);
      billed.push(reply);
    }

    const topThreadIds = [...byThread.entries()]
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 3);
    const topThreads = [];
    for (const [threadId, bucket] of topThreadIds) {
      const thread = await ctx.db.get(threadId);
      if (thread?.incognito) continue;
      topThreads.push({
        thread: threadLabel(thread),
        replies: bucket.replies,
        sharePct: share(bucket.cost, total),
      });
    }

    const heaviest = billed
      .sort((a, b) => (b.usageCost ?? 0) - (a.usageCost ?? 0))
      .slice(0, 3);
    const heaviestReplies = [];
    for (const reply of heaviest) {
      const thread = await ctx.db.get(reply.threadId);
      if (thread?.incognito) continue;
      heaviestReplies.push({
        messageId: reply._id,
        threadId: reply.threadId,
        at: reply.createdAt,
        thread: threadLabel(thread),
        model: await modelLabel(ctx, reply.model, models),
        thinking: reply.thinking === true,
        search: reply.search === true,
        sharePct: share(reply.usageCost ?? 0, total),
      });
    }

    return {
      days: window,
      truncated: replies.length === SCAN_LIMIT,
      replies: replies.length,
      billedReplies,
      /** Replies that spilled into the purchased extra-usage balance. */
      extraUsageReplies,
      byModel: [...byModel.entries()]
        .sort((a, b) => b[1].cost - a[1].cost)
        .map(([model, bucket]) => ({
          model,
          replies: bucket.replies,
          sharePct: share(bucket.cost, total),
        })),
      thinkingSharePct: share(thinkingCost, total),
      searchSharePct: share(searchCost, total),
      topThreads,
      heaviestReplies,
    };
  },
});
