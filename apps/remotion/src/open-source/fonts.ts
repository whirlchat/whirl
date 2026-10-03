import { loadFont } from "@remotion/google-fonts/Inter";

/* Inter, as v2 ships it. loadFont holds the render until the faces are in,
   and waitUntilDone lets Scritto hold its own setup until then too — it
   measures glyph boxes, and a measurement taken against the fallback face
   would roll every character to the wrong place. */
const inter = loadFont("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const fontFamily = inter.fontFamily;
export const fontsReady = inter.waitUntilDone;
