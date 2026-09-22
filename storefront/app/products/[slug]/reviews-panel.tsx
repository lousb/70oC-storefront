"use client";

import { useState } from "react";
import s from "./page.module.css";
import { DEMO_REVIEWS, DEMO_RATING, DEMO_REVIEW_COUNT, formatRating } from "./reviews-data";
import { ReviewRow } from "./review-row";

// Shared between the mobile static "Reviews" section (always in normal
// flow, reached by scrolling/anchor) and the desktop swap-in panel that
// replaces Add To Cart / icon row / accordion when the rating link is
// clicked — same table, same expand-on-click rows, per
// Set-Up-Components/ProductPage's Reviews Flyout reference.
export function ReviewsPanel({ onClose }: { onClose?: () => void }) {
  const [openName, setOpenName] = useState<string | null>(
    DEMO_REVIEWS[0]?.name ?? null,
  );

  return (
    <div className={s.reviewsPanel}>
      <div className={s.reviewsPanelHead}>
        <p className={s.reviewsHeading}>
          {formatRating(DEMO_RATING)}/5 ({DEMO_REVIEW_COUNT} Reviews)
        </p>
        {onClose && (
          <button
            type="button"
            className={s.reviewsClose}
            onClick={onClose}
            aria-label="Close reviews"
          >
            Close
          </button>
        )}
      </div>

      <div className={s.reviewsHeaderRow} aria-hidden="true">
        <span>Name</span>
        <span>Anchor</span>
        <span>Number</span>
        <span>Product</span>
        <span>Rating</span>
      </div>

      <div className={s.reviewsList}>
        {DEMO_REVIEWS.map((review) => (
          <ReviewRow
            key={review.name}
            review={review}
            isOpen={openName === review.name}
            onToggle={() =>
              setOpenName(openName === review.name ? null : review.name)
            }
          />
        ))}
      </div>
    </div>
  );
}
