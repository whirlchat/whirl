// Giving back what one reply cost.
//
// Only ever reached through a high-risk Median tool, so a teammate has read
// the conversation and pressed approve before any of this runs. It credits
// the exact charges the reply's usage ledger rows recorded, back to the
// buckets they came out of, which is why it works from `usageCharges` and not
// from the message's `usageCost` (that one is the raw provider figure, before
// any multiplier). Receipts are kept 30 days, so that's the refund window.
//
// The customer names the thread (its id is in their address bar) and the
// agent picks the reply out of support/threads.ts, so the reply has to be in
// that thread. A messageId lifted from somewhere else gets refused.

import { Autumn } from "autumn-js";
import { v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, internalMutation } from "../_generated/server";
import {
  AI_COST_FEATURE_ID,
  EXTRA_USAGE_FEATURE_ID,
  USAGE_FEATURE_ID,
} from "../inference/billing";
import { FREE_MESSAGES_FEATURE_ID } from "../usageLedger";
import { assertSupportSecret } from "./guard";
import { resolveThreadRef } from "./threadRef";

/* A turn opens a handful of charges at most (the reply, a search or two). */
const MAX_CHARGES = 20;

type Claim =
  | { status: "thread_not_found" }
  | { status: "not_found" }
  | { status: "nothing_charged" }
  | { status: "still_settling" }
  | { status: "already_refunded"; at: number }
  | {
      status: "claimed";
      chargeIds: Id<"usageCharges">[];
      freeMessages: number;
      planPool: number;
      extraUsage: number;
    };

/**
 * Stamps the reply's settled charges as refunded and says how much goes
 * back where. The stamp lands before Autumn hears anything, so two approvals
 * racing on the same reply can't both pay out.
 */
export const claimRefund = internalMutation({
  args: {
    externalId: v.string(),
    threadRef: v.string(),
    messageId: v.string(),
    approvedBy: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args): Promise<Claim> => {
    const thread = await resolveThreadRef(ctx, args.threadRef, args.externalId);
    if (!thread) return { status: "thread_not_found" };

    const messageId = ctx.db.normalizeId("messages", args.messageId);
    const message = messageId ? await ctx.db.get(messageId) : null;
    if (
      !message ||
      message.threadId !== thread._id ||
      message.userId !== args.externalId ||
      message.role !== "assistant"
    ) {
      return { status: "not_found" };
    }

    const charges = await ctx.db
      .query("usageCharges")
      .withIndex("by_assistant_id", (q) => q.eq("assistantId", message._id))
      .take(MAX_CHARGES);

    const refunded = charges.find((charge) => charge.refund);
    if (refunded?.refund) {
      return { status: "already_refunded", at: refunded.refund.at };
    }
    if (charges.some((charge) => charge.status === "pending")) {
      return { status: "still_settling" };
    }

    /* `failed` charges never reached Autumn, so there's nothing to return. */
    const collected = charges.filter(
      (charge) => charge.status === "settled" && charge.amount > 0,
    );
    if (collected.length === 0) return { status: "nothing_charged" };

    let freeMessages = 0;
    let metered = 0;
    for (const charge of collected) {
      if (charge.feature === FREE_MESSAGES_FEATURE_ID) freeMessages += charge.amount;
      else metered += charge.amount;
    }
    /* Settling writes each charge's overflow onto the message, so this is
       the part of `metered` that came out of purchased extra usage. */
    const extraUsage = Math.min(metered, message.extraUsageCost ?? 0);

    const refund = { at: Date.now(), approvedBy: args.approvedBy, reason: args.reason };
    for (const charge of collected) {
      await ctx.db.patch(charge._id, { refund });
    }

    return {
      status: "claimed",
      chargeIds: collected.map((charge) => charge._id),
      freeMessages,
      planPool: metered - extraUsage,
      extraUsage,
    };
  },
});

