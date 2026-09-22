// Static demo review content — there's no reviews model in Sanity yet (it's
// not part of the pseudo-schema this project is built from), so this
// stands in for real review data the same way lib/demo-tones.ts stands in
// for real photography until it exists. Names/anchors/products/ratings
// mirror Set-Up-Components/ProductPage's "Reviews Flyout" reference so the
// layout can be built and checked against it; review body copy is the
// placeholder Lorem ipsum sentence throughout (per instruction) since
// there's no real review copy to show yet.

export type DemoReview = {
  name: string;
  anchor: string; // category shown in the "Anchor" column, with its icon
  number: string; // per-product display number shown in the reference
  product: string; // the variant/kit the reviewer bought
  rating: number;
  age: string;
  hairLength: string;
  hairType: string;
  heatType: string;
};

export const DEMO_REVIEW_BODY =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

export const DEMO_RATING = 4.8;
export const DEMO_REVIEW_COUNT = 7;

export const DEMO_REVIEWS: DemoReview[] = [
  {
    name: "Anais",
    anchor: "Pressure",
    number: "001",
    product: "Sauna Hair Mask, 10 Pack",
    rating: 5,
    age: "18-24",
    hairLength: "Medium",
    hairType: "Straight, Dry",
    heatType: "Traditional",
  },
  {
    name: "Heinz",
    anchor: "Pressure",
    number: "001",
    product: "Sauna Hair Mask, Discovery Kit",
    rating: 4,
    age: "25-34",
    hairLength: "Long",
    hairType: "Wavy",
    heatType: "Infrared",
  },
  {
    name: "Julia",
    anchor: "Flow",
    number: "001",
    product: "Sauna Hair Mask, 50 Pack",
    rating: 5,
    age: "35-44",
    hairLength: "Short",
    hairType: "Curly",
    heatType: "Traditional",
  },
  {
    name: "Maddy",
    anchor: "Balance",
    number: "001",
    product: "Sauna Hair Mask, 10 Pack",
    rating: 4.5,
    age: "25-34",
    hairLength: "Medium",
    hairType: "Straight, Oily",
    heatType: "Infrared",
  },
  {
    name: "Atong",
    anchor: "Momentum",
    number: "001",
    product: "Sauna Hair Mask, 10 Pack",
    rating: 5,
    age: "18-24",
    hairLength: "Long",
    hairType: "Coily",
    heatType: "Traditional",
  },
  {
    name: "Kim",
    anchor: "Bloom",
    number: "001",
    product: "Sauna Hair Mask, Discovery Kit",
    rating: 5,
    age: "45-54",
    hairLength: "Medium",
    hairType: "Wavy, Dry",
    heatType: "Traditional",
  },
  {
    name: "Sachi",
    anchor: "Repetition",
    number: "001",
    product: "Sauna Hair Mask, 10 Pack",
    rating: 5,
    age: "25-34",
    hairLength: "Short",
    hairType: "Straight",
    heatType: "Infrared",
  },
];

export function formatRating(rating: number) {
  return Number.isInteger(rating) ? `${rating}` : rating.toFixed(1);
}
