import type { Icon } from "@tabler/icons-react";

/* Ripped from apps/v2/components/sidebar-row.tsx (with row-pill.tsx folded
   in as the resting layer). Flat nav row: icon and label share the soft
   chrome ink. The interactive states — hover pill, press, the ::before hit
   area, the collapsed-rail variant — carry no pixels in a video, so what
   stays is the resting geometry and type: h-8, gap-2.5, px-2.5, 13.5px/4
   medium on `foreground-soft`. */
export function SidebarRow({
  icon: RowIcon,
  label,
}: {
  icon: Icon;
  label: string;
}) {
  return (
    <div className="relative flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13.5px]/4 font-medium text-foreground-soft">
      <RowIcon size={16} className="relative shrink-0" />
      <span className="relative truncate">{label}</span>
    </div>
  );
}