/** Autumn refused, so the stamp comes off and a retry can have another go. */
export const releaseRefund = internalMutation({
  args: { chargeIds: v.array(v.id("usageCharges")) },
  handler: async (ctx, { chargeIds }) => {
    for (const chargeId of chargeIds) {
      const charge = await ctx.db.get(chargeId);
      if (charge?.refund) await ctx.db.patch(chargeId, { refund: undefined });
    }
  },
});

export type RefundResult =
  | { refunded: false; reason: string }
  | {
      refunded: true;
      freeMessagesReturned: number;
      /** Share of the plan's allowance handed back, when Autumn says what it is. */
      planAllowanceReturnedPct: number | null;
      extraUsageReturnedUsd: number;
    };

const REFUSALS: Record<Exclude<Claim["status"], "claimed">, (claim: Claim) => string> = {
  thread_not_found: () =>
    "No thread of this customer's matches that. Ask them to copy the link from the address bar while the thread is open.",
  not_found: () =>
    "That reply isn't in this thread. Look the thread up again with whirlThreadReplies and use a messageId from there.",
  nothing_charged: () =>
    "Nothing was charged for that reply (failed and blocked replies aren't billed), or its receipt is older than 30 days.",
  still_settling: () =>
    "The charge for that reply hasn't finished going through yet. Try again in a few minutes.",
  already_refunded: (claim) =>
    `That reply was already refunded on ${new Date(
      claim.status === "already_refunded" ? claim.at : 0,
    ).toUTCString()}.`,
};

export const refundReply = action({
  args: {
    secret: v.string(),
    externalId: v.string(),
    threadRef: v.string(),
    messageId: v.string(),
    approvedBy: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args): Promise<RefundResult> => {
    assertSupportSecret(args.secret);

    const secretKey = process.env.AUTUMN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Billing isn't configured (AUTUMN_SECRET_KEY).");
    }

    const claim: Claim = await ctx.runMutation(internal.support.refunds.claimRefund, {
      externalId: args.externalId,
      threadRef: args.threadRef,
      messageId: args.messageId,
      approvedBy: args.approvedBy,
      reason: args.reason,
    });
    if (claim.status !== "claimed") {
      return { refunded: false, reason: REFUSALS[claim.status](claim) };
    }

    /* Negative tracks are credits. Each bucket gets its own key, so a retry
       after a partial failure only re-sends the part that didn't land. */
    const autumn = new Autumn({ secretKey });
    const credits = [
      { feature_id: FREE_MESSAGES_FEATURE_ID, value: claim.freeMessages, key: "messages" },
      { feature_id: AI_COST_FEATURE_ID, value: claim.planPool, key: "usage" },
      { feature_id: EXTRA_USAGE_FEATURE_ID, value: claim.extraUsage, key: "extra" },
    ].filter((credit) => credit.value > 0);

    try {
      for (const credit of credits) {
        const { error } = await autumn.track({
          customer_id: args.externalId,
          feature_id: credit.feature_id,
          value: -credit.value,
          idempotency_key: `support-refund:${args.messageId}:${credit.key}`,
        });
        if (error) throw new Error(JSON.stringify(error));
      }
    } catch (error) {
      await ctx.runMutation(internal.support.refunds.releaseRefund, {
        chargeIds: claim.chargeIds,
      });
      console.error("support_refund_failed", {
        messageId: args.messageId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error("Billing didn't accept the refund, so nothing was credited. Try again shortly.");
    }

    let planAllowanceReturnedPct: number | null = null;
    if (claim.planPool > 0) {
      const { data } = await autumn.customers.get(args.externalId);
      const included = data?.features?.[USAGE_FEATURE_ID]?.included_usage;
      if (typeof included === "number" && included > 0) {
        planAllowanceReturnedPct = Math.round((claim.planPool / included) * 1000) / 10;
      }
    }

    return {
      refunded: true,
      freeMessagesReturned: claim.freeMessages,
      planAllowanceReturnedPct,
      extraUsageReturnedUsd: Math.round(claim.extraUsage * 100) / 100,
    };
  },
});
