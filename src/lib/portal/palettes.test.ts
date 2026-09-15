// The palette registry is trusted by three consumers — the picker, the
// provider, and layout.tsx's pre-paint script — so its invariants are pinned
// here, and globals.css is checked for a token block per palette (a palette
// with no tokens would select cleanly and change nothing).

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_PALETTE,
  PALETTES,
  isPaletteId,
  normalizePalette,
  paletteById,
} from "./palettes";

const css = fs.readFileSync(path.join(process.cwd(), "src", "app", "globals.css"), "utf8");

describe("registry", () => {
  it("has unique ids and labels", () => {
    const ids = PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const labels = PALETTES.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("includes the two the brief named, and the default is the existing look", () => {
    expect(PALETTES.map((p) => p.id)).toEqual(expect.arrayContaining(["modern", "playful"]));
    expect(DEFAULT_PALETTE).toBe("modern");
  });

  it("previews each palette with exactly four hex chips", () => {
    for (const p of PALETTES) {
      expect(p.swatches).toHaveLength(4);
      for (const hex of p.swatches) expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("normalisation — anything unknown is the default, never an error", () => {
  it.each([null, undefined, "", "Playful", "dark", 3, {}])("normalises %p", (v) => {
    expect(normalizePalette(v)).toBe(DEFAULT_PALETTE);
    expect(isPaletteId(v)).toBe(false);
  });

  it("passes a known id through", () => {
    for (const p of PALETTES) {
      expect(normalizePalette(p.id)).toBe(p.id);
      expect(paletteById(p.id).label).toBe(p.label);
    }
  });
});

describe("every palette has a token block in globals.css", () => {
  const TOKENS = [
    "--brand-ink",
    "--brand-accent",
    "--brand-accent-soft",
    "--brand-accent-bright",
    "--brand-blue",
    "--brand-blue-soft",
    "--brand-blue-bright",
    "--brand-sky",
    "--brand-paper",
    "--font-brand",
  ];

  it.each(PALETTES.map((p) => p.id))("%s declares all tokens", (id) => {
    const start = css.indexOf(`[data-palette="${id}"]`);
    expect(start, `no [data-palette="${id}"] block`).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf("}", start));
    for (const token of TOKENS) {
      expect(block, `${id} is missing ${token}`).toContain(`${token}:`);
    }
  });

  it("the default palette's tokens also apply to :root, so no attribute still renders it", () => {
    expect(css).toMatch(/:root,\s*\[data-palette="modern"\]/);
  });

  it("only Playful swaps the font", () => {
    for (const p of PALETTES) {
      const start = css.indexOf(`[data-palette="${p.id}"]`);
      const block = css.slice(start, css.indexOf("}", start));
      const usesShantell = block.includes("var(--font-shantell)");
      expect(usesShantell, `${p.id} font`).toBe(p.id === "playful");
    }
  });
});
