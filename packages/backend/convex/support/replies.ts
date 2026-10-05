// "Why did my reply fail?" answered from the rows, not from a guess.

import { v } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertSupportSecret } from "./guard";
import { describeProblem, modelLabel, threadLabel } from "./labels";
import type { ProblemKind } from "./labels";

const DAY_MS = 24 * 60 * 60 * 1000;
const LOOKBACK_DAYS = 14;

/* Assistant rows are fat (content, phases), so the scan is capped. A few
   hundred recent replies is far more than anyone asks support about. */
const SCAN_LIMIT = 300;
const MAX_PROBLEMS = 10;

export type ReplyProblem = {
  messageId: Id<"messages">;
  threadId: Id<"threads">;
  at: number;
  thread: string;
  model: string;
  thinking: boolean;
  search: boolean;
  kind: ProblemKind;
  explanation: string;
  billed: boolean;
  /** A later reply in the same thread finished, so they got past it. */
  laterReplySucceeded: boolean;
};

/**
 * The customer's recent replies that failed, were blocked, or were cut
 * short, newest first. Incognito threads are left out: they are purged on
 * exit and the customer asked for them not to be kept.
 */
export const recentProblems = query({
  args: { secret: v.string(), externalId: v.string() },
  handler: async (ctx, { secret, externalId }) => {
    assertSupportSecret(secret);

    const since = Date.now() - LOOKBACK_DAYS * DAY_MS;
    const replies = await ctx.db
      .query("messages")
      .withIndex("by_user_role_created_at", (q) =>
        q.eq("userId", externalId).eq("role", "assistant").gte("createdAt", since),
      )
      .order("desc")
      .take(SCAN_LIMIT);

    /* Newest first, so by the time a failure comes up, this holds exactly
       the threads that went on to finish a reply after it. */
    const recovered = new Set<Id<"threads">>();
    const threads = new Map<Id<"threads">, Doc<"threads"> | null>();
    const models = new Map<string, string>();
    const problems: ReplyProblem[] = [];

    for (const reply of replies) {
      if (reply.status === "complete") recovered.add(reply.threadId);
      if (problems.length >= MAX_PROBLEMS) continue;

      const problem = describeProblem(reply);
      if (!problem) continue;

      if (!threads.has(reply.threadId)) {
        threads.set(reply.threadId, await ctx.db.get(reply.threadId));
      }
      const thread = threads.get(reply.threadId) ?? null;
      if (thread?.incognito) continue;

      problems.push({
        messageId: reply._id,
        threadId: reply.threadId,
        at: reply.createdAt,
        thread: threadLabel(thread),
        model: await modelLabel(ctx, reply.model, models),
        thinking: reply.thinking === true,
        search: reply.search === true,
        kind: problem.kind,
        explanation: problem.explanation,
        billed: (reply.usageCost ?? 0) > 0,
        laterReplySucceeded: recovered.has(reply.threadId),
      });
    }

    return {
      lookbackDays: LOOKBACK_DAYS,
      repliesChecked: replies.length,
      problems,
    };
  },
});
