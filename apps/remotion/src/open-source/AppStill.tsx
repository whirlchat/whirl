import { HomePanel } from "../v2-shared/HomePanel";
import { Sidebar } from "../v2-shared/Sidebar";
import {
  FOLDERS,
  GREETING,
  GROUPS,
  SUGGESTIONS,
  USER,
} from "./app-content";

/* The whole v2 window at rest, dark mode, at its true logical size: the
   ripped rail on the left, the home panel beside it. The camera does all
   the moving, so nothing in here animates — every entrance delay sits far
   in the past. */

export const APP_WIDTH = 1240;
export const APP_HEIGHT = 940;

const SETTLED = -1000;

export function AppStill() {
  return (
    <div
      className="dark v2-surface flex overflow-hidden rounded-[18px] bg-background"
      style={{ width: APP_WIDTH, height: APP_HEIGHT }}
    >
      <Sidebar
        folders={FOLDERS}
        groups={GROUPS}
        user={USER}
        delays={{
          logo: SETTLED,
          newButton: SETTLED,
          search: SETTLED,
          integrations: SETTLED,
          separator: SETTLED,
          folders: SETTLED,
          groups: SETTLED,
          user: SETTLED,
        }}
      />
      <HomePanel
        greeting={GREETING}
        suggestions={SUGGESTIONS}
        delays={{
          panel: SETTLED,
          greeting: SETTLED,
          composer: SETTLED,
          suggestions: SETTLED,
          incognito: SETTLED,
        }}
      />
    </div>
  );
}
