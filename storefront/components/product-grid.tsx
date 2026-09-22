"use client";

import { useState } from "react";
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

// View 1/2/3 = 2/4/6 columns, matching Shop 1A (View 1/2/3) references.
const COLUMNS_BY_VIEW: Record<View, number> = { 1: 2, 2: 4, 3: 6 };

export function ProductGrid({ products }: { products: ListedProduct[] }) {
  const [view, setView] = useState<View>(1);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [anchorOpen, setAnchorOpen] = useState(false);

  const filtered = anchor
    ? products.filter((p) => p.category === anchor)
    : products;

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
            {anchor ?? "All Anchors"} +
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
          <span aria-hidden="true">View</span>
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
          <span>All Products</span>
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className={s.empty}>No products in this anchor yet.</p>
      ) : (
        <div
          className={s.grid}
          style={{ gridTemplateColumns: `repeat(${COLUMNS_BY_VIEW[view]}, 1fr)` }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
