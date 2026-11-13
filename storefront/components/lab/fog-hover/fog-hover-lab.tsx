"use client";

// Lab page for the sauna fog hover experiment (from the AudioVisuals repo).
// Full-screen grid of tiles, no two neighbours the same colour. Leave the mouse
// still and the glass steams up; keep moving to wipe it clear.
// Click the background or press space to reshuffle the tiles.
//
// Every setting is in the panel and can be exported/imported as JSON. Settings
// also stick between reloads in this browser (localStorage).
// For the same effect over the real site, add ?fog-hover to any page URL.

import { useCallback, useEffect, useRef, useState } from "react";
import { createSaunaFog, type SaunaFog } from "./sauna-fog";
import { FogControls } from "./fog-controls";
import {
  BRUSH,
  DEFAULT_BACKGROUND,
  MIN_PALETTE,
  QUALITY,
  STEAM,
  TIMING,
  defaultPreset,
  loadPreset,
  savePreset,
  type FogBackground,
  type FogPreset,
} from "./fog-presets";
import s from "./fog-hover-lab.module.css";

const STORAGE_KEY = "70oc-lab-fog-hover";
const labDefaults = () => defaultPreset(true);

function buildGrid(bg: FogBackground) {
  const cols = Math.max(1, Math.round(innerWidth / bg.tileSize));
  const size = innerWidth / cols;
  const rows = Math.ceil(innerHeight / size);
  const colours: string[][] = [];
  for (let r = 0; r < rows; r++) {
    colours[r] = [];
    for (let c = 0; c < cols; c++) {
      // Neighbours already placed: left, up-left, up, up-right (covers all 8 directions overall)
      const avoid = new Set([colours[r][c - 1], colours[r - 1]?.[c - 1], colours[r - 1]?.[c], colours[r - 1]?.[c + 1]]);
      const options = bg.palette.filter((col) => !avoid.has(col));
      const pool = options.length ? options : bg.palette;
      colours[r][c] = pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return { colours, size };
}

export default function FogHoverLab() {
  const [preset, setPreset] = useState<FogPreset>(labDefaults);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogRef = useRef<SaunaFog | null>(null);
  const gridRef = useRef<{ colours: string[][]; size: number }>({ colours: [], size: 80 });
  const presetRef = useRef(preset);
  presetRef.current = preset;
  const loadedRef = useRef(false);

  const background = preset.background ?? DEFAULT_BACKGROUND;

  const paint = useCallback((ctx: CanvasRenderingContext2D, scale: number) => {
    const { colours, size } = gridRef.current;
    const sz = size * scale;
    colours.forEach((row, r) =>
      row.forEach((colour, c) => {
        ctx.fillStyle = colour;
        ctx.fillRect(c * sz, r * sz, sz + 1, sz + 1);
      }),
    );
  }, []);

  const reshuffle = useCallback(() => {
    gridRef.current = buildGrid(presetRef.current.background ?? DEFAULT_BACKGROUND);
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      paint(canvas.getContext("2d")!, dpr);
    }
    fogRef.current?.refresh();
  }, [paint]);

  // Load saved settings once, then mount the fog
  useEffect(() => {
    const initial = loadPreset(STORAGE_KEY, presetRef.current);
    presetRef.current = initial;
    setPreset(initial);
    loadedRef.current = true;

    gridRef.current = buildGrid(initial.background ?? DEFAULT_BACKGROUND);
    fogRef.current = createSaunaFog({ drawBackground: paint, config: initial.fog, zIndex: 400 });
    reshuffle();

    let timer = 0;
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(reshuffle, 100);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button")) return;
      if (e.code === "Space") {
        e.preventDefault();
        reshuffle();
      }
    };
    addEventListener("resize", onResize);
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      removeEventListener("resize", onResize);
      removeEventListener("keydown", onKey);
      fogRef.current?.destroy();
      fogRef.current = null;
    };
  }, [paint, reshuffle]);

  // Push fog settings live + persist
  useEffect(() => {
    if (!loadedRef.current) return;
    fogRef.current?.setConfig(preset.fog);
    savePreset(STORAGE_KEY, preset);
  }, [preset]);

  // Rebuild the grid when the background settings change
  const bgKey = `${background.tileSize}|${background.palette.join(",")}`;
  useEffect(() => {
    if (loadedRef.current) reshuffle();
  }, [bgKey, reshuffle]);

  const setBg = (patch: Partial<FogBackground>) =>
    setPreset((p) => ({ ...p, background: { ...(p.background ?? DEFAULT_BACKGROUND), ...patch } }));

  return (
    <>
      <canvas ref={canvasRef} className={s.grid} onClick={reshuffle} aria-hidden />

      <FogControls
        title="Fog hover lab"
        preset={preset}
        setPreset={setPreset}
        groups={[TIMING, BRUSH, STEAM, QUALITY]}
        defaults={labDefaults}
        onSteam={() => fogRef.current?.steamNow()}
        onClear={() => fogRef.current?.clearNow()}
        actions={
          <button type="button" onClick={reshuffle}>
            Shuffle
          </button>
        }
      >
        <fieldset className={s.group}>
          <legend>Background</legend>
          <label className={s.row}>
            <span className={s.label}>
              Tile size (px)<em>{background.tileSize}</em>
            </span>
            <input
              type="range"
              min={20}
              max={300}
              step={1}
              value={background.tileSize}
              onChange={(e) => setBg({ tileSize: Number(e.target.value) })}
            />
          </label>
          <div className={s.palette}>
            {background.palette.map((col, i) => (
              <span key={i} className={s.swatch}>
                <input
                  type="color"
                  value={col}
                  onChange={(e) => {
                    const palette = [...background.palette];
                    palette[i] = e.target.value;
                    setBg({ palette });
                  }}
                />
                {background.palette.length > MIN_PALETTE && (
                  <button
                    type="button"
                    aria-label="Remove colour"
                    onClick={() => setBg({ palette: background.palette.filter((_, j) => j !== i) })}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            <button type="button" className={s.add} onClick={() => setBg({ palette: [...background.palette, "#ffffff"] })}>
              + Add
            </button>
          </div>
        </fieldset>
      </FogControls>
    </>
  );
}
