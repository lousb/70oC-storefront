"use client";

import { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

export type AccordionEntry = {
  key: string;
  title: string;
  content: React.ReactNode;
};

// Matches Set-Up-Components/ProductPage's collapsed-by-default rows (Details
// / Ingredients / How To Use / Shipping / Where We Live), each toggled
// via a leading "+" that flips to "–" when open.
//
// Every panel stays mounted and animates its height (grid-template-rows
// 0fr -> 1fr, see .accordionPanel in page.module.css) so rows open
// downward. product-section.tsx centres the details panel on its
// *collapsed* height (it subtracts .accordionPanel heights), so opening
// a row never re-centres / shifts the panel up.
export function Accordion({ items }: { items: AccordionEntry[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  // Opening/closing changes .productDetails' content height, which GSAP's
  // pin (product-section.tsx) needs to know about - refresh once the
  // height animation has finished, so it measures the settled size.
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "grid-template-rows") return;
    ScrollTrigger.refresh();
  };

  return (
    <div className={s.accordion}>
      {items.map((item) => {
        const isOpen = openKey === item.key;
        return (
          <div key={item.key} className={s.accordionItem}>
            <button
              type="button"
              className={s.accordionTrigger}
              onClick={() => setOpenKey(isOpen ? null : item.key)}
              aria-expanded={isOpen}
            >
              <span>{item.title}</span>
              <span aria-hidden="true">{isOpen ? "–" : "+"}</span>
            </button>
            <div
              className={s.accordionPanel}
              data-open={isOpen}
              aria-hidden={!isOpen}
              inert={!isOpen || undefined}
              onTransitionEnd={handleTransitionEnd}
            >
              <div className={s.accordionPanelInner}>
                <div className={s.accordionContent}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
