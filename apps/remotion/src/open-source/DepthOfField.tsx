import { AbsoluteFill } from "remotion";

/* A shallow focus band across the middle of the frame. The plane is
   tilted about the screen's horizontal axis, so depth runs straight down
   the frame and the in-focus slice is a horizontal band — what lies above
   it is further away, what lies below is nearer, and both soften.

   Two backdrop blurs on staggered masks give the falloff a gradient
   instead of a single hard step. They sit as siblings of the plane, never
   inside a filtered ancestor, which would stop them painting at all. */

const LAYERS = [
  { blur: 2.5, mask: "black 0%, transparent 34%, transparent 62%, black 92%" },
  { blur: 7, mask: "black 0%, transparent 22%, transparent 76%, black 100%" },
];

export function DepthOfField() {
  return (
    <>
      {LAYERS.map((layer) => (
        <AbsoluteFill
          key={layer.blur}
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            maskImage: `linear-gradient(to bottom, ${layer.mask})`,
          }}
        />
      ))}
    </>
  );
}
