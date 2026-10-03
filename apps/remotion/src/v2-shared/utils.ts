import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* apps/v2/lib/utils.ts, verbatim. Ripped components pass overrides through
   className the way they do in the app, and several of them override a
   utility the base already sets — the send button's rounded-full over
   SquishButton's rounded-lg, say. Plain concatenation leaves both in play
   and lets stylesheet order decide, which is how a circular button comes
   out a rounded square. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
