// Review data comes from Sanity ("review" documents, each referencing the
// product it was left for - see studio/src/schema-types/documents/
// review.ts and ALL_REVIEWS_QUERY). The list is site-wide: every product
// page shows the same reviews. This file just holds the shape
// the reviews UI works with, plus small formatting helpers.

export type Review = {
  id: string;
  name: string;
  /** What they bought, e.g. "Sauna Hair Mask, 10 Pack". */
  product: string;
  rating: number;
  body: string;
  age: string | null;
  hairLength: string | null;
  hairType: string | null;
  heatType: string | null;
  /** The reviewed product's anchor + "001". */
  anchor: ReviewAnchor;
};

export type ReviewAnchor = {
  label: string | null;
  iconSlug: string | null;
  number: string | null;
};

export type ReviewsData = {
  reviews: Review[];
  average: number | null;
  count: number;
};

export function formatRating(rating: number) {
  return Number.isInteger(rating) ? `${rating}` : rating.toFixed(1);
}

export function ratingSummary({ average, count }: Pick<ReviewsData, "average" | "count">) {
  if (!count || average === null) return "No Reviews Yet";
  return `${formatRating(average)}/5 (${count} Review${count === 1 ? "" : "s"})`;
}
