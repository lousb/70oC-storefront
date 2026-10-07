import { ProductGrid } from "../../components/product-grid";
import { pickRandomTones } from "../../lib/demo-tones";
import type { ListedProduct } from "../../components/product-card";
import { sanityFetch } from "../../data/sanity/";
import { ALL_PRODUCTS_QUERY, HOME_QUERY } from "../../data/sanity/queries";
import { urlForImage } from "../../sanity/utils";

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
  const [{ data }, { data: home }] = await Promise.all([
    sanityFetch({ query: ALL_PRODUCTS_QUERY, stega: false }),
    sanityFetch({ query: HOME_QUERY, stega: false }),
  ]);

  // Hover state on each card: its anchor's Home section Image 1 (keyed by
  // the locked upper-case sectionName, e.g. "PRESSURE", which is the same
  // value products store as `category`).
  const anchorImages: Record<string, string> = {};
  for (const section of home?.sections ?? []) {
    const url = urlForImage(section.image1)?.width(1200).url();
    if (section.sectionName && url) anchorImages[section.sectionName] = url;
  }

  // Fallback tones only cover products with no gallery image in Studio yet
  // and no Shopify featured image either — everything else renders its
  // real photo.
  const tones = pickRandomTones(data.length);

  const products: ListedProduct[] = data.map((product, i) => ({
    id: product._id,
    slug: product.slug ?? "",
    // Position within its own category (see ALL_PRODUCTS_QUERY), matching
    // the product page's "Pressure 001".
    index: product.categoryPosition
      ? String(product.categoryPosition).padStart(3, "0")
      : "",
    category: product.category ? CATEGORY_LABELS[product.category] ?? product.category : "Uncategorised",
    title: product.title ?? "Untitled",
    price: product.price,
    imageUrl: product.imageUrl,
    hoverImageUrl: product.category ? anchorImages[product.category] ?? null : null,
    iconSlug: product.category ? product.category.toLowerCase() : null,
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
