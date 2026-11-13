// Shared preset shape, slider definitions and JSON parsing for the fog hover
// lab page (/lab/fog-hover) and the site overlay (?fog-hover).
// A preset exported from either can be imported into the other: the overlay
// just ignores the lab's background settings.
import { DEFAULT_FOG_CONFIG, type FogConfig } from "./sauna-fog";

export type FogBackground = { tileSize: number; palette: string[] };
export type FogPreset = {
  name: string;
  version: 1;
  fog: FogConfig;
  /** Only used by the lab page (tile grid behind the glass). */
  background?: FogBackground;
};

export const MIN_PALETTE = 5; // a tile must always be able to avoid its 4 already-placed neighbours

export const DEFAULT_BACKGROUND: FogBackground = {
  tileSize: 80,
  // shades of blue, navy to pale sky
  palette: ["#0b1d3a", "#123c69", "#1a5fa8", "#2176d2", "#3a8fe0", "#5fa8eb", "#8cc3f2", "#b9dbf7", "#0e4c7a", "#2c6e9e"],
};

export type Slider = { key: keyof FogConfig; label: string; min: number; max: number; step: number };
export type Toggle = { key: keyof FogConfig; label: string };
export type SliderGroup = { title: string; sliders: Slider[]; toggles?: Toggle[] };

export const TIMING: SliderGroup = {
  title: "Timing",
  sliders: [
    { key: "idleMs", label: "Idle before fog (ms)", min: 0, max: 20000, step: 100 },
    { key: "fogInSeconds", label: "Steam up time (s)", min: 0.2, max: 15, step: 0.1 },
    { key: "wipeMs", label: "Wipe to clear (ms)", min: 100, max: 8000, step: 50 },
    { key: "movingGraceMs", label: "Moving grace (ms)", min: 20, max: 1000, step: 10 },
    { key: "clearSeconds", label: "Clear fade (s)", min: 0.05, max: 5, step: 0.05 },
  ],
};
export const BRUSH: SliderGroup = {
  title: "Brush",
  sliders: [
    { key: "brushSize", label: "Brush size", min: 0.02, max: 0.4, step: 0.005 },
    { key: "brushGrowth", label: "Brush growth", min: 1, max: 8, step: 0.1 },
    { key: "brushFollow", label: "Brush follow", min: 0.02, max: 1, step: 0.01 },
    { key: "brushEaseMs", label: "Brush ease in (ms)", min: 0, max: 2000, step: 10 },
    { key: "refogPerSecond", label: "Re-fog speed", min: 0, max: 3, step: 0.01 },
  ],
};
export const STEAM: SliderGroup = {
  title: "Steam",
  toggles: [{ key: "whiteBackground", label: "White background" }],
  sliders: [
    { key: "blurPx", label: "Blur (px)", min: 0, max: 120, step: 1 },
    { key: "refraction", label: "Refraction", min: 0, max: 2, step: 0.01 },
    { key: "baseHaze", label: "Base haze", min: 0, max: 1, step: 0.01 },
    { key: "wispStrength", label: "Wisps", min: 0, max: 1, step: 0.01 },
    { key: "curlStrength", label: "Curls", min: 0, max: 1, step: 0.01 },
    { key: "steamScale", label: "Steam scale", min: 0.1, max: 4, step: 0.05 },
    { key: "steamSpeed", label: "Steam speed", min: 0, max: 1, step: 0.005 },
    { key: "breathe", label: "Breathe", min: 0, max: 1, step: 0.01 },
    { key: "maxSteam", label: "Max density", min: 0, max: 1, step: 0.01 },
  ],
};
/** Site overlay only: scrolling wipes the fog away. */
export const SCROLL: SliderGroup = {
  title: "Scroll",
  sliders: [
    { key: "scrollClearPx", label: "Scroll to clear (px, 0 = off)", min: 0, max: 1000, step: 10 },
    { key: "scrollFadeSeconds", label: "Scroll fade (s)", min: 0.05, max: 2, step: 0.05 },
  ],
};
export const QUALITY: SliderGroup = {
  title: "Quality",
  sliders: [
    { key: "renderScale", label: "Render resolution", min: 0.25, max: 2, step: 0.05 },
    { key: "simScale", label: "Sim resolution", min: 0.1, max: 0.6, step: 0.05 },
    { key: "bgResolution", label: "Background resolution", min: 0.1, max: 1, step: 0.05 },
  ],
};

export const isHex = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);

export const defaultPreset = (withBackground: boolean): FogPreset => ({
  name: "70oC fog hover",
  version: 1,
  fog: { ...DEFAULT_FOG_CONFIG },
  ...(withBackground ? { background: { ...DEFAULT_BACKGROUND, palette: [...DEFAULT_BACKGROUND.palette] } } : {}),
});

/**
 * Accepts a full preset, or just a bare fog config object. Unknown keys are
 * ignored and wrong types fall back to the current value. Background settings
 * are only kept if `current` has them (i.e. on the lab page).
 */
export function parsePreset(raw: unknown, current: FogPreset): FogPreset {
  if (!raw || typeof raw !== "object") throw new Error("Not a JSON object");
  const obj = raw as Record<string, unknown>;
  const fogIn = (obj.fog && typeof obj.fog === "object" ? obj.fog : obj) as Record<string, unknown>;
  const fog = { ...current.fog };
  for (const key of Object.keys(DEFAULT_FOG_CONFIG) as (keyof FogConfig)[]) {
    const v = fogIn[key];
    if (key === "steamColor") {
      if (isHex(v)) fog.steamColor = v;
    } else if (typeof DEFAULT_FOG_CONFIG[key] === "boolean") {
      if (typeof v === "boolean") (fog[key] as boolean) = v;
    } else if (typeof v === "number" && Number.isFinite(v)) {
      (fog[key] as number) = v;
    }
  }
  const next: FogPreset = { name: typeof obj.name === "string" ? obj.name : current.name, version: 1, fog };
  if (current.background) {
    const bgIn = (obj.background ?? {}) as Record<string, unknown>;
    const palette = Array.isArray(bgIn.palette) ? bgIn.palette.filter(isHex) : current.background.palette;
    next.background = {
      tileSize: typeof bgIn.tileSize === "number" && bgIn.tileSize > 0 ? bgIn.tileSize : current.background.tileSize,
      palette: palette.length >= MIN_PALETTE ? palette : current.background.palette,
    };
  }
  return next;
}

export function loadPreset(key: string, fallback: FogPreset): FogPreset {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return parsePreset(JSON.parse(saved), fallback);
  } catch {
    /* ignore bad / unavailable storage */
  }
  return fallback;
}

export function savePreset(key: string, preset: FogPreset) {
  try {
    localStorage.setItem(key, JSON.stringify(preset));
  } catch {
    /* ignore */
  }
}
