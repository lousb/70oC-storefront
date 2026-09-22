"use client";

import { useEffect } from "react";
import { getLenis } from "./lenis-store";
import { LENIS_READY_EVENT } from "./lenis-provider";
import { getSnapSections, getSnapSectionTops } from "../lib/home-sections";

// Subtle depth cue for the pinned/stacked home sections (desktop only —
// see the @media (min-width: 769px) guard around the actual transform in
// anchor-carousel-section.module.css; on mobile sections aren't pinned at
// all, so there's nothing to parallax against). As the next section
// arrives and starts covering the current one, the current one's own
// content drifts upward a little instead of sitting perfectly still
// while it disappears underneath.
//
// This just writes a --parallax custom property (0 → 1, how far
// scrolled through a section's own pinned span) onto each
// data-snap-section element every scroll frame; each section's CSS
// decides whether and how to use it. Runs continuously (unlike
// home-scroll-snap's debounced settle), since it's a direct visual
// readout of scroll position, not a one-time decision.
export function HomeParallax() {
  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | undefined;

    function attach() {
      const lenis = getLenis();
      if (!lenis || cancelled) return;

      const update = () => {
        const sections = getSnapSections();
        if (sections.length === 0) return;

        const tops = getSnapSectionTops(sections);
        const scrollY = lenis.scroll;

        sections.forEach((el, i) => {
          const height = el.offsetHeight;
          const progress =
            height > 0
              ? Math.min(1, Math.max(0, (scrollY - tops[i]) / height))
              : 0;
          el.style.setProperty("--parallax", String(progress));
        });
      };

      update();
      detach = lenis.on("scroll", update);
    }

    if (getLenis()) {
      attach();
    } else {
      window.addEventListener(LENIS_READY_EVENT, attach, { once: true });
      detach = () => window.removeEventListener(LENIS_READY_EVENT, attach);
    }

    return () => {
      cancelled = true;
      detach?.();
    };
  }, []);

  return null;
}
