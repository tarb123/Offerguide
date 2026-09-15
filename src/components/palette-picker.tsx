"use client";

/**
 * PalettePicker — the palette icon beside the light/dark toggle. Opens a menu
 * of the palettes in lib/portal/palettes.ts, each with its name and four
 * colour chips; choosing one applies it site-wide at once (see PaletteProvider).
 *
 * Styled to sit beside ThemeToggle (same outline icon button) and to match the
 * header's own dropdowns — the same rounded panel, shadow and row hover — so
 * the two controls read as one cluster.
 */

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePalette } from "@/components/palette-provider";
import { PALETTES, paletteById } from "@/lib/portal/palettes";

export function PalettePicker() {
  const { palette, setPalette } = usePalette();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape, like a native menu.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = paletteById(palette);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Colour palette: ${current.label}. Click to change.`}
        title={`Palette: ${current.label}`}
      >
        <Palette size={18} />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Choose a colour palette"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-brand-ink/10 bg-white p-2 shadow-[0_24px_60px_rgba(11,22,63,0.16)] dark:border-white/10 dark:bg-[#101a3f]"
        >
          {PALETTES.map((p) => {
            const selected = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setPalette(p.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-brand-ink transition hover:bg-brand-ink/5 dark:text-white dark:hover:bg-white/10"
              >
                <span className="w-4 shrink-0 text-brand-accent">
                  {selected && <Check size={15} aria-hidden />}
                </span>
                <span className="flex-1">
                  {p.label}
                  <span className="block text-[11px] font-medium text-slate-500 dark:text-white/50">
                    {p.description}
                  </span>
                </span>
                {/* The four chips: fixed hex, not tokens, so each row previews
                    ITS palette while a different one is active. */}
                <span className="flex shrink-0 gap-1" aria-hidden>
                  {p.swatches.map((hex, i) => (
                    <span
                      key={i}
                      className="h-4 w-4 rounded-[5px] ring-1 ring-inset ring-black/10 dark:ring-white/15"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
