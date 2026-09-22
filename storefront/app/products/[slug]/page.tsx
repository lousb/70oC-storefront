import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { CustomPortableText } from "../../../components/custom-portable-text";
import { sanityFetch } from "../../../data/sanity";
import { stegaClean } from "@sanity/client/stega";

import {
  ALL_PRODUCT_PAGES_SLUGS,
  HOME_SECTIONS_ORDER_QUERY,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
} from "../../../data/sanity/queries";
import { getProduct } from "../../../data/shopify";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import s from "./page.module.css";
import { ProductProvider } from "./product-context";
import { Gallery } from "./gallery";
import { AccordionEntry } from "./accordion";
import { ProductSection } from "./product-section";
import { ProductDetailsPanel } from "./product-details-panel";

type Props = {
  params: Promise<{ slug: string }>;
};

// Mirrors studio/src/schema-types/constants.ts HOME_CATEGORIES — the two
// workspaces don't share code, so this small display-label lookup is
// duplicated here the same way app/products/page.tsx already duplicates the
// anchor list.
const CATEGORY_LABELS: Record<string, string> = {
  PRESSURE: "Pressure",
  FLOW: "Flow",
  MOMENTUM: "Momentum",
  REPETITION: "Repetition",
  BALANCE: "Balance",
  BLOOM: "Bloom",
};

// Same 6 values as CATEGORY_LABELS above, in this object's own insertion
// order — used as the category-index fallback (see categoryIndex below)
// on a not-yet-published/stale "home" document with no `sections` array
// yet, same fallback app/page.tsx's own HOME_ANCHORS falls back to.
const CATEGORY_FALLBACK_ORDER = Object.keys(CATEGORY_LABELS);

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_PRODUCT_PAGES_SLUGS,
    perspective: "published",
    stega: false,
  });
  return data;
}

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const { data: product } = await sanityFetch({
    query: PRODUCT_METADATA_QUERY,
    params,
    stega: false,
  });
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = resolveOpenGraphImage(product?.store?.previewImageUrl);

  return {
    title: product?.store?.title,
    description: product?.store?.descriptionHtml,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata;
}

