"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  // Keeps the overlay mounted through its slide-out, and flips
  // data-state a frame after mount so the slide-in transition runs.
  const [reviewsMounted, setReviewsMounted] = useState(false);
  const [reviewsShown, setReviewsShown] = useState(false);

  // Clicking anywhere outside the open slide-out closes it (Escape too).
  const overlayRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!reviewsOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        target &&
        (overlayRef.current?.contains(target) ||
          // The rating line toggles it itself.
          ratingRef.current?.contains(target))
      )
        return;
      setReviewsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReviewsOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [reviewsOpen]);

  // The slide-out is desktop-only: if the window drops to the mobile
  // breakpoint while it's open, close it (mobile has the static
  // #reviews section instead).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setReviewsOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reviewsOpen) {
      setReviewsMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setReviewsShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setReviewsShown(false);
    const t = setTimeout(() => setReviewsMounted(false), 450);
    return () => clearTimeout(t);
  }, [reviewsOpen]);

  // This product's own category icon (100%), then up to 3 related
  // products (Sanity "Related Products" field) as their category icons at
  // 25%, each linking to that product. Rendered twice: above the
  // accordion on desktop, below it on mobile (each copy hidden on the
  // other breakpoint via CSS, same pattern as .mobileCartBar).
  const hasIcons = !!categoryIconSlug || relatedProducts.length > 0;
  const renderIconRow = (placementClass: string) => (
    <div className={`${s.iconRow} ${placementClass}`}>
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
  );

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
      <div
        className={s.panelBackground}
        data-reviews-open={reviewsOpen}
        aria-hidden="true"
      />

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
            ref={ratingRef}
            type="button"
            className={s.ratingLink}
            onClick={handleRatingClick}
            aria-expanded={reviewsOpen}
          >
            {formatRating(DEMO_RATING)}/5 ({DEMO_REVIEW_COUNT} Reviews)
          </button>

          {descriptionNode}
        </div>

        <div className={s.addToCartRow}>
          <AddToCart product={product} />
        </div>

        {/* Mobile-only Add to Cart + Price bar. Sits right where
            .addToCartRow is (that row is desktop-only, hidden on mobile -
            see page.module.css). Fixed to the bottom of the viewport on
            mobile (10px padding all round). data-mobile-cart-bar is a
            plain global hook so floating-logo.module.css and globals.css
            can detect this page via body:has() and lift the "0"/"OC"
            logo 10px above the bar. A second,
            independent <AddToCart> instance - takes `product` (a plain
            serializable object) rather than a pre-built element/function
            prop, since Page is a server component and can't hand a
            function across that boundary, and reusing one element in two
            places trips React's "each child needs a unique key" check. */}
        <div className={s.mobileCartBar} data-mobile-cart-bar>
          <AddToCart product={product} />
          <p className={s.mobileCartPrice}>
            <Price amount={priceAmount} currencyCode={priceCurrencyCode} />
          </p>
        </div>

        {hasIcons && renderIconRow(s.iconRowDesktop)}

        <Accordion items={accordionItems} />

        {hasIcons && renderIconRow(s.iconRowMobile)}
      </div>

      {/* Desktop: slides in over the whole panel when the rating link is
          clicked, matching Set-Up-Components/Review (with grid). Hidden on
          mobile via CSS — mobile uses the static section below instead. */}
      {reviewsMounted && (
        <div
          ref={overlayRef}
          className={s.reviewsOverlay}
          data-state={reviewsShown ? "open" : "closed"}
        >
          {/* Invisible copy of the IPP's title / price / rating block -
              just a spacer so the table starts exactly under the real
              one, which stays on top of this overlay (higher z-index)
              and only flips to white once the slide-in finishes. */}
          <div className={s.reviewsHeaderSpacer} aria-hidden="true">
          <div className={s.headerRow}>
            {category && (
              <p className={s.categoryLabel}>
                {category}
                {categoryIndex && (
                  <span className={s.categoryIndex}>{categoryIndex}</span>
                )}
              </p>
            )}
            <p className={s.reviewsTitle}>{title}</p>
            <p className={s.priceTop}>
              <Price amount={priceAmount} currencyCode={priceCurrencyCode} />
            </p>
          </div>
          <p className={s.ratingLink}>
            {formatRating(DEMO_RATING)}/5 ({DEMO_REVIEW_COUNT} Reviews)
          </p>
          </div>
          <ReviewsPanel />
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
