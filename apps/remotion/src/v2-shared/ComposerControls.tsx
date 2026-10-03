import {
  IconArrowUp,
  IconPlus,
  IconSparklesFilled,
} from "@tabler/icons-react";

import { SquishButton } from "./SquishButton";

/* The three controls pinned to the composer's corners, ripped from v2 at
   rest. Hover, press and open states carry no pixels in a video, so what
   survives each is its resting geometry and type. */

/** attach-menu.tsx — the trigger, minus the menu it opens. */
export function AttachButton() {
  return (
    <div className="raised flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
      <IconPlus size={18} stroke={2.5} />
    </div>
  );
}

/* model-select.tsx — the popover trigger. Its label rides a width-animated
   span in the app so switching models rolls the chip open or shut; at rest
   that's just the glyph and the name. Auto's glyph is IconSparklesFilled
   (lib/models.ts), resolved through ModelGlyph. */
export function ModelChip({ name }: { name: string }) {
  return (
    <div className="relative flex h-9 shrink-0 items-center rounded-full px-3 text-[13.5px]/4 font-medium text-muted-foreground">
      <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
        <IconSparklesFilled size={15} className="shrink-0" />
        {name}
      </span>
    </div>
  );
}

/* send-button.tsx — the "send" face of the one persistent pill that also
   wears sending and stop. */
export function SendButton() {
  return (
    <SquishButton className="relative size-9 shrink-0 justify-center rounded-full p-0">
      <span className="absolute inset-0 flex items-center justify-center">
        <IconArrowUp size={18} stroke={2.5} />
      </span>
    </SquishButton>
  );
}
