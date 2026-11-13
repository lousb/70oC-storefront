"use client";

// The fog itself, over the live site (loaded on demand by fog-hover-overlay.tsx).
// One WebGL layer: just before the fog forms, the visible page is snapshotted
// into a texture, which the shader blurs and refracts through the steam.
// z-index 450: above page content, below the floating logo (500), header (550)
// and cart (540+), which are left out of the snapshot and stay sharp on top.

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSaunaFog, type SaunaFog } from "./sauna-fog";
import { capturePage } from "./page-capture";
import { FogControls } from "./fog-controls";
import { BRUSH, QUALITY, SCROLL, STEAM, TIMING, defaultPreset, loadPreset, savePreset, type FogPreset } from "./fog-presets";

const STORAGE_KEY = "70oc-fog-hover-site";
const Z_INDEX = 450;
const siteDefaults = () => defaultPreset(false);

export default function FogHoverSite({ onClose }: { onClose: () => void }) {
  const [preset, setPreset] = useState<FogPreset>(siteDefaults);
  const fogRef = useRef<SaunaFog | null>(null);
  const loadedRef = useRef(false);
  const presetRef = useRef(preset);
  presetRef.current = preset;
  const pathname = usePathname();

  useEffect(() => {
    const initial = loadPreset(STORAGE_KEY, siteDefaults());
    presetRef.current = initial;
    setPreset(initial);
    loadedRef.current = true;
    fogRef.current = createSaunaFog({
      mode: "page",
      zIndex: Z_INDEX,
      config: initial.fog,
      capture: () =>
        capturePage({
          scale: Math.min(1, Math.max(0.1, presetRef.current.fog.bgResolution)),
          zAbove: Z_INDEX,
          padY: 200,
        }),
    });
    return () => {
      fogRef.current?.destroy();
      fogRef.current = null;
    };
  }, []);

  // New route = new page behind the glass
  useEffect(() => {
    fogRef.current?.invalidate();
  }, [pathname]);

  useEffect(() => {
    if (!loadedRef.current) return;
    fogRef.current?.setConfig(preset.fog);
    savePreset(STORAGE_KEY, preset);
  }, [preset]);

  return (
    <FogControls
      title="Fog hover"
      preset={preset}
      setPreset={setPreset}
      groups={[TIMING, BRUSH, SCROLL, STEAM, QUALITY]}
      defaults={siteDefaults}
      onSteam={() => fogRef.current?.steamNow()}
      onClear={() => fogRef.current?.clearNow()}
      onClose={onClose}
    />
  );
}
