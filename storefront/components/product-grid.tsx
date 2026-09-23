"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ListedProduct } from "./product-card";
import s from "./product-grid.module.css";

const ANCHORS = [
  "Pressure",
  "Flow",
  "Momentum",
  "Repetition",
  "Balance",
  "Bloom",
];

const VIEW_OPTIONS = [1, 2, 3] as const;
type View = (typeof VIEW_OPTIONS)[number];

// View 1/2/3 = 2/4/5 columns, matching Shop 1A (View 1/2/3) references.
const COLUMNS_BY_VIEW: Record<View, number> = { 1: 2, 2: 4, 3: 5 };

const MOBILE_BREAKPOINT = 768; // matches the @media (max-width: 768px) below

const ROW_STAGGER_MS = 60; // delay between each row's reveal starting

export function ProductGrid({ products }: { products: ListedProduct[] }) {
  const [view, setView] = useState<View>(1);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [anchorOpen, setAnchorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const filtered = anchor
    ? products.filter((p) => p.category === anchor)
    : products;

  // Mobile is always a single column (see the max-width: 768px override in
  // product-grid.module.css), regardless of which view is selected - so the
  // reveal's row grouping needs to match that, not the desktop column count,
  // or items would reveal in visually-wrong groups on mobile.
  const itemsPerRow = isMobile ? 1 : COLUMNS_BY_VIEW[view];

  return (
    <div className={s.page}>
      <div className={s.bar}>
        <div className={s.barGroup}>
          <button
            type="button"
            className={s.barTrigger}
            onClick={() => setAnchorOpen((v) => !v)}
            aria-expanded={anchorOpen}
          >
            <span className={s.underlined}>{anchor ?? "All Anchors"}</span> +
          </button>
          {anchorOpen && (
            <div className={s.dropdown}>
              <button
                type="button"
                className={s.dropdownItem}
                data-active={anchor === null}
                onClick={() => {
                  setAnchor(null);
                  setAnchorOpen(false);
                }}
              >
                All Anchors
              </button>
              {ANCHORS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={s.dropdownItem}
                  data-active={anchor === a}
                  onClick={() => {
                    setAnchor(a);
                    setAnchorOpen(false);
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={s.viewGroup} aria-label="Grid density">
          <span aria-hidden="true" className={s.underlined}>
            View
          </span>
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              type="button"
              className={s.viewButton}
              data-active={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${s.barTrigger} ${s.plusTrigger}`}
          onClick={() => setAnchor(null)}
        >
          <span className={s.underlined}>All Products</span>
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className={s.empty}>No products in this anchor yet.</p>
      ) : (
        // key={view} remounts the whole grid on a view switch, which is what
        // replays each item's reveal animation below (CSS animations only
        // play on mount) - it's also what makes the very first render (page
        // load) play the same reveal for free, with no extra state needed.
        <div
          key={view}
          className={s.grid}
          style={{ gridTemplateColumns: `repeat(${COLUMNS_BY_VIEW[view]}, minmax(0, 1fr))` }}
        >
          {filtered.map((product, i) => {
            const row = Math.floor(i / itemsPerRow);
            return (
              <div
                key={product.id}
                className={s.item}
                style={{ animationDelay: `${row * ROW_STAGGER_MS}ms` }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
