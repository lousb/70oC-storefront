"use client";

// Controls panel shared by the lab page and the ?fog-hover site overlay:
// sliders, steam/clear, preset name, JSON export/import/copy/paste, reset.
// "Hide" collapses it to a small tab; Option/Alt + F hides it completely.

import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { FogConfig } from "./sauna-fog";
import { parsePreset, type FogPreset, type SliderGroup } from "./fog-presets";
import s from "./fog-hover-lab.module.css";

type Props = {
  title: string;
  preset: FogPreset;
  setPreset: Dispatch<SetStateAction<FogPreset>>;
  groups: SliderGroup[];
  defaults: () => FogPreset;
  onSteam: () => void;
  onClear: () => void;
  /** Extra buttons next to Steam now / Clear */
  actions?: ReactNode;
  /** Extra sections after the sliders */
  children?: ReactNode;
  /** Optional close button (e.g. turn the overlay off) */
  onClose?: () => void;
  startOpen?: boolean;
};

const fmt = (v: number, step: number) =>
  step >= 1 ? String(Math.round(v)) : v.toFixed(Math.min(3, String(step).split(".")[1]?.length ?? 2));

export function FogControls({ title, preset, setPreset, groups, defaults, onSteam, onClear, actions, children, onClose, startOpen = true }: Props) {
  const [open, setOpen] = useState(startOpen);
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Option/Alt + F: hide/show the whole panel (Option + G is the grid overlay)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyF") {
        e.preventDefault();
        setHidden((h) => !h);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus((cur) => (cur === msg ? "" : cur)), 2500);
  };

  const setFog = <K extends keyof FogConfig>(key: K, value: FogConfig[K]) =>
    setPreset((p) => ({ ...p, fog: { ...p.fog, [key]: value } }));

  const json = () => JSON.stringify(preset, null, 2);

  const exportFile = () => {
    const blob = new Blob([json()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "fog-hover";
    a.href = url;
    a.download = `${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Exported");
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json());
      flash("Copied JSON");
    } catch {
      flash("Couldn't copy");
    }
  };

  const importText = (text: string) => {
    try {
      setPreset((p) => parsePreset(JSON.parse(text), p));
      flash("Imported");
    } catch (err) {
      flash(`Import failed: ${(err as Error).message}`);
    }
  };

  const pasteJson = async () => {
    try {
      importText(await navigator.clipboard.readText());
    } catch {
      flash("Couldn't read clipboard");
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) importText(await file.text());
  };

  if (hidden) return null;

  return (
    <aside className={s.panel} data-open={open} data-lenis-prevent data-fog-ignore>
      <div className={s.bar}>
        <span>{title}</span>
        <span className={s.barButtons}>
          <button type="button" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "Controls"}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Turn fog off">
              Off
            </button>
          )}
        </span>
      </div>

      {open && (
        <div className={s.body}>
          <div className={s.actions}>
            <button type="button" onClick={onSteam}>Steam now</button>
            <button type="button" onClick={onClear}>Clear</button>
            {actions}
          </div>

          <label className={s.text}>
            <span>Preset name</span>
            <input value={preset.name} onChange={(e) => setPreset((p) => ({ ...p, name: e.target.value }))} />
          </label>

          <div className={s.actions}>
            <button type="button" onClick={exportFile}>Export JSON</button>
            <button type="button" onClick={() => fileRef.current?.click()}>Import JSON</button>
            <button type="button" onClick={copyJson}>Copy</button>
            <button type="button" onClick={pasteJson}>Paste</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
          </div>

          {groups.map((group) => (
            <fieldset key={group.title} className={s.group}>
              <legend>{group.title}</legend>
              {group.toggles?.map(({ key, label }) => (
                <label key={key} className={s.checkRow}>
                  <input
                    type="checkbox"
                    checked={!!preset.fog[key]}
                    onChange={(e) => setFog(key, e.target.checked as never)}
                  />
                  <span>{label}</span>
                </label>
              ))}
              {group.sliders.map(({ key, label, min, max, step }) => {
                const value = preset.fog[key] as number;
                return (
                  <label key={key} className={s.row}>
                    <span className={s.label}>
                      {label}
                      <em>{fmt(value, step)}</em>
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={value}
                      onChange={(e) => setFog(key, Number(e.target.value) as never)}
                    />
                  </label>
                );
              })}
              {group.title === "Steam" && (
                <label className={s.colorRow}>
                  <span>Steam colour</span>
                  <input type="color" value={preset.fog.steamColor} onChange={(e) => setFog("steamColor", e.target.value)} />
                </label>
              )}
            </fieldset>
          ))}

          {children}

          <div className={s.actions}>
            <button
              type="button"
              onClick={() => {
                setPreset(defaults());
                flash("Reset to defaults");
              }}
            >
              Reset to defaults
            </button>
          </div>
          <p className={s.hint}>Option/Alt + F hides this panel</p>
        </div>
      )}
      {status && <p className={s.status}>{status}</p>}
    </aside>
  );
}
