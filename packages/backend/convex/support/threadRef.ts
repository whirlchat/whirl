// Turning "here's my thread" into a thread row.
//
// Message ids never show up anywhere a customer can see them, but a thread's
// id sits right in the address bar (/thread/<id>). So support asks for that,
// and people paste it however it comes out: the bare id, the path, or the
// whole URL with a query string on the end. All of those land here.

import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

const THREAD_PATH = /\/thread\/([^/?#\s]+)/;

/** The id out of whatever was pasted, or the trimmed input when it's bare. */
export function threadIdFromRef(ref: string): string {
  const trimmed = ref.trim();
  return THREAD_PATH.exec(trimmed)?.[1] ?? trimmed;
}

/**
 * The customer's thread the reference points at, or null when it doesn't
 * parse, doesn't exist, or belongs to somebody else. Those all read the same
 * from outside, so nobody can probe for other people's thread ids.
 */
export async function resolveThreadRef(
  ctx: Pick<QueryCtx, "db">,
  ref: string,
  externalId: string,
): Promise<Doc<"threads"> | null> {
  const threadId = ctx.db.normalizeId("threads", threadIdFromRef(ref));
  const thread = threadId ? await ctx.db.get(threadId) : null;
  return thread && thread.userId === externalId ? thread : null;
}
