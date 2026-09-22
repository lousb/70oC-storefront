"use client";

import { useState, type ReactNode } from "react";
import Price from "../../../components/price";
import { AddToCart } from "../../_cart/add-to-cart";
import type { Product } from "../../../shopify/types";
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
  categoryIndex,
  title,
  priceAmount,
  priceCurrencyCode,
  descriptionNode,
  accordionItems,
  categoryIconSlug,
  product,
}: {
  category: string | null;
  categoryIndex: string | null;
  title: string;
  priceAmount: string;
  priceCurrencyCode: string;
  descriptionNode: ReactNode;
  accordionItems: AccordionEntry[];
  categoryIconSlug?: string | null;
  product: Product;
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
          {/* Grid, not a plain flex row - see .headerRow in
              page.module.css: the category label (now "Pressure 001",
              category + its 1-based position among the homepage's own
              reorderable anchor sections - see categoryIndex in page.tsx)
              and the price swap places with the title between desktop
              and mobile (desktop: label+price on one line, title below;
              mobile: title+label share one line, price hidden), which a
              grid's `grid-template-areas` handles per breakpoint without
              needing two copies of the title itself. */}
          <div className={s.headerRow}>
            {category && (
              <p className={s.categoryLabel}>
                {category}
                {categoryIndex && (
                  <span className={s.categoryIndex}>{categoryIndex}</span>
                )}
              </p>
            )}
            <h1>{title}</h1>
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

        <div className={s.addToCartRow}><AddToCart product={product} /></div>

        {/* Mobile-only Add to Cart + Price bar. Sits right where
            .addToCartRow is (that row is desktop-only, hidden on mobile -
            see page.module.css). Plain normal-flow content, no
            sticky/pin/dock behavior - a pinned version was tried and
            pulled back out at the user's request, so this is just the
            page's own Add to Cart, styled for mobile. A second,
            independent <AddToCart> instance - takes `product` (a plain
            serializable object) rather than a pre-built element/function
            prop, since Page is a server component and can't hand a
            function across that boundary, and reusing one element in two
            places trips React's "each child needs a unique key" check. */}
        <div className={s.mobileCartBar}>
          <AddToCart product={product} />
          <p className={s.mobileCartPrice}>
            <Price amount={priceAmount} currencyCode={priceCurrencyCode} />
          </p>
        </div>

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
