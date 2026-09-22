"use client";

import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

// Ambient rotation tied to page scroll (same gsap + ScrollTrigger pattern
// as components/image-block.tsx) — scrubbing the whole document's scroll
// range into a fixed number of full turns. Kept small/subtle on purpose —
// this is a background detail, not the focal point of the page.
//
// Positioning IS handled here now (position: fixed, viewport-relative —
// see .floatingIconBox), but the pin-synced show/hide isn't: this is
// rendered as a sibling of .productDetails, not a child of it (see
// product-section.tsx) — a position:fixed ancestor (which .productDetails
// becomes for the pin's duration) always opens its own stacking context,
// which would trap this box's mix-blend-mode: difference so it could only
// ever blend against .productDetails' own contents instead of the actual
// gallery photo next to it. product-section.tsx forwards a ref here (this
// wraps the outer box in forwardRef for that) and toggles a class on it
// from the same ScrollTrigger that pins the panel, so it still only shows
// centered on screen for exactly the same window .productDetails is
// pinned for.
const TURNS_PER_PAGE = 0.35;

export const FloatingCategoryIcon = forwardRef<HTMLDivElement, { slug: string }>(
  function FloatingCategoryIcon({ slug }, ref) {
    const iconRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const el = iconRef.current;
      if (!el) return;

      const tween = gsap.to(el, {
        rotation: TURNS_PER_PAGE * 360,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          // A little lag (instead of scrub: true / 1-to-1) so the rotation
          // eases behind the scroll rather than snapping to it — reads
          // slower and softer.
          scrub: 1.5,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, []);

    return (
      <div ref={ref} className={s.floatingIconBox} aria-hidden="true">
        <img
          ref={iconRef}
          src={`/icons/02Icons/${slug}.png`}
          alt=""
          className={s.floatingIcon}
        />
      </div>
    );
  },
);
