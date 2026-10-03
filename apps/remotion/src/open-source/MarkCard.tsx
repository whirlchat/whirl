import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { WhirlAnimatedMark } from "../v2-shared/WhirlAnimatedMark";

/* The sign-off: the mark comes up out of black and flutters once — the
   petal flip from apps/v2/public/whirl-animate.svg, driven by frame — then
   holds to the end. */

const MARK_SIZE = 340;
/** v2's 2.4s cycle spends 62% of itself moving: 1.49s per petal. */
const FLIP_SECONDS = 2.4 * 0.62;
/** The flutter starts while the mark is still arriving, so it never parks. */
const FLIP_START = 10;
const FADE_IN = 26;

export function MarkCard() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrived = interpolate(frame, [0, FADE_IN], [0, 1], {
    easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const grown = spring({
    frame,
    fps,
    config: { stiffness: 120, damping: 24, mass: 1 },
  });

  return (
    <AbsoluteFill className="items-center justify-center">
      <div
        style={{
          color: "#f5f5f7",
          opacity: arrived,
          transform: `scale(${0.92 + grown * 0.08})`,
        }}
      >
        <WhirlAnimatedMark
          size={MARK_SIZE}
          start={FLIP_START}
          frames={Math.round(FLIP_SECONDS * fps)}
        />
      </div>
    </AbsoluteFill>
  );
}
