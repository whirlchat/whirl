import { IconChevronUp } from "@tabler/icons-react";
import { Img } from "remotion";

/* The rail's bottom chrome, ripped from apps/v2/components/user-button.tsx
   in its signed-in state: avatar, name, plan, and the chevron that opens
   the account menu. h-13 is the slot the skeleton reserves for it.

   The plan wears its wordmark from /plan-badges when a shot passes one,
   flattened to monochrome exactly as v2's PlanBadge does it; without one
   it falls back to the plan name as text, the same fallback v2 uses. The
   avatar falls back to the initial when there's no image. Both go through
   Img, which holds the frame until the file has decoded. */
export type SidebarUser = {
  name: string;
  plan: string;
  /** The pfp; the initial stands in without one. */
  imageSrc?: string;
  /** The plan's wordmark from /plan-badges; the plan name stands in. */
  badgeSrc?: string;
};

export function UserButton({ name, plan, imageSrc, badgeSrc }: SidebarUser) {
  return (
    <div className="h-13">
      <div className="flex h-full w-full items-center gap-2.5 overflow-hidden rounded-lg px-2 py-2 text-left">
        <span className="relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border dark:after:mix-blend-lighten">
          {imageSrc ? (
            <Img
              src={imageSrc}
              alt=""
              className="aspect-square size-full rounded-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="max-w-full truncate text-sm leading-4 font-medium text-foreground-soft">
            {name}
          </span>
          {badgeSrc ? (
            <Img
              src={badgeSrc}
              alt={`${plan} plan`}
              className="h-3 w-auto shrink-0 brightness-0 opacity-65 dark:opacity-70 dark:invert"
            />
          ) : (
            <span className="text-xs leading-3 text-muted-foreground">
              {plan}
            </span>
          )}
        </span>
        <IconChevronUp
          size={16}
          className="ml-auto shrink-0 text-foreground-soft"
        />
      </div>
    </div>
  );
}
