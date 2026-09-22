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

      const pinConfig = {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
      } as const;

      const stDetails = ScrollTrigger.create({
        ...pinConfig,
        pin: detailsRef.current,
      });

      // Same trigger/start/end as stDetails above - a second, independent
      // pin (not a shared one) because this is a different element, but
      // matching numbers mean it activates and releases at exactly the
      // same scroll positions, so the icon pins and docks right alongside
      // the panel instead of drifting out of sync with it.
      const stIcon = iconBoxRef.current
        ? ScrollTrigger.create({
            ...pinConfig,
            pin: iconBoxRef.current,
          })
        : null;

      return () => {
        stDetails.kill();
        stIcon?.kill();
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
