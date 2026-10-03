/* The composer's resting dimensions, in app pixels. Its own module so the
   shots can lay out around the pill without importing the component. */

/** max-w-2xl, the dock width in v2's chat-view.tsx. */
export const COMPOSER_WIDTH = 672;

/* p-2 twice around a one-row 36px textbox, plus the 1px border on each
   edge — the pill has no fixed height, so its border adds to the box
   rather than sitting inside it. Getting this wrong offsets anything laid
   out against the pill's edges (the shine traces them). */
export const COMPOSER_HEIGHT = 8 + 36 + 8 + 2;

/** The pill's rounded-[26px]. */
export const COMPOSER_RADIUS = 26;
