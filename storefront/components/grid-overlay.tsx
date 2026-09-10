"use client";

import { useEffect, useState } from "react";
import s from "./grid-overlay.module.css";

// Keep this in sync with the breakpoint used in styles/globals.css and
// the component CSS files (footer.module.css, etc.) — it's the same
// 8-col mobile / 18-col desktop switch, just mirrored in JS so we know
// how many column divs to draw.
const DESKTOP_QUERY = "(min-width: 769px)";

// Dev-only aid: press Option/Alt + G anywhere on the site to toggle a
// red, 10%-opacity overlay of the live column grid, so we can check any
// component's alignment against it as we build. Not gated to
// development mode on purpose — useful on preview/staging too while
// we're still building component-by-component.
export default function GridOverlay() {
  const [visible, setVisible] = useState(false);
  const [columns, setColumns] = useState(8);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const updateColumns = () => setColumns(mediaQuery.matches ? 18 : 8);
    updateColumns();
    mediaQuery.addEventListener("change", updateColumns);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyG") {
        event.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      mediaQuery.removeEventListener("change", updateColumns);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={s.overlay} aria-hidden="true">
      <div className={s.grid}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={s.column} />
        ))}
      </div>
    </div>
  );
}
