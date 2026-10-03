import type { SidebarFolder, SidebarGroup } from "../v2-shared/ThreadList";
import { staticFile } from "remotion";

import type { DemoSuggestion } from "../v2-shared/HomeIntro";
import type { SidebarUser } from "../v2-shared/UserButton";

/* What the still life of the app is dressed in. The camera reads the
   sidebar top to bottom, so the list is long enough to fill the rail and
   every title is something a person might actually have asked. */

export const FOLDERS: SidebarFolder[] = [
  { name: "Side projects", count: 6 },
  { name: "Trip planning", count: 3 },
];

export const GROUPS: SidebarGroup[] = [
  {
    label: "Pinned",
    threads: [
      { title: "Self-hosting Whirl on a Pi", pinned: true },
      { title: "Weekly meal plan", pinned: true },
    ],
  },
  {
    label: "Today",
    threads: [
      { title: "Write the launch announcement" },
      { title: "Pick a license for the repo" },
      { title: "Contributing guide outline" },
      { title: "Why is my Convex query re-running" },
    ],
  },
  {
    label: "Yesterday",
    threads: [
      { title: "Sourdough starter timeline" },
      { title: "Explain CRDTs like I'm five" },
      { title: "Lisbon in October" },
      { title: "Refactor the composer state" },
    ],
  },
  {
    label: "Previous 7 days",
    threads: [
      { title: "Squircles vs rounded rects" },
      { title: "Best mechanical keyboard switches" },
      { title: "Draft a changelog for v2" },
      { title: "Tailwind v4 migration notes" },
      { title: "Is dark mode actually easier on eyes" },
    ],
  },
];

/* The pfp is a pug in a blanket (Unsplash, via picsum.photos id 1025). */
export const USER: SidebarUser = {
  name: "Salt",
  plan: "Platinum",
  imageSrc: staticFile("avatar.jpg"),
  badgeSrc: staticFile("plan-badges/platinum.svg"),
};

export const GREETING = "What are we building today?";

export const SUGGESTIONS: DemoSuggestion[] = [
  { icon: "chef", prompt: "Plan a week of easy dinners" },
  { icon: "chart", prompt: "Chart my spending this month" },
];
