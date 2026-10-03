import type { ReactNode } from "react";

import { cn } from "./utils";

/* Ripped from apps/v2/components/squish-button.tsx. Liquid-glass pill: a
   translucent gradient glaze, brighter at the top, layered over the
   background-color — translucent at every stop on purpose, so it may only
   LIGHTEN the base, never replace it. The press dip and hover colour are
   interactive-only, so they don't come along. */
const GLAZE = "bg-linear-to-b from-white/25 to-white/0";

export function SquishButton({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
        GLAZE,
        className,
      )}
    >
      {children}
    </div>
  );
}
