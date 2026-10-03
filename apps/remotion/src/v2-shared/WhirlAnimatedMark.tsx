import type { ReactNode } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  PETAL_CASCADE_SECONDS,
  PETAL_VIEWBOX,
  PETALS,
} from "./whirl-petals";

/* The Whirl mark's flip, ripped from the keyframes inside
   apps/v2/public/whirl-animate.svg and re-expressed as a function of the
   current frame. Each petal squashes flat, reopens mirrored on the other
   side and flips back, growing a touch and drifting outward mid-flip,
   with a 0.04s cascade running round the mark.
   The flip axis is per-petal, and the artwork counter-rotates by the same
   angle so only the axis turns, not the petal's drawing. */

const EASE = Easing.bezier(0.55, 0, 0.3, 1);

/* The source cycle is 2.4s, but only its first 62% is motion — the rest is
   a pause before it loops. Playing once, that pause is just dead air, so
   the keyframes are remapped onto the motion alone (0.32 / 0.62 = 0.516)
   and the duration is the caller's to set. */
const MID = 0.32 / 0.62;

/** Peak outward drift, in the artwork's own units. */
const DRIFT = 9;
/** How much a petal grows at full flip. */
const GROW = 1.2;

export function WhirlAnimatedMark({
  size,
  start,
  frames,
  className = "",
  fill = "currentColor",
  defs,
}: {
  size: number;
  /** Frame the first petal begins on. */
  start: number;
  /** How long ONE petal's flip takes; the cascade runs past it. */
  frames: number;
  className?: string;
  /* Every petal's paint. Defaults to currentColor, which is what the title
     cards want. A paint server can be passed instead — see `defs` — but it
     has to be in userSpaceOnUse units to span the mark: objectBoundingBox
     would restart the gradient inside each of the twelve petals, so a
     highlight meant to cross the whole logo would appear twelve times. */
  fill?: string;
  /** Paint servers for `fill`, rendered into the svg's own <defs>. */
  defs?: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <svg
      width={size}
      height={size}
      viewBox={PETAL_VIEWBOX}
      fill="none"
      className={className}
      style={{ display: "block" }}
    >
      {defs && <defs>{defs}</defs>}
      {PETALS.map((petal) => {
        const p = interpolate(
          frame - start - petal.delay * fps,
          [0, frames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const at = (to: number[]) =>
          interpolate(p, [0, MID, 1], to, { easing: EASE });

        return (
          <g
            key={petal.d}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: [
                `rotate(${petal.angle}deg)`,
                `translate(${at([0, DRIFT, 0])}px, 0)`,
                `scale(${at([1, GROW, 1])}, ${at([1, -1, 1])})`,
                `rotate(${-petal.angle}deg)`,
              ].join(" "),
            }}
          >
            <path d={petal.d} fill={fill} />
          </g>
        );
      })}
    </svg>
  );
}

/** Frames the whole cascade takes, given one petal's flip duration. */
export function markFlipFrames(frames: number, fps: number) {
  return frames + (PETALS.length - 1) * PETAL_CASCADE_SECONDS * fps;
}
