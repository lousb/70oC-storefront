"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./page.module.css";
import { FloatingCategoryIcon } from "./floating-category-icon";

gsap.registerPlugin(ScrollTrigger);

// Wraps the product page's gallery + details columns and pins the details
// panel (same gsap + ScrollTrigger pattern as components/image-block.tsx)
// for exactly the scroll distance of this section — i.e. while the gallery
// column (the taller sibling) scrolls past. GSAP switches it to
// position:fixed only for that range and hands it back to normal flow at
// the end, so it settles at the bottom of this section instead of staying
// fixed for the rest of the page (which used to run it straight into the
// footer). Desktop only — mobile stacks the panel below the gallery in
// normal flow instead (see the mobile media query in page.module.css).
//
// The floating category icon is a SIBLING of .productDetails, not a child
// of it (unlike before) — position: fixed always opens its own stacking
// context (regardless of z-index), so while .productDetails is pinned,
// anything nested inside it has its mix-blend-mode trapped against only
// that panel's own contents and can never actually blend against the
// gallery photo next to it. It still needs to pin and dock exactly like
// .productDetails does, though - not just sit centered whenever it feels
// like it - so it gets its own GSAP pin below, using the identical
// trigger/start/end as .productDetails' pin, so both switch to fixed and
// release back to static in perfect lockstep, while still being separate
// elements (so the blend mode can actually reach the gallery photo).
export function ProductSection({
  gallery,
  details,
  categoryIconSlug,
}: {
  gallery: ReactNode;
  details: ReactNode;
  categoryIconSlug?: string | null;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const iconBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      if (!sectionRef.current || !detailsRef.current) return;

      const section = sectionRef.current;
      const details = detailsRef.current;

      // How far the panel's content runs past the bottom of the viewport
      // (0 when it fits). Measured from .panelContent rather than the
      // pinned element itself: GSAP locks the pinned element's height
      // inline, and .reviewsOverlay (absolute, 100vh) would inflate its
      // scrollHeight. BOTTOM_GAP keeps the last accordion row off the very
      // bottom edge when the panel is taller than the screen.
      const BOTTOM_GAP = 20;
      // Must match .panelContent's desktop base padding-top in
      // page.module.css (clearance for the site header text).
      const HEADER_CLEARANCE = 100;

      // When the panel fits on screen, push its visible content down so
      // it's vertically centred in the viewport (never higher than the
      // normal header clearance). Applied as extra .panelContent
      // padding-top via --panel-center-offset, so the panel's own box,
      // background and pin all behave exactly as before.
      const getCenterOffset = () => {
        const content = details.querySelector<HTMLElement>(
          `.${s.panelContent}`,
        );
        if (!content) return 0;
        const style = getComputedStyle(content);
        const visibleHeight =
          content.getBoundingClientRect().height -
          parseFloat(style.paddingTop) -
          parseFloat(style.paddingBottom);
        return Math.max(
          0,
          Math.floor((window.innerHeight - visibleHeight) / 2 - HEADER_CLEARANCE),
        );
      };

      const getOverflow = () => {
        const content = details.querySelector(`.${s.panelContent}`);
        if (!content) return 0;
        const needed =
          content.getBoundingClientRect().bottom -
          details.getBoundingClientRect().top;
        return Math.max(
          0,
          Math.ceil(needed + BOTTOM_GAP - window.innerHeight),
        );
      };

      // Responsive to the panel's height (short screens, accordion open):
      // if the panel fits, it pins at the top exactly as before. If it's
      // taller than the viewport, it scrolls normally until its bottom
      // is on screen, then pins there (GSAP freezes it at top: -overflow),
      // so nothing is ever cut off. End is unchanged, so it still docks
      // at the same point as the floating icon. Recomputed on every
      // ScrollTrigger.refresh() - the accordion already calls that on
      // open/close, and resizes trigger it too.
      const stDetails = ScrollTrigger.create({
        trigger: section,
        start: () => {
          // Centre first (changes the panel's height), then measure
          // overflow against the result. A panel that needs centring
          // always fits, so overflow is 0 in that case.
          section.style.setProperty(
            "--panel-center-offset",
            `${getCenterOffset()}px`,
          );
          const overflow = getOverflow();
          // Lets .reviewsOverlay (absolute inside the panel) offset
          // itself back to the viewport top while the panel is pinned
          // above it. Set on the section, not the pinned element, since
          // GSAP rewrites the pinned element's inline styles.
          section.style.setProperty("--panel-overflow", `${overflow}px`);
          return `top+=${overflow} top`;
        },
        end: "bottom bottom",
        pin: details,
        invalidateOnRefresh: true,
      });

      // The floating category icon is NOT GSAP-pinned: it pins/docks with
      // CSS position: sticky inside .floatingIconTrack (see page.module.css),
      // docking at the same scroll position this pin releases at.

      return () => {
        section.style.removeProperty("--panel-center-offset");
        section.style.removeProperty("--panel-overflow");
        stDetails.kill();
      };
    });

    return () => mm.revert();
  }, []);

  // .productDetails is content-height now (not a fixed 100vh box), so this
  // section's pin distance depends on measuring it (and the gallery images
  // next to it) correctly. GSAP measures at effect-run time, which can be
  // before web fonts/images have finished loading and settled their final
  // layout size - refresh once everything's actually loaded so the pin
  // spacer matches the real content height instead of an early, undersized
  // guess (which otherwise let the panel's tail end - the accordion - run
  // past the spacer and under the footer that follows it).
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const raf = requestAnimationFrame(refresh);
    return () => {
      window.removeEventListener("load", refresh);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={s.page} ref={sectionRef}>
      {/* Gallery first in the DOM so mobile (where .page is display:block,
         not flex — order only applies inside flex/grid) stacks the image
         carousel above the text panel, matching the reference. Desktop
         restores the original left-text/right-image arrangement purely
         via CSS order (see .productDetails/.galleryColumn), so the GSAP
         pin (which targets detailsRef directly, unaffected by DOM order)
         and the flex row layout both still work exactly as before. */}
      <div className={s.galleryColumn}>{gallery}</div>
      <div ref={detailsRef} className={s.productDetails}>
        {details}
      </div>
      {categoryIconSlug && (
        <FloatingCategoryIcon ref={iconBoxRef} slug={categoryIconSlug} />
      )}
    </div>
  );
}
