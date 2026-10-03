import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { fontFamily } from "./fonts";
import { TYPE_IN, TYPE_OUT } from "./timeline";

/* A title card: one centred line of type on black. It rises in softly and
   leaves on a shorter, lighter lift — no blur, no glow, just the words. */

const EASE_OUT = Easing.bezier(0.22, 0.61, 0.36, 1);
const EASE_IN = Easing.bezier(0.4, 0, 1, 1);
const RISE_PX = 18;
const LIFT_PX = 10;

export const HEADLINE_STYLE = {
  fontFamily,
  fontSize: 76,
  fontWeight: 600,
  letterSpacing: "-0.035em",
  lineHeight: 1.08,
  color: "#f5f5f7",
} as const;

export function TypeCard({
  frames,
  children,
}: {
  /** The scene's length; the exit lands on its last frame. */
  frames: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrived = interpolate(frame, [0, TYPE_IN], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settled = spring({
    frame,
    fps,
    config: { stiffness: 140, damping: 26, mass: 1 },
  });
  const left = interpolate(frame, [frames - TYPE_OUT, frames - 1], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="items-center justify-center">
      <div
        className="text-center"
        style={{
          ...HEADLINE_STYLE,
          opacity: arrived * (1 - left),
          transform: `translateY(${(1 - settled) * RISE_PX - left * LIFT_PX}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}
