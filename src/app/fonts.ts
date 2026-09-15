import localFont from "next/font/local";

export const jameelNoori = localFont({
  src: [
    {
      path: "./fonts/JameelNooriNastaleeqRegular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-jameel",
  display: "swap",
});

import { Shantell_Sans } from "next/font/google";

/**
 * The Playful palette's body face — a bouncy, marker-like sans. Loaded here so
 * next/font self-hosts it (no runtime request to Google, no layout shift) and
 * exposes it as `--font-shantell`, which globals.css's `[data-palette="playful"]`
 * reads into `--font-brand`. Only ever rendered when that palette is selected;
 * `display: "swap"` keeps Roboto on screen until it has loaded.
 */
export const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-shantell",
  display: "swap",
});
