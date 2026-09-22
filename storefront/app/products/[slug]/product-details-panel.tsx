"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import Price from "../../../components/price";
import { AddToCart } from "../../_cart/add-to-cart";
import type { Product } from "../../../shopify/types";
import { Accordion, type AccordionEntry } from "./accordion";
import { ReviewsPanel } from "./reviews-panel";
import { DEMO_RATING, DEMO_REVIEW_COUNT, formatRating } from "./reviews-data";
import s from "./page.module.css";

// A related product as shown in the small icon row below Add To Cart:
// already stega-cleaned by page.tsx, iconSlug is the lowercased category
// (matches public/icons/categories/<slug>.svg).
export type RelatedProductIcon = {
  slug: string;
  title: string | null;
  iconSlug: string;
};

export function ProductDetailsPanel({
  category,
  categoryIndex,
  title,
  priceAmount,
  priceCurrencyCode,
  descriptionNode,
  accordionItems,
  categoryIconSlug,
  relatedProducts = [],
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
  relatedProducts?: RelatedProductIcon[];
  product: Product;
}) {
  const [reviewsOpen, setReviewsOpen] = useState(false);


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

        {/* This product's own category icon (100%), then up to 3 related
            products (Sanity "Related Products" field) as their category
            icons at 25%, each linking to that product. */}
        {(categoryIconSlug || relatedProducts.length > 0) && (
          <div className={s.iconRow}>
            {categoryIconSlug && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/icons/categories/${categoryIconSlug}.svg`}
                alt=""
                aria-hidden="true"
                className={s.smallIcon}
              />
            )}
            {relatedProducts.map((related) => (
              <Link
                key={related.slug}
                href={`/products/${related.slug}`}
                className={s.relatedIconLink}
                aria-label={related.title ?? related.slug}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/icons/categories/${related.iconSlug}.svg`}
                  alt=""
                  className={s.smallIcon}
                />
              </Link>
            ))}
          </div>
        )}

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
