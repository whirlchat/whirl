import { COMPOSER_WIDTH } from "./composer-metrics";
import { AttachButton, ModelChip, SendButton } from "./ComposerControls";

/* Ripped from apps/v2/components/composer.tsx — the collapsed, empty,
   non-floating pill (the home dock; `floating` is only true in a thread,
   where it swaps to a translucent fill and a backdrop blur).
   Dropped: the attachment tray, mention chips, the command menu, the
   drag-and-drop overlay, and the measurement pass that drives the morph.

   The insets are what that pass computes at rest: the textbox clears the
   attach button on the left and the chip-plus-send cluster on the right,
   each by the control's own width plus the 6px gap. */
const INSET_LEFT = 36 + 6;
const INSET_RIGHT = 121 + 6;
/** One row of 15px/24px text inside the textarea's py-1.5. */
const TEXTBOX_HEIGHT = 36;

export function Composer({ placeholder = "Ask anything" }: { placeholder?: string }) {
  return (
    /* A real border rather than the shared inset highlight: Chromium can
       flash the top edge of an inset shadow on this pill. */
    <div
      className="rounded-[26px] border border-[var(--well-outline)] bg-well"
      style={{ width: COMPOSER_WIDTH }}
    >
      <div className="relative p-2">
        <div
          className="relative"
          style={{
            marginLeft: INSET_LEFT,
            marginRight: INSET_RIGHT,
            height: TEXTBOX_HEIGHT,
          }}
        >
          {/* The textarea's own placeholder, with its metrics. */}
          <div className="relative block h-full w-full px-1.5 py-1.5 text-[15px]/6 text-muted-foreground">
            {placeholder}
          </div>
        </div>
        <div className="absolute bottom-2 left-2">
          <AttachButton />
        </div>
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          <ModelChip name="Auto" />
          <SendButton />
        </div>
      </div>
    </div>
  );
}
