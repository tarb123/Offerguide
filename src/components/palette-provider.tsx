"use client";

/**
 * PaletteProvider — the site's colour palette, beside ThemeProvider's
 * light/dark. The two are independent axes: any palette works in either mode.
 *
 * Applies `data-palette` on <html> (the tokens in globals.css key off it) and
 * persists the choice in localStorage under PALETTE_STORAGE_KEY. layout.tsx's
 * inline script applies the same attribute before first paint, from the same
 * key, so there is no flash of the default palette on reload.
 *
 * Built on useSyncExternalStore rather than a useState+useEffect pair: the
 * store is localStorage, an external system, and this hook reads it without
 * the set-state-in-effect shape. During hydration the server snapshot (the
 * default) is used, then React re-renders with the stored value — no mismatch
 * warning, and the attribute is already correct from the inline script.
 */

import * as React from "react";
import {
  DEFAULT_PALETTE,
  PALETTE_STORAGE_KEY,
  normalizePalette,
  type PaletteId,
} from "@/lib/portal/palettes";

const listeners = new Set<() => void>();

function readStored(): PaletteId {
  try {
    return normalizePalette(localStorage.getItem(PALETTE_STORAGE_KEY));
  } catch {
    return DEFAULT_PALETTE; // private mode / storage blocked
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab changing the palette updates this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === PALETTE_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function applyPaletteAttribute(id: PaletteId) {
  document.documentElement.dataset.palette = id;
}

type PaletteState = {
  palette: PaletteId;
  setPalette: (next: PaletteId) => void;
};

const PaletteContext = React.createContext<PaletteState | undefined>(undefined);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const palette = React.useSyncExternalStore(subscribe, readStored, () => DEFAULT_PALETTE);

  // Keep <html> in step with the store — covers the cross-tab case, where the
  // storage event updates the value but nothing else has touched the DOM.
  React.useEffect(() => {
    applyPaletteAttribute(palette);
  }, [palette]);

  const setPalette = React.useCallback((next: PaletteId) => {
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      /* persistence is best-effort; the attribute still applies for this visit */
    }
    applyPaletteAttribute(next);
    listeners.forEach((l) => l());
  }, []);

  const value = React.useMemo<PaletteState>(() => ({ palette, setPalette }), [palette, setPalette]);

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteState {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within <PaletteProvider>");
  return ctx;
}