export default async function Page(props: Props) {
  const params = await props.params;

  const [{ tags, data: productPage }, { data: homeSectionsOrder }] =
    await Promise.all([
      sanityFetch({ query: PRODUCT_QUERY, params }),
      // Only used to number this product's category label ("Pressure
      // 001") by its position in the homepage's own section order - see
      // categoryIndex below. stega: false since that index is derived
      // (never rendered as its own editable field), and stega's invisible
      // characters would otherwise break the array's === comparisons the
      // same way they'd break cleanCategory below if left unclean.
      sanityFetch({ query: HOME_SECTIONS_ORDER_QUERY, stega: false }),
    ]);

  const product = await getProduct({ handle: params.slug, tags });

  if (!product?.id) {
    return notFound();
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "AggregateOffer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      highPrice: product.priceRange.maxVariantPrice.amount,
      lowPrice: product.priceRange.minVariantPrice.amount,
    },
  };

  // --- Everything below feeds the sticky left-hand text panel, matching
  // Set-Up-Components/ProductPage's [DESKTOP]/[MOBILE] IPP 1A references
  // (Category + Title / Price, description, Add to Cart, then the
  // Details/Ingredients/How To Use/Shipping/Where We Live accordion). The
  // "Reviews Flyout" variant and star-rating summary are out of scope for
  // now — no real review data exists yet.

  // Sanity's Visual Editing ("stega") encoding embeds invisible characters
  // into string field values returned by this query, so editors can click
  // rendered text in Presentation mode to jump to its Studio field. That's
  // only safe for text actually rendered as visible copy - `category` is
  // used to build a URL/filename (categoryIconSlug below) and as an exact
  // object-key lookup (CATEGORY_LABELS), so it has to be cleaned first or
  // the invisible characters silently break both (see sanity-image.tsx for
  // the same fix already applied to image alt text).
  const cleanCategory = productPage?.category
    ? stegaClean(productPage.category)
    : null;
  const category = cleanCategory ? CATEGORY_LABELS[cleanCategory] : null;
  // Same icon set/convention as components/anchor-carousel-section.tsx's
  // intro-view icon (public/icons/02Icons/<slug>.png).
  const categoryIconSlug = cleanCategory?.toLowerCase();

  // "Pressure 001"-style index next to the category label (see
  // product-details-panel.tsx's .categoryLabel) - this product
  // category's 1-based position in the homepage's own `sections` order
  // (editors can reorder anchors in Studio - see app/page.tsx's own
  // HOME_ANCHORS/home.sections handling), not a fixed per-category
  // number, so re-ordering the homepage re-numbers every product too.
  // Falls back to CATEGORY_FALLBACK_ORDER's fixed order on a
  // not-yet-published "home" document with no sections yet, same as
  // app/page.tsx's own HOME_ANCHORS fallback.
  const sectionOrder =
    homeSectionsOrder?.filter(
      (name: string | null): name is string => !!name,
    ).length
      ? (homeSectionsOrder as string[])
      : CATEGORY_FALLBACK_ORDER;
  const categoryIndex = cleanCategory
    ? (() => {
        const position = sectionOrder.indexOf(cleanCategory);
        return position === -1
          ? null
          : String(position + 1).padStart(3, "0");
      })()
    : null;

  // "Details" is a flexible, possibly-multi-entry section: per-product
  // productInformation, optionally complemented by the site-wide defaults
  // from Settings — see product.tsx's overwriteDefaultInformationFields.
  const detailsEntries =
    productPage?.overwriteDefaultInformationFields === "noDefaults"
      ? (productPage?.productInformation ?? []).map((entry) => ({
          ...entry,
          source: "product" as const,
        }))
      : [
          ...(productPage?.defaultProductInformation ?? []).map((entry) => ({
            ...entry,
            source: "default" as const,
          })),
          ...(productPage?.productInformation ?? []).map((entry) => ({
            ...entry,
            source: "product" as const,
          })),
        ];

  // Placeholder copy for any of the 5 accordion rows a product hasn't had
  // real content entered for yet — so the accordion always shows all 5
  // (Details / Ingredients / How To Use / Shipping / Where We Live) for a
  // working demo, per instruction, rather than silently dropping rows
  // with no CMS content.
  const ACCORDION_PLACEHOLDER =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim dui risus, sed laoreet ligula tristique a. Integer ac porttitor lacus, a blandit nulla.";

  const realDetailsEntries = detailsEntries.filter(
    (entry) => entry.title && entry.content,
  );

  const accordionItems: AccordionEntry[] = [
    realDetailsEntries.length
      ? realDetailsEntries.map((entry) => ({
          // _key is only unique within its own array (Settings' defaults
          // vs this product's own entries), so prefix by source to keep
          // React keys collision-free when the two lists are combined.
          key: `${entry.source}-${entry._key}`,
          title: entry.title as string,
          content: <CustomPortableText value={entry.content as any} />,
        }))
      : [
          {
            key: "details-placeholder",
            title: "Details",
            content: <p>{ACCORDION_PLACEHOLDER}</p>,
          },
        ],
    [
      {
        key: "ingredients",
        title: "Ingredients",
        content: <p>{productPage?.ingredients || ACCORDION_PLACEHOLDER}</p>,
      },
    ],
    [
      {
        key: "how-to-use",
        title: "How To Use",
        content: productPage?.howToUse?.content ? (
          <CustomPortableText value={productPage.howToUse.content as any} />
        ) : (
          <p>{ACCORDION_PLACEHOLDER}</p>
        ),
      },
    ],
    [
      {
        key: "shipping",
        title: "Shipping",
        content: productPage?.shipping?.content ? (
          <CustomPortableText value={productPage.shipping.content as any} />
        ) : (
          <p>{ACCORDION_PLACEHOLDER}</p>
        ),
      },
    ],
    [
      {
        key: "where-we-live",
        title: "Where We Live",
        content: productPage?.whereWeLive?.content ? (
          <CustomPortableText
            value={productPage.whereWeLive.content as any}
          />
        ) : (
          <p>{ACCORDION_PLACEHOLDER}</p>
        ),
      },
    ],
  ].flat();

  return (
    <Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <ProductProvider>
        <div>
          <ProductSection
            gallery={
              <Gallery
                variants={product.variants}
                sanityGallery={(productPage?.gallery as any) ?? []}
              />
            }
            details={
              <ProductDetailsPanel
                category={category}
                categoryIndex={categoryIndex}
                title={product.title}
                priceAmount={product.priceRange.minVariantPrice.amount}
                priceCurrencyCode={product.priceRange.minVariantPrice.currencyCode}
                descriptionNode={
                  productPage?.description ? (
                    <p className={s.editorialDescription}>
                      {productPage.description}
                    </p>
                  ) : (
                    !!product.descriptionHtml && (
                      // Same class as the Sanity editorial override above -
                      // whichever of the two description sources is
                      // actually rendered, it should stay at the panel's
                      // 12px description size rather than picking up
                      // .panelContent's desktop 14px bump (page.module.css).
                      <div
                        className={s.editorialDescription}
                        dangerouslySetInnerHTML={{
                          __html: product.descriptionHtml ?? "",
                        }}
                      />
                    )
                  )
                }
                accordionItems={accordionItems}
                categoryIconSlug={categoryIconSlug}
                product={product}
              />
            }
            categoryIconSlug={categoryIconSlug}
          />
        </div>
      </ProductProvider>
    </Suspense>
  );
}
