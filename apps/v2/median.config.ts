/* What the Median support agent may do on Whirl's behalf.
 *
 * Every lookup is keyed on the visitor the widget already proved, never on
 * something typed into the chat. The one thing a customer does type is a
 * thread link, and that only narrows within their own threads. The answers
 * come from Convex through lib/median-backend.ts. The tools answer the
 * questions people actually write in with: why a reply failed, where their
 * usage went, why an integration stopped, what happened to one reply. Plans and prices live in the knowledge base instead, so there is
 * one copy of them to keep true.
 *
 * One tool writes: whirlRefundReply gives back the allowance a single reply
 * used. It is high risk, so it waits for a teammate's approval in the inbox
 * before anything is credited.
 *
 * Served from app/api/median/route.ts. Median re-reads the manifest whenever
 * that route gets a GET carrying `Authorization: Bearer $MEDIAN_KEY`, which
 * convex/deployment.ts sends after every production deploy. */

import { defineConfig, navigation, p } from "@mediansh/agent-tools";
import { api } from "@whirl/backend/convex/_generated/api";

import { SIGNED_OUT, supportBackend, verifiedCustomer } from "@/lib/median-backend";

/* The pages the agent may take somebody to, listed rather than scanned. A
   scan would also hand it /debug, /platinum, and every share and artifact
   route; a page the model was never given is one it cannot name, guess, or be
   talked into. */
const NAVIGABLE_ROUTES = [
  "/",
  "/pricing",
  "/integrations",
  "/settings",
  "/settings/general",
  "/settings/personalization",
  "/settings/memory",
  "/settings/models",
  "/settings/integrations",
  "/settings/account",
  "/settings/billing",
  "/settings/usage",
  "/settings/extra-usage",
  "/about",
  "/about/features",
  "/about/pricing",
  "/about/developers",
];

export default defineConfig({
  plugins: [navigation({ routes: NAVIGABLE_ROUTES })],

  /* Attached to a bug report and to nothing else, so it says what the build
     was doing and nothing about the person reporting it. */
  diagnostics: () => ({
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "unknown",
    convex: process.env.NEXT_PUBLIC_CONVEX_URL ? "configured" : "missing",
  }),

  tools: {
    whirlAccount: {
      description:
        "The signed-in customer's plan and allowance: which plan, whether it's active, trialing, past due or set to cancel, when the period ends, how much allowance is left (free plans count messages, paid plans a percentage), when it refills, any extra-usage balance in USD, and whether memory is switched on. Call it before answering anything about their plan, their limits, running out, or memory not working.",
      risk: "low",
      input: {},
      async execute(_input, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        const account = await convex.action(api.support.account.snapshot, {
          secret,
          externalId: customer,
        });
        if (!account.known) {
          return { known: false, reason: "Billing has no record of this account yet." };
        }

        return {
          known: true,
          plan: account.planName,
          paid: account.planId !== null,
          status: account.planStatus ?? "active",
          periodEndsAt: account.periodEndsAt,
          cancelsAtPeriodEnd: account.cancelsAtPeriodEnd,
          trialEndsAt: account.trialEndsAt,
          unlimited: account.unlimited,
          percentLeft: Math.round(account.remainingPct),
          freeMessagesLeft: account.freeMessagesRemaining,
          freeMessagesPerDay: account.freeMessagesIncluded,
          refillsAt: account.nextResetAt,
          extraUsageBalanceUsd: account.extraUsageBalance,
          memoryEnabled: account.memoryEnabled,
        };
      },
    },

    whirlReplyProblems: {
      description:
        "The customer's replies from the last 14 days that failed, were blocked by their plan, or were cut short, newest first. Each one says which thread, which model, what went wrong in plain words, whether it was billed, and whether a later reply in that thread worked. Call it whenever someone says a reply errored, stopped, never came, or asks what went wrong, before suggesting anything. Pass on the explanation; don't guess past it.",
      risk: "low",
      input: {},
      async execute(_input, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        return await convex.query(api.support.replies.recentProblems, {
          secret,
          externalId: customer,
        });
      },
    },

    whirlUsageBreakdown: {
      description:
        "Where the customer's allowance went over recent days, as shares: by model, how much went to thinking mode and web search, the threads that used the most, and the single heaviest replies. Shares only, never prices. Call it when someone asks why they ran out so fast or what is using up their plan, then call whirlAccount if they also need to know what's left.",
      risk: "low",
      input: {
        days: p
          .number("How many days back to look, 1 to 30. Leave it out for the last 7.")
          .optional(),
      },
      async execute({ days }, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        return await convex.query(api.support.usage.usageBreakdown, {
          secret,
          externalId: customer,
          days: days ?? 7,
        });
      },
    },

    whirlIntegrations: {
      description:
        "Every integration the customer has installed and its state: working, needs reconnecting, credentials rejected, erroring, never finished connecting, or paused, with the fix for each and when it broke. Call it when someone says Gmail, Calendar, Notion, GitHub or any other connected app stopped working or isn't being used.",
      risk: "low",
      input: {},
      async execute(_input, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        return await convex.query(api.support.integrations.integrationStatus, {
          secret,
          externalId: customer,
        });
      },
    },

    whirlThreadReplies: {
      description:
        "The replies in one of the customer's threads, newest 20, oldest first: when each was written, the start of what was asked and of the reply, the model, whether it failed or was cut short, whether it was billed, and whether it was already refunded. Each one carries the messageId whirlRefundReply needs. Customers can't see message ids, so when they want a specific reply looked at or refunded, ask them to open that thread and copy the link from the address bar (it ends in /thread/ and an id), then pass what they paste here as-is. Match the reply they describe against askedAbout and replyStart, and confirm with them if more than one fits.",
      risk: "low",
      input: {
        threadId: p.string(
          "The thread link or id the customer pasted from their address bar. A full URL, a /thread/… path, or the bare id all work.",
        ),
      },
      async execute({ threadId }, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        return await convex.query(api.support.threads.threadReplies, {
          secret,
          externalId: customer,
          threadRef: threadId,
        });
      },
    },

    whirlRefundReply: {
      description:
        "Gives back the allowance one reply used: its free message, its share of the plan's usage, or the extra-usage dollars it spent. It never refunds a subscription or a card payment. Use it when a reply was clearly broken, cut short, or wrong through no fault of the customer's. Never ask the customer for a message id; they can't see one. Ask for the thread link from their address bar, find the reply with whirlThreadReplies, and pass that thread and the reply's messageId. A reply from whirlReplyProblems or whirlUsageBreakdown already carries both. A teammate approves every call first, so don't promise the refund. Say you've asked the team to credit it back.",
      risk: "high",
      input: {
        threadId: p.string(
          "The thread the reply is in: the link or id the customer pasted, or the threadId another tool returned.",
        ),
        messageId: p.string(
          "The reply's messageId, exactly as whirlThreadReplies (or another tool) returned it. Never ask the customer for this.",
        ),
        reason: p.string("One sentence on what went wrong with the reply, for the teammate approving it."),
      },
      async execute({ threadId, messageId, reason }, context) {
        const customer = verifiedCustomer(context);
        if (!customer) return SIGNED_OUT;

        const { convex, secret } = supportBackend();
        return await convex.action(api.support.refunds.refundReply, {
          secret,
          externalId: customer,
          threadRef: threadId,
          messageId,
          reason,
          approvedBy: context.approvedBy ?? "unknown",
        });
      },
    },
  },
});
