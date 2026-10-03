/* The open-source announcement, beat by beat. Square, 60fps, and every
   number below is a frame count — each scene is a Sequence, so its own
   frames start at 0 and only the hand-offs between them live here. */

export const FPS = 60;
export const SIZE = 1080;

/** The camera drifting up the sidebar. */
export const PAN = { from: 0, frames: 252 };

/** "Clone it." → "Fork it." → "Improve it.", the first word rolling over. */
export const VERBS = { from: 246, frames: 228 };
export const VERB_LINES = ["Clone it.", "Fork it.", "Improve it."];
/** When each line lands, relative to the scene. The first one rises in. */
export const VERB_AT = [0, 62, 124];

/** "Whirl is now open source." */
export const STATEMENT = { from: 486, frames: 136 };

/** The mark, fluttering once and holding to the end. */
export const MARK = { from: 630, frames: 180 };

export const DURATION = MARK.from + MARK.frames;

/* One cadence for every line of type: in on a soft rise, out on the
   shorter counter-motion. */
export const TYPE_IN = 22;
export const TYPE_OUT = 16;
