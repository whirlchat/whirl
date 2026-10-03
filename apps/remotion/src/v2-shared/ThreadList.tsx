import { IconChevronRight, IconFolderFilled, IconPinFilled } from "@tabler/icons-react";

/* Ripped from apps/v2/components/thread-list.tsx, thread-row.tsx and
   folder-section.tsx, at rest: collapsed folders on top, then date-labelled
   sections of rows. Hover pills, the ⋯ menus, drag handles and the skeleton
   reveal are all interactive-only, so what stays is the resting geometry —
   32px rows on a 2px seam, whisper-quiet 10.5px group markers. */

export type SidebarFolder = { name: string; count: number };
export type SidebarThread = { title: string; pinned?: boolean };
export type SidebarGroup = { label: string; threads: SidebarThread[] };

function FolderRow({ folder }: { folder: SidebarFolder }) {
  return (
    <div className="relative">
      <div className="relative flex h-8 w-full items-center gap-1.5 rounded-lg pr-8 pl-1.5 text-[13.5px]/4 font-medium text-foreground-soft">
        <IconChevronRight size={14} className="relative shrink-0" />
        <IconFolderFilled size={15} className="relative shrink-0" />
        <span className="relative min-w-0 flex-1 truncate text-left">
          {folder.name}
        </span>
      </div>
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-foreground-soft">
        {folder.count}
      </span>
    </div>
  );
}

function ThreadRow({ thread }: { thread: SidebarThread }) {
  return (
    <div className="relative">
      <div className="relative flex h-8 w-full items-center rounded-lg pr-8 pl-2.5 text-[13.5px]/4 font-medium text-foreground-soft">
        <span className="relative min-w-0 flex-1 truncate text-left">
          {thread.title}
        </span>
      </div>
      {/* A quiet mark on pinned threads, at the row's right edge. */}
      {thread.pinned && (
        <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
          <IconPinFilled size={12} className="rotate-45 text-foreground-soft" />
        </span>
      )}
    </div>
  );
}

/** One date section: its marker and rows. Given its own entrance slot. */
export function ThreadGroup({ group }: { group: SidebarGroup }) {
  return (
    <section>
      {/* Deliberately whisper-quiet — these are markers, not rows, and
          must never read as threads. */}
      <div
        className="flex h-5 items-center px-2.5 text-[10.5px]/4 font-medium text-muted-foreground"
        style={{ opacity: 0.55 }}
      >
        {group.label}
      </div>
      <div className="flex flex-col gap-0.5">
        {group.threads.map((thread) => (
          <ThreadRow key={thread.title} thread={thread} />
        ))}
      </div>
    </section>
  );
}

export function FolderList({ folders }: { folders: SidebarFolder[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      {folders.map((folder) => (
        <FolderRow key={folder.name} folder={folder} />
      ))}
    </div>
  );
}
