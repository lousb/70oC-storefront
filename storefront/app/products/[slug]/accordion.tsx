"use client";

import { useEffect, useState } from "react";
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
// independently via a leading "+" that flips to "–" when open. Reviews
// (the separate "Reviews Flyout" reference) are out of scope for now.
export function Accordion({ items }: { items: AccordionEntry[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Opening/closing an item changes .productDetails' own content height
  // (it's content-height, not a fixed box - see page.module.css), which
  // GSAP's pin (product-section.tsx) needs to know about so the pinned
  // panel gets exactly as much scroll room as its current content, on
  // either side of the toggle.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [openKey]);

  if (items.length === 0) {
    return null;
  }

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
            {isOpen && <div className={s.accordionContent}>{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
