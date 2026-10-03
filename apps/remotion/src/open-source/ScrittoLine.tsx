import "@scritto/react";
import type { Scritto, Transition } from "@scritto/react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { fontsReady } from "./fonts";

/* A line of text whose changes roll over with Scritto (scrit.to).

   Scritto plays its rolls on the Web Animations API, against wall-clock
   time — and Remotion never lets time run. It renders each frame on its
   own, out of order, across several tabs, so a tab drawing frame 80 has
   never seen the value change at frame 62.

   So every frame rebuilds the change it sits inside: mount the element on
   the previous value, set the new one, let Scritto build its animations,
   then pause every one of them and seek it to where this frame falls in
   the roll. The motion is Scritto's own, frame-exact, from any frame. */

const TRANSITION: Partial<Transition> = { duration: 640 };

/** How long a roll takes to fully settle, ghosts and all, in ms. */
const ROLL_MS = 1400;

type Change = { at: number; value: string };

export function ScrittoLine({
  changes,
  className,
  style,
}: {
  /** Values in order, each from the frame it lands on (scene-relative). */
  changes: Change[];
  className?: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const index = changes.reduce(
    (latest, change, i) => (change.at <= frame ? i : latest),
    0,
  );
  const current = changes[index];
  const elapsedMs = ((frame - current.at) / fps) * 1000;
  const rolling = index > 0 && elapsedMs < ROLL_MS;

  /* Keyed per change, so each roll (and each settled value) gets a fresh
     element to rebuild from rather than inheriting the last one's state. */
  return (
    <SeekedScritto
      key={rolling ? `roll-${index}` : `rest-${index}`}
      from={rolling ? changes[index - 1].value : current.value}
      to={current.value}
      elapsedMs={rolling ? elapsedMs : null}
      className={className}
      style={style}
    />
  );
}

function SeekedScritto({
  from,
  to,
  elapsedMs,
  className,
  style,
}: {
  from: string;
  to: string;
  /** Where in the roll this frame sits, or null to draw `to` at rest. */
  elapsedMs: number | null;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<Scritto>(null);
  const animations = useRef<Animation[]>([]);
  /* Read by the async setup, which outlives the render that started it. */
  const elapsed = useRef(elapsedMs);
  elapsed.current = elapsedMs;
  const [ready, setReady] = useState(false);
  const rolls = elapsedMs !== null;

  useLayoutEffect(() => {
    const handle = delayRender(`Scritto: ${from} → ${to}`);
    let cancelled = false;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      continueRender(handle);
    };

    const build = async () => {
      await fontsReady();
      const element = ref.current;
      if (cancelled || !element) return;

      element.setOptions({
        transition: TRANSITION,
        respectMotionPreference: false,
      });
      element.update(from, false);
      if (rolls) {
        /* A frame's breath between the two values, so Scritto measures the
           old layout as painted before it plans the roll. */
        await nextFrame();
        element.update(to, true);
        /* Updates are batched onto a microtask; a macrotask later every
           animation of this change exists. */
        await nextTask();
        const all = [
          ...element.getAnimations({ subtree: true }),
          ...(element.shadowRoot?.getAnimations() ?? []),
        ];
        animations.current = [...new Set(all)];
        /* Seeked here too, not only by the effect below: the frame is
           captured as soon as the render is released, which can beat the
           re-render that `ready` schedules. */
        seek(animations.current, elapsed.current ?? 0);
      }
      if (!cancelled) setReady(true);
    };

    build().then(release, (error) => cancelRender(error));
    return () => {
      cancelled = true;
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      release();
    };
  }, [from, to, rolls]);

  /* Runs every frame of the roll, after setup and on each seek. */
  useLayoutEffect(() => {
    if (!ready || elapsedMs === null) return;
    seek(animations.current, elapsedMs);
  }, [ready, elapsedMs]);

  return <scritto-text ref={ref} className={className} style={style} />;
}

function seek(animations: Animation[], ms: number) {
  for (const animation of animations) {
    animation.pause();
    animation.currentTime = ms;
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function nextTask() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}
