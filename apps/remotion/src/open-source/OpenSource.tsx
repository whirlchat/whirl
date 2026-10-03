import { AbsoluteFill, Sequence } from "remotion";

import { AppPan } from "./AppPan";
import { MarkCard } from "./MarkCard";
import { ScrittoLine } from "./ScrittoLine";
import {
  MARK,
  PAN,
  STATEMENT,
  VERB_AT,
  VERB_LINES,
  VERBS,
} from "./timeline";
import { TypeCard } from "./TypeCard";

/* "Whirl is now open source." — square, dark, and quiet.
   A camera drifts up the app's sidebar, the first word of "Clone it."
   rolls over to Fork and Improve, the line lands, and the mark flutters
   to close. */

const VERB_CHANGES = VERB_LINES.map((value, i) => ({ at: VERB_AT[i], value }));

export function OpenSource() {
  return (
    <AbsoluteFill className="bg-black">
      <Sequence from={PAN.from} durationInFrames={PAN.frames}>
        <AppPan frames={PAN.frames} />
      </Sequence>
      <Sequence from={VERBS.from} durationInFrames={VERBS.frames}>
        <TypeCard frames={VERBS.frames}>
          <ScrittoLine changes={VERB_CHANGES} />
        </TypeCard>
      </Sequence>
      <Sequence from={STATEMENT.from} durationInFrames={STATEMENT.frames}>
        <TypeCard frames={STATEMENT.frames}>
          Whirl is now
          <br />
          open source.
        </TypeCard>
      </Sequence>
      <Sequence from={MARK.from} durationInFrames={MARK.frames}>
        <MarkCard />
      </Sequence>
    </AbsoluteFill>
  );
}
