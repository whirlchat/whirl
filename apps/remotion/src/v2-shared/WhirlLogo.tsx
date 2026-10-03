import { staticFile } from "remotion";
import type { CSSProperties } from "react";

/* Ripped from apps/v2/components/whirl-logo.tsx + whirl-rings.tsx, at rest.
   The mark is a mask over a solid fill (never an <img>) so it inherits the
   chrome ink — `bg-foreground-soft`, exactly like the sidebar labels.

   v2 stacks an outer and an inner ring so a spin can counter-rotate them;
   the classic swirl has no separable inner ring, so its mask art is empty
   and only the outer one ever paints. Nothing spins in this shot, so the
   empty layer is left out rather than rendered as a no-op. */
function maskStyle(url: string): CSSProperties {
  return {
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

export function WhirlLogo({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const dim = `${size}px`;

  return (
    <span
      style={{ width: dim, height: dim }}
      className={`relative inline-block shrink-0 ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={maskStyle(staticFile("whirl-ring-outer.svg"))}
      >
        <span className="absolute inset-0 bg-foreground-soft" />
      </span>
    </span>
  );
}
