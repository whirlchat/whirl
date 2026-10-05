// "This reply, in this thread" — found from the id in the address bar.
//
// Customers can't see message ids, but they can copy a thread's URL. This
// lists the replies in that thread with enough to tell them apart (when, what
// was asked, how it started, whether it went wrong, whether it was billed),
// so the agent can pick the one they mean and hand its messageId to the
// refund tool without anybody reading ids out loud.

import { v } from "convex/values";

import type { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { assertSupportSecret } from "./guard";
import { describeProblem, modelLabel, threadLabel } from "./labels";
import { resolveThreadRef } from "./threadRef";

/* Message rows are fat (content, phases), so only the tail of the thread is
   read. The reply someone writes in about is almost always a recent one. */
const SCAN_LIMIT = 60;
const MAX_REPLIES = 20;
const MAX_CHARGES = 20;
const PREVIEW_CHARS = 120;

/** The opening of a message on one line, short enough to quote back. */
function preview(message: Doc<"messages"> | undefined): string | null {
  if (!message || message.sealed) return null;
  const text = message.content.replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > PREVIEW_CHARS ? `${text.slice(0, PREVIEW_CHARS)}…` : text;
}

/**
 * The newest replies in one of the customer's threads, oldest first so they
 * read like the thread does. Locked threads keep their content sealed, so
 * their replies come back without previews.
 */
export const threadReplies = query({
  args: { secret: v.string(), externalId: v.string(), threadRef: v.string() },
  handler: async (ctx, { secret, externalId, threadRef }) => {
    assertSupportSecret(secret);

    const thread = await resolveThreadRef(ctx, threadRef, externalId);
    if (!thread || thread.incognito) {
      return {
        found: false as const,
        reason:
          "No thread of this customer's matches that. Ask them to open the thread and copy the link from the address bar (it looks like /thread/…).",
      };
    }

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_thread_created_at", (q) => q.eq("threadId", thread._id))
      .order("desc")
      .take(SCAN_LIMIT);
    const messages = recent.reverse();

    /* Each reply with the message that asked for it. */
    const turns: { prompt?: Doc<"messages">; reply: Doc<"messages"> }[] = [];
    let prompt: Doc<"messages"> | undefined;
    for (const message of messages) {
      if (message.role === "user") prompt = message;
      else turns.push({ prompt, reply: message });
    }
    const shown = turns.slice(-MAX_REPLIES);

    const models = new Map<string, string>();
    const replies = [];
    for (const { prompt, reply } of shown) {
      const charges = await ctx.db
        .query("usageCharges")
        .withIndex("by_assistant_id", (q) => q.eq("assistantId", reply._id))
        .take(MAX_CHARGES);
      const problem = describeProblem(reply);
      const settled = reply.status === "complete" || reply.status === undefined;

      replies.push({
        messageId: reply._id,
        at: reply.createdAt,
        askedAbout: preview(prompt),
        replyStart: problem ? null : preview(reply),
        model: await modelLabel(ctx, reply.model, models),
        thinking: reply.thinking === true,
        search: reply.search === true,
        status: problem?.kind ?? (settled ? "ok" : "still_writing"),
        explanation: problem?.explanation ?? null,
        billed: (reply.usageCost ?? 0) > 0,
        refunded: charges.some((charge) => charge.refund !== undefined),
      });
    }

    return {
      found: true as const,
      thread: threadLabel(thread),
      /** Older replies sit above these; ask which one if it isn't listed. */
      truncated: recent.length === SCAN_LIMIT || shown.length < turns.length,
      replies,
    };
  },
});
