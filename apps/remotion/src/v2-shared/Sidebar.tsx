import type { ReactNode } from "react";
import { IconPlus, IconPuzzleFilled, IconSearch } from "@tabler/icons-react";

import { useRise } from "./motion";
import { SidebarRow } from "./SidebarRow";
import { SquishButton } from "./SquishButton";
import {
  FolderList,
  ThreadGroup,
  type SidebarFolder,
  type SidebarGroup,
} from "./ThreadList";
import { UserButton } from "./UserButton";
import { WhirlLogo } from "./WhirlLogo";

/* Ripped from apps/v2/components/sidebar.tsx — the expanded desktop rail,
   dark mode, at rest. Structure and spacing are v2's to the pixel: an even
   8px beat between blocks, with New and the nav rows pulled onto one shared
   32px pitch by the nav's -mt-1.5.
   Dropped: mobile drawer, collapse toggle, resize handle, page slide,
   incognito — none of them paint here.

   Content and entrance timing are both the shot's to supply, so one rail
   serves a tight crop of its top corner and a full home view alike. */

export const SIDEBAR_WIDTH = 256; // SIDEBAR_DEFAULT_WIDTH, the old w-64

export type SidebarDelays = {
  logo: number;
  newButton: number;
  search: number;
  integrations: number;
  separator: number;
  folders: number;
  /** The first thread group; later ones follow on `groupStagger`. */
  groups: number;
  groupStagger?: number;
  user?: number;
};

export function Sidebar({
  folders = [],
  groups,
  delays,
  user,
}: {
  folders?: SidebarFolder[];
  groups: SidebarGroup[];
  delays: SidebarDelays;
  /* The account row. Omitted for shots cropped above it — rendering it
     off-frame would only change where the flex-1 list stops. */
  user?: { name: string; plan: string };
}) {
  const logo = useRise({ delay: delays.logo });
  const newButton = useRise({ delay: delays.newButton });
  const search = useRise({ delay: delays.search });
  const integrations = useRise({ delay: delays.integrations });
  const separator = useRise({ delay: delays.separator });

  return (
    <aside
      className="relative z-10 flex shrink-0 flex-col gap-2 px-3 pt-3 pb-2"
      style={{ width: SIDEBAR_WIDTH }}
    >
      {/* No background of its own: v2's aside is `md:bg-transparent` on
          desktop and the rail's colour comes from the shell root behind
          it, which also fills the gap around the surface panel. */}

      {/* Fixed height so the row never shifts between toggle states. */}
      <div style={logo}>
        <div className="relative flex h-7 items-center px-1.5">
          <WhirlLogo size={20} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div style={newButton}>
          <SquishButton className="relative h-8 w-full py-0">
            <span className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
              <IconPlus size={16} stroke={2.5} className="shrink-0" />
              <span>New</span>
            </span>
          </SquishButton>
        </div>

        {/* -mt-1.5 pulls the nav onto the same pitch as the New pill: 2px
            seams all the way down. */}
        <nav className="-mt-1.5 flex flex-col gap-0.5">
          <div style={search}>
            <SidebarRow icon={IconSearch} label="Search" />
          </div>
          <div style={integrations}>
            <SidebarRow icon={IconPuzzleFilled} label="Integrations" />
          </div>
        </nav>

        <div style={separator}>
          <div className="mx-1.5 h-px w-auto shrink-0 bg-border" />
        </div>

        {/* -mx-3 + px-3: the scroll region reaches the rail's edges so rows
            can light their full width, while content keeps the rail inset. */}
        <div className="relative -mx-3 min-h-0 flex-1">
          <div className="h-full overflow-hidden px-3">
            <div className="flex flex-col gap-2">
              {folders.length > 0 && (
                <SidebarSlot delay={delays.folders}>
                  <FolderList folders={folders} />
                </SidebarSlot>
              )}
              {groups.map((group, i) => (
                <SidebarSlot
                  key={group.label}
                  delay={delays.groups + i * (delays.groupStagger ?? 0)}
                >
                  <ThreadGroup group={group} />
                </SidebarSlot>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <SidebarSlot delay={delays.user ?? delays.groups}>
          <UserButton name={user.name} plan={user.plan} />
        </SidebarSlot>
      )}
    </aside>
  );
}

/* Its own component so each list section can hold a hook of its own — the
   section count varies per shot, so they can't be hoisted to the top. */
function SidebarSlot({
  delay,
  children,
}: {
  delay: number;
  children: ReactNode;
}) {
  return <div style={useRise({ delay })}>{children}</div>;
}
