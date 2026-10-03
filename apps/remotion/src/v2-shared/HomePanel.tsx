import { Composer } from "./Composer";
import {
  HomeGreeting,
  IncognitoPill,
  SuggestionCards,
  type DemoSuggestion,
} from "./HomeIntro";
import { useRise } from "./motion";

/* The surface panel on home, ripped from apps/v2/components/app-shell.tsx
   and chat-view.tsx: the dock centred in the pane with the greeting above
   it and the starter capsules below, and the incognito pill floating in
   the top-right corner.

   The dock is `absolute inset-0 justify-center pb-16` in v2 — the pb is
   what sits the whole stack slightly above true centre.

   Content and entrance timing are the shot's to supply: a cascade for a
   shot introducing the view, all-zero delays for one that has already
   shown it and is only re-dressing it. */

export type PanelDelays = {
  panel: number;
  greeting: number;
  composer: number;
  suggestions: number;
  incognito: number;
};

export function HomePanel({
  greeting,
  suggestions,
  delays,
}: {
  greeting: string;
  suggestions: readonly DemoSuggestion[];
  delays: PanelDelays;
}) {
  const panel = useRise({ delay: delays.panel });
  const greetingRise = useRise({ delay: delays.greeting });
  const composer = useRise({ delay: delays.composer });
  const suggestionsRise = useRise({ delay: delays.suggestions });
  const incognito = useRise({ delay: delays.incognito });

  return (
    <main
      className="raised relative my-2 mr-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-surface"
      style={panel}
    >
      <div className="absolute top-3 right-3 z-10" style={incognito}>
        <IncognitoPill />
      </div>
      <div className="absolute inset-0 flex flex-col justify-center px-6 pb-16">
        <div className="mx-auto w-full max-w-2xl">
          <div style={greetingRise}>
            <HomeGreeting text={greeting} />
          </div>
          <div style={composer}>
            <Composer />
          </div>
          <div style={suggestionsRise}>
            <SuggestionCards suggestions={suggestions} />
          </div>
        </div>
      </div>
    </main>
  );
}
