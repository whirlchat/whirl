import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

import { CONTINUOUS } from "../v2-shared/motion";
import { AppStill } from "./AppStill";
import { DepthOfField } from "./DepthOfField";
import { SIZE } from "./timeline";

/* A camera laid low over the app, tilted back and turned, drifting up the
   sidebar from the account row to the mark at the top.

   The plane is pinned at its top-left and transformed right to left: slide
   the focus point to the origin, turn it in the plane, tilt it back, then
   drop the origin on the frame's centre. Because the turn and tilt pivot
   on the focus point, panning is just moving that point — the framing
   never has to be re-solved.

   The magnification is CSS zoom, not a scale(): zoom lays the app out at
   the bigger size, so its type rasterizes crisp. A scale() would paint it
   at 1x and stretch the bitmap — soft even inside the focus band. */

const PERSPECTIVE = 2100;
const MAGNIFY = 2.3;

/* Focus points in app pixels: the middle of the rail's rows, from the
   foot of the thread list up to the logo row. */
const FOCUS_X = [146, 118];
const FOCUS_Y = [860, 70];

/** Degrees. The turn settles a little as the camera climbs. */
const TURN = [27, 22];
const TILT = [44, 40];

const FADE_IN = 34;
const FADE_OUT = 26;

export function AppPan({ frames }: { frames: number }) {
  const frame = useCurrentFrame();

  /* CONTINUOUS rather than an ease-in-out: the camera is still moving
     under both fades, so it never parks on a frame of black. */
  const travel = interpolate(frame, [0, frames - 1], [0, 1], {
    easing: CONTINUOUS,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const along = (range: number[]) => interpolate(travel, [0, 1], range);

  const shade = Math.max(
    interpolate(frame, [0, FADE_IN], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(frame, [frames - FADE_OUT, frames - 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  return (
    <AbsoluteFill className="overflow-hidden bg-black">
      <AbsoluteFill style={{ perspective: PERSPECTIVE }}>
        <div
          className="absolute top-0 left-0"
          style={{
            transformOrigin: "0 0",
            transform: [
              `translate(${SIZE / 2}px, ${SIZE / 2}px)`,
              `rotateX(${along(TILT)}deg)`,
              `rotateZ(${along(TURN)}deg)`,
              `translate(${-along(FOCUS_X) * MAGNIFY}px, ${-along(FOCUS_Y) * MAGNIFY}px)`,
            ].join(" "),
          }}
        >
          <div style={{ zoom: MAGNIFY }}>
            <AppStill />
          </div>
        </div>
      </AbsoluteFill>
      <DepthOfField />
      <AbsoluteFill className="bg-black" style={{ opacity: shade }} />
    </AbsoluteFill>
  );
}
