"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./entrance-overlay.module.css";

// Basic full-screen intro — mounted once in the root layout, so (per how
// the App Router works) its mount effect only fires on a real browser
// navigation: the first visit or a refresh. Clicking an internal <Link>
// never remounts the root layout, so this deliberately does NOT replay
// on ordinary in-app navigation, only on the two cases asked for.
//
// No click needed — every load (first visit or a refresh) plays the
// word-by-word reveal and then auto-hides HOLD_MS after mount, always.
const SENTENCE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tristique posuere velit, et feugiat lacus tempor non.";
const WORDS = SENTENCE.split(" ");

const WORD_STAGGER_MS = 54; // delay between each word starting its reveal
const HOLD_MS = 800; // auto-hide this long after mount — first load or refresh, always
const FADE_MS = 780; // must match .overlay's transition duration in the CSS below

export function EntranceOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [hiding, setHiding] = useState(false);
  const rafRef = useRef(0);
  const rafRef2 = useRef(0);

  const isStudio = pathname.startsWith("/studio");

  useEffect(() => {
    if (isStudio) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      setVisible(false);
      return;
    }

    // Two rafs so the initial (opacity 0, translateY 20px) state actually
    // paints before flipping to the revealed one — otherwise the browser
    // can coalesce both into a single frame and the transition never
    // plays.
    rafRef.current = requestAnimationFrame(() => {
      rafRef2.current = requestAnimationFrame(() => setRevealed(true));
    });

    const hideTimer = setTimeout(() => setHiding(true), HOLD_MS);
    const removeTimer = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(rafRef2.current);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
    // Intentionally empty deps — this should only ever run once, on
    // first mount of the root layout (see comment above), never again
    // for the lifetime of this client-side session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isStudio || !visible) return null;

  return (
    <div className={s.overlay} data-hiding={hiding} aria-hidden="true">
      <p className={s.text} data-revealed={revealed}>
        {WORDS.map((word, i) => (
          <Fragment key={i}>
            <span
              className={s.word}
              style={{ transitionDelay: `${i * WORD_STAGGER_MS}ms` }}
            >
              {word}
            </span>
            {i < WORDS.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </p>
    </div>
  );
}
