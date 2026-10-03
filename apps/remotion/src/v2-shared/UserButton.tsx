import { IconChevronUp } from "@tabler/icons-react";

/* The rail's bottom chrome, ripped from apps/v2/components/user-button.tsx
   in its signed-in state: avatar, name, plan, and the chevron that opens
   the account menu. h-13 is the slot the skeleton reserves for it.

   v2 renders the plan as a wordmark from /public/plan-badges; that's an
   asset per plan for one line of a demo shot, so the plan name is set as
   text here — the same fallback v2 uses when the plan has no badge. */
export function UserButton({ name, plan }: { name: string; plan: string }) {
  return (
    <div className="h-13">
      <div className="flex h-full w-full items-center gap-2.5 overflow-hidden rounded-lg px-2 py-2 text-left">
        <span className="relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border dark:after:mix-blend-lighten">
          <span className="flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
            {name.slice(0, 1).toUpperCase()}
          </span>
        </span>
        <span className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="max-w-full truncate text-sm leading-4 font-medium text-foreground-soft">
            {name}
          </span>
          <span className="text-xs leading-3 text-muted-foreground">
            {plan}
          </span>
        </span>
        <IconChevronUp
          size={16}
          className="ml-auto shrink-0 text-foreground-soft"
        />
      </div>
    </div>
  );
}
