import {
  IconChartBar,
  IconChefHat,
  IconGhost2,
  IconX,
} from "@tabler/icons-react";

import { WhirlLogo } from "./WhirlLogo";

/* The home face's dressing around the composer, ripped from
   apps/v2/components/home-intro.tsx, suggestion-cards.tsx and
   incognito-toggle.tsx — at rest, with the greeting's crossfades, the
   capsules' hover-expand and torph morphing all dropped. */

/** The mark and a witty personalised line. mb-7 h-10 is v2's fixed slot. */
export function HomeGreeting({ text }: { text: string }) {
  return (
    <div className="mb-7 h-10">
      <div className="flex h-full min-w-0 items-center justify-center gap-3">
        {/* An exact 32px flex box — the logo's inline-block span would
            otherwise pick up baseline space and ride a few px high. */}
        <span className="relative size-8 shrink-0">
          <span className="absolute inset-0 flex items-center justify-center">
            <WhirlLogo size={32} />
          </span>
        </span>
        <h1 className="min-w-0 truncate text-[28px]/9 font-medium tracking-tight">
          {text}
        </h1>
      </div>
    </div>
  );
}

const SUGGESTION_ICONS = { chef: IconChefHat, chart: IconChartBar };

export type DemoSuggestion = {
  icon: keyof typeof SUGGESTION_ICONS;
  prompt: string;
};

/* Conversation starters under the composer: one slim line each, the
   starter's mark and its prompt. Same recessed well and pill geometry as
   the composer, so they read as one family. */
export function SuggestionCards({
  suggestions,
}: {
  suggestions: readonly DemoSuggestion[];
}) {
  return (
    <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
      {suggestions.map((suggestion) => {
        const Icon = SUGGESTION_ICONS[suggestion.icon];
        return (
          <div key={suggestion.prompt} className="relative h-9">
            <div className="absolute inset-x-0 top-0 flex h-9 w-full items-start overflow-hidden rounded-full bg-well shadow-[inset_0_0_0_1px_var(--well-outline),inset_0_1px_0_0_var(--well-highlight)]">
              <div className="flex min-h-9 min-w-0 flex-1 items-start gap-2 py-[9px] pl-3.5 text-left">
                {/* mt-[2px] centres the 14px glyph on the first 18px line. */}
                <span
                  aria-hidden
                  className="relative mt-[2px] flex size-3.5 shrink-0 items-center justify-center text-muted-foreground"
                >
                  <Icon size={14} />
                </span>
                <span className="flex min-h-[18px] min-w-0 flex-1 items-start overflow-hidden text-[13px]/[18px] text-muted-foreground">
                  <span className="max-w-full truncate leading-[18px]">
                    {suggestion.prompt}
                  </span>
                </span>
              </div>
              <div
                className="mt-1.5 mr-2 flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                style={{ opacity: 0.55 }}
              >
                <IconX size={13} stroke={2.25} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* The go-incognito pill, top-right of the panel.
   v2 fills it with --well-translucent over a backdrop-blur; here it takes
   the solid well instead. Chromium refuses to render a descendant
   backdrop-filter under ANY ancestor filter — and the shot's exit puts one
   on the whole frame — so the blur would never have painted anyway, and
   the translucent fill without it reads as a washed-out hole. */
export function IncognitoPill() {
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-well text-muted-foreground shadow-[inset_0_0_0_1px_var(--well-outline),inset_0_1px_0_0_var(--well-highlight)]">
      <IconGhost2 size={18} stroke={2} />
    </div>
  );
}
