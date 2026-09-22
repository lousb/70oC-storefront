"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

// Ambient rotation tied to page scroll (same gsap + ScrollTrigger pattern
// as components/image-block.tsx) — scrubbing the whole document's scroll
// range into a fixed number of full turns. Kept small/subtle on purpose —
// this is a background detail, not the focal point of the page.
//
// Positioning/pinning is NOT handled here: this renders as a plain
// position:absolute child of .productDetails (see page.module.css's
// .floatingIconBox and product-section.tsx), so it automatically follows
// that panel through GSAP's pin/release fixed-vs-static toggling with no
// extra ScrollTrigger of its own.
const TURNS_PER_PAGE = 0.35;

export function FloatingCategoryIcon({ slug }: { slug: string }) {
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
    <div className={s.floatingIconBox} aria-hidden="true">
      <img
        ref={iconRef}
        src={`/icons/02Icons/${slug}.png`}
        alt=""
        className={s.floatingIcon}
      />
    </div>
  );
}
