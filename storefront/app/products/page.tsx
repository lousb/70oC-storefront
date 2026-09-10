import { ProductGrid } from "../../components/product-grid";
import { pickRandomTones } from "../../lib/demo-tones";
import type { DemoProduct } from "../../components/product-card";

const ANCHORS = [
  "Pressure",
  "Flow",
  "Momentum",
  "Repetition",
  "Balance",
  "Bloom",
];

// No real Shopify products are synced yet — this renders a working demo
// of the Shop All layout (Set-Up-Components/Shop All) with 6 placeholder
// items, one per Anchor/category, "Title" standing in for the Sanity/
// Shopify title field until real products exist. Colors are randomized
// per request in this Server Component, then passed down as data, so
// there's no client/server hydration mismatch.
function getDemoProducts(): DemoProduct[] {
  const colors = pickRandomTones(ANCHORS.length);
  return ANCHORS.map((category, i) => ({
    id: `demo-product-${i}`,
    index: String(i + 1).padStart(3, "0"),
    category,
    title: "Title",
    price: "$90",
    color: colors[i],
  }));
}

export default function Page() {
  const products = getDemoProducts();

  return (
    <div>
      <ProductGrid products={products} />
    </div>
  );
}
