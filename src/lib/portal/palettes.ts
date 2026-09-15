/**
 * The site's colour palettes, declared once.
 *
 * A palette is a named set of the `--brand-*` tokens in globals.css; selecting
 * one puts `data-palette="<id>"` on <html> and the tokens follow. This file is
 * the registry the picker renders, the provider validates against, and the
 * pre-paint script in layout.tsx trusts — so adding a palette is: a token block
 * in globals.css, and an entry here.
 *
 * Kept free of React and the DOM so it can be imported by the inline script
 * builder and by tests.
 */

export const PALETTE_STORAGE_KEY = "portal-palette";

export type Palette = {
  id: string;
  label: string;
  /** One line under the label in the picker. */
  description: string;
  /**
   * Four chips previewing the palette, light → strong, as the reference design
   * shows. Hex here rather than tokens: the preview must show the palette's
   * colours while a DIFFERENT palette is active, so it cannot read the live
   * variables.
   */
  swatches: readonly [string, string, string, string];
};

export const PALETTES: readonly Palette[] = [
  {
    id: "modern",
    label: "Modern",
    description: "Brand red and navy — the classic look",
    swatches: ["#fbf7f1", "#e9efff", "#1746b5", "#e83444"],
  },
  {
    id: "playful",
    label: "Playful",
    description: "Pink and violet, with a rounder hand-drawn type",
    swatches: ["#fff6fb", "#fde7f1", "#7c3aed", "#d6246e"],
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Near-black on white, nothing to distract",
    swatches: ["#fafafa", "#f4f4f5", "#3f3f46", "#18181b"],
  },
  {
    id: "mono",
    label: "Mono",
    description: "One indigo, every shade",
    swatches: ["#f5f3ff", "#e0e7ff", "#4338ca", "#4f39f6"],
  },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];

/** Modern is the existing site — the default renders exactly as before. */
export const DEFAULT_PALETTE: PaletteId = "modern";

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === "string" && PALETTES.some((p) => p.id === value);
}

/** Anything not a known id — a typo, an old value, a removed palette — is the default. */
export function normalizePalette(value: unknown): PaletteId {
  return isPaletteId(value) ? value : DEFAULT_PALETTE;
}

export function paletteById(id: PaletteId): Palette {
  // `id` is a PaletteId, so the lookup cannot miss; the fallback only satisfies
  // the type system.
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
