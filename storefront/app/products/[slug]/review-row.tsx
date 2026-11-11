"use client";

import s from "./page.module.css";
import { type Review, formatRating } from "./reviews-data";

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
  review: Review;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const meta: [string, string][] = [];
  if (review.age) meta.push(["Age", review.age]);
  if (review.hairLength) meta.push(["Hair Length", review.hairLength]);
  if (review.hairType) meta.push(["Hair Type", review.hairType]);
  if (review.heatType) meta.push(["Heat Type", review.heatType]);

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
          {review.anchor.iconSlug && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/icons/categories/${review.anchor.iconSlug}.svg`}
              alt=""
              className={s.reviewAnchorIcon}
            />
          )}
          {review.anchor.label}
        </span>
        <span className={s.reviewNumber}>{review.anchor.number}</span>
        <span className={s.reviewProduct}>{review.product}</span>
        <span className={s.reviewRating}>{formatRating(review.rating)} / 5</span>
        <span className={s.reviewToggle} aria-hidden="true">
          {isOpen ? "–" : "+"}
        </span>
      </button>
      {/* Always rendered so it can animate: the wrapper's grid row
          transitions 0fr -> 1fr (smooth height to auto), see
          .reviewDetailWrap in page.module.css. inert keeps the collapsed
          content out of tab order / screen readers. */}
      <div className={s.reviewDetailWrap} data-open={isOpen} inert={!isOpen}>
        <div className={s.reviewDetailInner}>
          <div className={s.reviewDetail}>
            {meta.length > 0 && (
              <dl className={s.reviewMeta}>
                {meta.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <p className={s.reviewLabel}>Review</p>
            <p className={s.reviewBody}>{review.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
