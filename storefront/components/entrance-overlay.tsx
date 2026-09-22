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
// The very first time someone visits (no SEEN_KEY in localStorage yet),
// the full word-by-word reveal plays and then just sits there — the user
// clicks through when they're ready, it doesn't auto-hide. Every load
// after that (a refresh, or coming back later) is a quick 0.6s flash
// instead: nobody wants to sit through the full intro on every reload.
const SEEN_KEY = "70oc:seenEntrance";

const SENTENCE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tristique posuere velit, et feugiat lacus tempor non.";
const WORDS = SENTENCE.split(" ");

const WORD_STAGGER_MS = 54; // delay between each word starting its reveal
const WORD_DURATION_MS = 600; // must match .word's transition duration in the CSS below
const REFRESH_HOLD_MS = 600; // returning visitor / refresh — pause once the reveal is done, before auto-hiding
const FADE_MS = 780; // must match .overlay's transition duration in the CSS below

// How long the full word-by-word reveal takes, start to finish — the last
// word starts at (WORDS.length - 1) * stagger and takes its own duration
// to finish, so that's the point everything is fully revealed. The
// refresh auto-hide waits for this to complete before its own hold —
// it never cuts the reveal animation short.
const REVEAL_MS = (WORDS.length - 1) * WORD_STAGGER_MS + WORD_DURATION_MS;

export function EntranceOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [requireClick, setRequireClick] = useState(false);
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

    let hasSeenBefore = false;
    try {
      hasSeenBefore = window.localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // localStorage unavailable (private mode etc.) — treat as first visit
    }

    // Two rafs so the initial (opacity 0, translateY 20px) state actually
    // paints before flipping to the revealed one — otherwise the browser
    // can coalesce both into a single frame and the transition never
    // plays.
    rafRef.current = requestAnimationFrame(() => {
      rafRef2.current = requestAnimationFrame(() => setRevealed(true));
    });

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    if (hasSeenBefore) {
      hideTimer = setTimeout(
        () => setHiding(true),
        REVEAL_MS + REFRESH_HOLD_MS,
      );
      removeTimer = setTimeout(
        () => setVisible(false),
        REVEAL_MS + REFRESH_HOLD_MS + FADE_MS,
      );
    } else {
      setRequireClick(true);
    }

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

  const dismiss = () => {
    if (!requireClick || hiding) return;
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore — worst case they get the full intro again next visit
    }
    setHiding(true);
    setTimeout(() => setVisible(false), FADE_MS);
  };

  if (isStudio || !visible) return null;

  return (
    <div
      className={s.overlay}
      data-hiding={hiding}
      data-clickable={requireClick}
      role={requireClick ? "button" : undefined}
      tabIndex={requireClick ? 0 : undefined}
      aria-label={requireClick ? "Continue to site" : undefined}
      aria-hidden={requireClick ? undefined : "true"}
      onClick={requireClick ? dismiss : undefined}
      onKeyDown={
        requireClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") dismiss();
            }
          : undefined
      }
    >
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
