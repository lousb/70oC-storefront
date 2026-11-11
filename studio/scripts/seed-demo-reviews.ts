/**
 * Seeds the 7 placeholder reviews (from the original Reviews Flyout mockup)
 * into Sanity as PUBLISHED "review" documents, so the reviews table has
 * content while real reviews are collected.
 *
 * Run from /studio:
 *   npx sanity exec scripts/seed-demo-reviews.ts --with-user-token
 *
 * Safe to re-run: fixed IDs (review-demo-*), createOrReplace.
 * Remove later with:
 *   npx sanity documents delete review-demo-anais review-demo-heinz review-demo-julia review-demo-maddy review-demo-atong review-demo-kim review-demo-sachi
 *
 * Each review must reference a product (that's where its Anchor/Number
 * come from). The script picks the first synced Shopify product, preferring
 * one that has a Category set. Re-point them in Studio once real products
 * exist.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-03-01" });

const BODY = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const REVIEWS = [
  { id: "anais", name: "Anais", rating: 5, age: "18-24", hairLength: "Medium", hairType: "Straight, Dry", heatType: "Traditional" },
  { id: "heinz", name: "Heinz", rating: 4, age: "25-34", hairLength: "Long", hairType: "Wavy", heatType: "Infrared" },
  { id: "julia", name: "Julia", rating: 5, age: "35-44", hairLength: "Short", hairType: "Curly", heatType: "Traditional" },
  { id: "maddy", name: "Maddy", rating: 4.5, age: "25-34", hairLength: "Medium", hairType: "Straight, Oily", heatType: "Infrared" },
  { id: "atong", name: "Atong", rating: 5, age: "18-24", hairLength: "Long", hairType: "Coily", heatType: "Traditional" },
  { id: "kim", name: "Kim", rating: 5, age: "45-54", hairLength: "Medium", hairType: "Wavy, Dry", heatType: "Traditional" },
  { id: "sachi", name: "Sachi", rating: 5, age: "25-34", hairLength: "Short", hairType: "Straight", heatType: "Infrared" },
];

async function run() {
  const product = await client.fetch<{ _id: string; title: string } | null>(
    `*[_type == "product" && !(_id in path("drafts.**")) && store.isDeleted != true]
      | order(defined(category) desc, _createdAt asc)[0]{_id, "title": store.title}`,
  );
  if (!product) throw new Error("No products in Sanity yet. Sync a product from Shopify first.");

  // Keep the mockup's order on the site (newest first), one day apart.
  const today = new Date();
  const tx = client.transaction();
  REVIEWS.forEach((r, i) => {
    const date = new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    tx.createOrReplace({
      _id: `review-demo-${r.id}`,
      _type: "review",
      name: r.name,
      product: { _type: "reference", _ref: product._id },
      rating: r.rating,
      body: BODY,
      age: r.age,
      hairLength: r.hairLength,
      hairType: r.hairType,
      heatType: r.heatType,
      date,
    });
  });
  await tx.commit();
  console.log(`Seeded ${REVIEWS.length} published reviews against "${product.title}".`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
