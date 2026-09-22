"use client";

import { useState, type ReactNode } from "react";
import Price from "../../../components/price";
import { Accordion, type AccordionEntry } from "./accordion";
import { ReviewsPanel } from "./reviews-panel";
import { DEMO_RATING, DEMO_REVIEW_COUNT, formatRating } from "./reviews-data";
import s from "./page.module.css";

// Fixed order — mirrors studio/src/schema-types/constants.ts HOME_CATEGORIES
// (the two workspaces don't share code). Used to pick the 3 small icons
// below Add To Cart: the product's own category first, then the next two
// in this cycle. There's no CMS field backing which 3 icons show here (not
// part of the pseudo-schema this project is built from) — this is a
// reasonable stand-in (and doubles as a soft cross-link) until that's
// decided for real.
const CATEGORY_ORDER = [
  "pressure",
  "flow",
  "momentum",
  "repetition",
  "balance",
  "bloom",
];

export function ProductDetailsPanel({
  category,
  title,
  priceAmount,
  priceCurrencyCode,
  descriptionNode,
  accordionItems,
  categoryIconSlug,
  addToCart,
}: {
  category: string | null;
  title: string;
  priceAmount: string;
  priceCurrencyCode: string;
  descriptionNode: ReactNode;
  accordionItems: AccordionEntry[];
  categoryIconSlug?: string | null;
  addToCart: ReactNode;
}) {
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const iconSlugs = (() => {
    const startIndex = categoryIconSlug
      ? CATEGORY_ORDER.indexOf(categoryIconSlug)
      : -1;
    if (startIndex === -1) return CATEGORY_ORDER.slice(0, 3);
    return [0, 1, 2].map(
      (offset) => CATEGORY_ORDER[(startIndex + offset) % CATEGORY_ORDER.length],
    );
  })();

  // Desktop: the rating link covers the whole panel with the reviews
  // table (see .reviewsOverlay below). Mobile: the panel never overlays —
  // it just scrolls down to the always-present static reviews section at
  // the bottom of the page (#reviews).
  const handleRatingClick = () => {
    const isDesktop = window.matchMedia("(min-width: 769px)").matches;
    if (isDesktop) {
      setReviewsOpen((open) => !open);
      return;
    }
    document
      .getElementById("reviews")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className={s.panelBackground} data-reviews-open={reviewsOpen} aria-hidden="true" />

      <div className={s.panelContent}>
        <div className={s.descriptionTop}>
          <div className={s.headerRow}>
            <div>
              {category && <p className={s.categoryLabel}>{category}</p>}
              <h1>{title}</h1>
            </div>
            <p className={s.priceTop}>
              <Price amount={priceAmount} currencyCode={priceCurrencyCode} />
            </p>
          </div>

          <button
            type="button"
            className={s.ratingLink}
            onClick={handleRatingClick}
            aria-expanded={reviewsOpen}
          >
            {formatRating(DEMO_RATING)}/5 ({DEMO_REVIEW_COUNT} Reviews)
          </button>

          {descriptionNode}
        </div>

        <div className={s.addToCartRow}>{addToCart}</div>

        <div className={s.iconRow} aria-hidden="true">
          {iconSlugs.map((slug) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={slug}
              src={`/icons/categories/${slug}.svg`}
              alt=""
              className={s.smallIcon}
            />
          ))}
        </div>

        <Accordion items={accordionItems} />
      </div>

      {/* Desktop: covers the whole panel above (title/description/add to
          cart/accordion) when the rating link is clicked. Hidden on
          mobile via CSS — mobile uses the static section below instead. */}
      {reviewsOpen && (
        <div className={s.reviewsOverlay}>
          <ReviewsPanel onClose={() => setReviewsOpen(false)} />
        </div>
      )}

      {/* Mobile-only static section (hidden on desktop via CSS) — reached
          by the rating link scrolling to it above. */}
      <div id="reviews" className={s.reviewsSection}>
        <ReviewsPanel />
      </div>
    </>
  );
}
