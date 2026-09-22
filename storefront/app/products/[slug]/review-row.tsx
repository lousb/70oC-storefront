"use client";

import s from "./page.module.css";
import { type DemoReview, DEMO_REVIEW_BODY, formatRating } from "./reviews-data";

// One row of the reviews table — collapsed shows Name / Anchor (category +
// its icon) / Number / Product / Rating, matching
// Set-Up-Components/ProductPage's Reviews Flyout reference; expanded adds
// the Age/Hair Length/Hair Type/Heat Type line and the review body below
// it. Anchor/Number are hidden on mobile via CSS (page.module.css) — the
// mobile reference only ever shows Name / Product / Rating.
export function ReviewRow({
  review,
  isOpen,
  onToggle,
}: {
  review: DemoReview;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={s.reviewRow}>
      <button
        type="button"
        className={s.reviewRowHead}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className={s.reviewName}>{review.name}</span>
        <span className={s.reviewAnchor}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/icons/categories/${review.anchor.toLowerCase()}.svg`}
            alt=""
            className={s.reviewAnchorIcon}
          />
          {review.anchor}
        </span>
        <span className={s.reviewNumber}>{review.number}</span>
        <span className={s.reviewProduct}>{review.product}</span>
        <span className={s.reviewRating}>{formatRating(review.rating)} / 5</span>
        <span className={s.reviewToggle} aria-hidden="true">
          {isOpen ? "–" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className={s.reviewDetail}>
          <dl className={s.reviewMeta}>
            <div>
              <dt>Age</dt>
              <dd>{review.age}</dd>
            </div>
            <div>
              <dt>Hair Length</dt>
              <dd>{review.hairLength}</dd>
            </div>
            <div>
              <dt>Hair Type</dt>
              <dd>{review.hairType}</dd>
            </div>
            <div>
              <dt>Heat Type</dt>
              <dd>{review.heatType}</dd>
            </div>
          </dl>
          <p className={s.reviewLabel}>Review</p>
          <p className={s.reviewBody}>{DEMO_REVIEW_BODY}</p>
        </div>
      )}
    </div>
  );
}
