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
// Every load (first visit or a refresh) plays the word-by-word reveal,
// then an underlined "Enter Site" button fades in after the last word.
// The overlay stays up until the visitor clicks it (no timeout), then
// fades out.
const SENTENCE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tristique posuere velit, et feugiat lacus tempor non.";
const WORDS = SENTENCE.split(" ");

const WORD_STAGGER_MS = 54; // delay between each word starting its reveal
const WORD_REVEAL_MS = 600; // must match .word's transition duration in the CSS
const BUTTON_DELAY_MS = 200; // pause after the last word lands, before the button appears
const FADE_MS = 780; // must match .overlay's transition duration in the CSS below
// On exit the text fades first, at half the background's duration, then
// the background fades. Must match .content's transition and .overlay's
// transition-delay in the CSS.
const TEXT_FADE_MS = FADE_MS / 2;
// Time from the reveal starting until the last word has fully landed.
const REVEAL_TOTAL_MS = (WORDS.length - 1) * WORD_STAGGER_MS + WORD_REVEAL_MS;

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
      rafRef2.current = requestAnimationFrame(() => {
        setRevealed(true);
      });
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(rafRef2.current);
    };
    // Intentionally empty deps — this should only ever run once, on
    // first mount of the root layout (see comment above), never again
    // for the lifetime of this client-side session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade out, then unmount once the fade has finished.
  useEffect(() => {
    if (!hiding) return;
    const removeTimer = setTimeout(
      () => setVisible(false),
      TEXT_FADE_MS + FADE_MS,
    );
    return () => clearTimeout(removeTimer);
  }, [hiding]);

  if (isStudio || !visible) return null;

  return (
    <div className={s.overlay} data-hiding={hiding}>
      {/* Only the sentence is centered; the button hangs below it
          (absolutely positioned) so it doesn't shift the sentence up. */}
      <div className={s.content} data-hiding={hiding}>
      <p className={s.text} data-revealed={revealed} aria-hidden="true">
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
      <button
        type="button"
        className={s.enter}
        data-revealed={revealed}
        style={{ transitionDelay: `${REVEAL_TOTAL_MS + BUTTON_DELAY_MS}ms` }}
        onClick={() => setHiding(true)}
        disabled={hiding}
      >
        Enter Site
      </button>
      </div>
    </div>
  );
}
