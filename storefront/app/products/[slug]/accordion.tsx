"use client";

import { useState } from "react";
import s from "./page.module.css";

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
