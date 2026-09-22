import { ProductGrid } from "../../components/product-grid";
import { pickRandomTones } from "../../lib/demo-tones";
import type { ListedProduct } from "../../components/product-card";
import { sanityFetch } from "../../data/sanity/";
import { ALL_PRODUCTS_QUERY } from "../../data/sanity/queries";

// Mirrors HOME_CATEGORIES in studio/src/constants.ts — the two workspaces
// don't share code, so this display-label lookup is duplicated here the
// same way app/products/[slug]/page.tsx already does (category is stored
// as the uppercase `value`, e.g. "PRESSURE", not the display title).
const CATEGORY_LABELS: Record<string, string> = {
  PRESSURE: "Pressure",
  FLOW: "Flow",
  MOMENTUM: "Momentum",
  REPETITION: "Repetition",
  BALANCE: "Balance",
  BLOOM: "Bloom",
};

export default async function Page() {
  const { data } = await sanityFetch({
    query: ALL_PRODUCTS_QUERY,
    stega: false,
  });

  // Fallback tones only cover products with no gallery image in Studio yet
  // and no Shopify featured image either — everything else renders its
  // real photo.
  const tones = pickRandomTones(data.length);

  const products: ListedProduct[] = data.map((product, i) => ({
    id: product._id,
    slug: product.slug ?? "",
    index: String(i + 1).padStart(3, "0"),
    category: product.category ? CATEGORY_LABELS[product.category] ?? product.category : "Uncategorised",
    title: product.title ?? "Untitled",
    price: product.price,
    imageUrl: product.imageUrl,
    color: tones[i],
  }));

  return (
    <div>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
