"use client";

import { useState } from "react";
import s from "./page.module.css";
import { type ReviewsData, ratingSummary } from "./reviews-data";
import { ReviewRow } from "./review-row";

// Shared between the mobile static "Reviews" section (always in normal
// flow, reached by scrolling/anchor) and the desktop swap-in panel that
// replaces Add To Cart / icon row / accordion when the rating link is
// clicked — same table, same expand-on-click rows, per
// Set-Up-Components/ProductPage's Reviews Flyout reference.
export function ReviewsPanel({ data }: { data: ReviewsData }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={s.reviewsPanel}>
      {/* Mobile-only heading (hidden on desktop via CSS) - the desktop
          flyout sits under the IPP's own title + rating line instead,
          which stay in place and act as its heading. No close button:
          the rating line toggles the flyout. */}
      <div className={s.reviewsPanelHead}>
        <p className={s.reviewsHeading}>
          {ratingSummary(data)}
        </p>
      </div>

      {data.count === 0 ? (
        <p className={s.reviewBody}>No reviews yet.</p>
      ) : (
      <>
      <div className={s.reviewsHeaderRow} aria-hidden="true">
        <span>Name</span>
        <span>Anchor</span>
        <span>Number</span>
        <span>Product</span>
        <span>Rating</span>
      </div>

      <div className={s.reviewsList}>
        {data.reviews.map((review) => (
          <ReviewRow
            key={review.id}
            review={review}
            isOpen={openId === review.id}
            onToggle={() => setOpenId(openId === review.id ? null : review.id)}
          />
        ))}
      </div>
      </>
      )}
    </div>
  );
}
