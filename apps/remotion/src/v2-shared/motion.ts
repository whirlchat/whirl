import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/* v2's entrance and exit (apps/v2/lib/motion.ts `rise`, and the AwayFace
   exit in app-shell.tsx), re-expressed as functions of the current frame,
   so the shots move with the motion the product actually ships.

   In: a soft blur-fade with a short rise. Same numbers as the app —
   opacity and blur over 300ms on EASE_OUT, y on a 420/34/0.9 spring.
   Delays cascade the elements of a view; they don't change the motion.

   Out: the app's own harder, shorter counter-motion — it drifts UP and
   blurs away on a hard-in curve, rather than reversing the entrance.

   rise runs INSIDE a shot's magnified layer, so its numbers are the app's
   own. fall runs outside it, on the shot as a whole, so its numbers are in
   VIDEO pixels — a shot has to leave by the same visible amount whether
   it's a 10x zoom or a 1.6x product view. */

/* The cut's cadence. Every shot arrives and leaves on these, whatever
   form the transition takes, so consecutive shots read as one piece of
   film rather than clips with their own timing. The in is v2's rise
   (300ms); the out is the shorter, harder counter-motion. */
export const IN_FRAMES = 18;
export const OUT_FRAMES = 13;

/* Defocus depth in VIDEO pixels, for shots that blur as a whole. rise and
   fall size their blur in APP pixels (4 and 3 below), which is what these
   come to at v2Frame1's 6.5x. Pinned in video space so shots at different
   magnifications defocus by the same visible amount. */
export const DEFOCUS_IN_PX = 26;
export const DEFOCUS_OUT_PX = 20;

/* The curve for anything that travels the length of a shot — pans, and the
   shines tracing an outline.
 *
 * NOT ease-in-out. These shots are cut back to back, and a standard
 * ease-in-out has zero velocity at both ends: every shot would decelerate
 * to a dead stop just before its cut and the next would start from one.
 * Across a cut that reads as a stutter, however smooth each shot is on its
 * own.
 *
 * So this eases, but only softly — the control points leave ~0.7x of the
 * average speed at both ends instead of 0. Motion is still visibly slower
 * through the extremes than a linear ramp, but it never actually stops, so
 * one shot hands over to the next while both are moving. */
export const CONTINUOUS = Easing.bezier(0.42, 0.3, 0.58, 0.7);

const EASE_OUT = Easing.bezier(0.22, 0.61, 0.36, 1);
const RISE_PX = 10;
const BLUR_PX = 4;

const EASE_IN = Easing.bezier(0.4, 0, 1, 1);
/* What v2's 6px drift and 3px blur come to at v2Frame1's 6.5x, which set
   the look for the cut. */
const FALL_PX = 39;
const FALL_BLUR_PX = 20;

export type Motion = {
  opacity: number;
  transform: string;
  filter: string;
};

export function useRise({ delay = 0 }: { delay?: number } = {}): Motion {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  const fade = interpolate(local, [0, IN_FRAMES], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settle = spring({
    frame: local,
    fps,
    config: { stiffness: 420, damping: 34, mass: 0.9 },
  });

  /* A settled blur(0) is still a filter, and a filter makes its own layer —
     under a 3D camera that layer rasterizes at 1x and smears. */
  const blur = (1 - fade) * BLUR_PX;
  return {
    opacity: fade,
    transform: `translateY(${(1 - settle) * RISE_PX}px)`,
    filter: blur > 0.01 ? `blur(${blur}px)` : "none",
  };
}

/* For camera-style shots — a pan or a push, where the app itself never
   moves. rise/fall above are ELEMENT motion: a vertical hop plus a blur
   sized in app pixels. Magnified onto a whole shot that is already
   travelling horizontally, the hop becomes a large jump running crosswise
   to the travel, and the two read as unrelated moves happening at once.
   So a travelling shot gets no transform of its own: it simply comes into
   and out of focus, and the travel carries all the movement. */
export function useCameraFade({
  inFrames = IN_FRAMES,
  outStart,
  outFrames = OUT_FRAMES,
  blurIn = DEFOCUS_IN_PX,
  blurOut = DEFOCUS_OUT_PX,
}: {
  inFrames?: number;
  outStart: number;
  outFrames?: number;
  blurIn?: number;
  blurOut?: number;
}): { opacity: number; filter: string } {
  const frame = useCurrentFrame();

  const arrived = interpolate(frame, [0, inFrames], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const left = interpolate(frame, [outStart, outStart + outFrames], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    opacity: arrived * (1 - left),
    filter: `blur(${(1 - arrived) * blurIn + left * blurOut}px)`,
  };
}

/* v2's LabelMorph (components/ui/label-morph.tsx) — the app's motion for
   something REPLACING what was already there, as opposed to rise, which is
   for something appearing on an empty patch of screen. It leaves upward and
   arrives from below, both through a blur, with y on a spring stiff enough
   that the words have exchanged before the eye finishes the defocus.
 *
 * One window rather than separate in/out hooks: a swap that has to survive
 * being seeked to any frame can't branch on which half it's in. */
const SWAP_SPRING = { stiffness: 520, damping: 34, mass: 1 };
const SWAP_PX = 8;
const SWAP_BLUR_PX = 5;
/** v2 runs the fade over 260ms. */
const SWAP_FADE = 16;

export function useSwap(at: number, until?: number): Motion {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrived = interpolate(frame - at, [0, SWAP_FADE], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settled = spring({ frame: frame - at, fps, config: SWAP_SPRING });

  const left =
    until === undefined
      ? 0
      : interpolate(frame - until, [0, SWAP_FADE], [0, 1], {
          easing: EASE_OUT,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const lifted =
    until === undefined
      ? 0
      : spring({ frame: frame - until, fps, config: SWAP_SPRING });

  const y = (1 - settled) * SWAP_PX - lifted * SWAP_PX;
  const blur = ((1 - arrived) + left) * SWAP_BLUR_PX;

  return {
    opacity: arrived * (1 - left),
    transform: `translateY(${y}px)`,
    filter: blur > 0.01 ? `blur(${blur}px)` : "none",
  };
}

/** The counter-motion. Inert before `start`. */
export function useFall({
  start,
  frames = OUT_FRAMES,
}: {
  start: number;
  frames?: number;
}): Motion {
  const frame = useCurrentFrame();

  const gone = interpolate(frame, [start, start + frames], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    opacity: 1 - gone,
    transform: `translateY(${-gone * FALL_PX}px)`,
    filter: `blur(${gone * FALL_BLUR_PX}px)`,
  };
}
