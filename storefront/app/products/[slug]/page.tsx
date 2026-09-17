import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { PageBuilder } from "../../../components/page-builder";
import { CustomPortableText } from "../../../components/custom-portable-text";
import Price from "../../../components/price";
import { sanityFetch } from "../../../data/sanity";

import {
  ALL_PRODUCT_PAGES_SLUGS,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
} from "../../../data/sanity/queries";
import { getProduct } from "../../../data/shopify";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import { AddToCart } from "../../_cart/add-to-cart";
import s from "./page.module.css";
import { ProductProvider } from "./product-context";
import { Gallery } from "./gallery";
import { Accordion, AccordionEntry } from "./accordion";

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

  const { tags, data: productPage } = await sanityFetch({
    query: PRODUCT_QUERY,
    params,
  });

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
  // (Category + Title / Price, description, Top/Middle/Base Notes, Add to
  // Cart, then the Details/Ingredients/How To Use/Shipping/Where We Live
  // accordion). The "Reviews Flyout" variant and star-rating summary are
  // out of scope for now — no real review data exists yet.

  const category = productPage?.category ? CATEGORY_LABELS[productPage.category] : null;

  const notes: Array<{ label: string; values: string[] }> = [
    { label: "Top Notes", values: productPage?.topNotes ?? [] },
    { label: "Middle Notes", values: productPage?.middleNotes ?? [] },
    { label: "Base Notes", values: productPage?.baseNotes ?? [] },
  ].filter((n) => n.values.length > 0);

  // "Details" is a flexible, possibly-multi-entry section: per-product
  // productInformation, optionally complemented by the site-wide defaults
  // from Settings — see product.tsx's overwriteDefaultInformationFields.
  const detailsEntries =
    productPage?.overwriteDefaultInformationFields === "noDefaults"
      ? (productPage?.productInformation ?? []).map((entry) => ({ ...entry, source: "product" as const }))
      : [
          ...(productPage?.defaultProductInformation ?? []).map((entry) => ({ ...entry, source: "default" as const })),
          ...(productPage?.productInformation ?? []).map((entry) => ({ ...entry, source: "product" as const })),
        ];

  const accordionItems: AccordionEntry[] = [
    ...detailsEntries
      .filter((entry) => entry.title && entry.content)
      .map((entry) => ({
        // _key is only unique within its own array (Settings' defaults vs
        // this product's own entries), so prefix by source to keep React
        // keys collision-free when the two lists are combined.
        key: `${entry.source}-${entry._key}`,
        title: entry.title as string,
        content: <CustomPortableText value={entry.content as any} />,
      })),
    ...(productPage?.ingredients
      ? [
          {
            key: "ingredients",
            title: "Ingredients",
            content: <p>{productPage.ingredients}</p>,
          },
        ]
      : []),
    ...(productPage?.howToUse?.content
      ? [
          {
            key: "how-to-use",
            title: "How To Use",
            content: <CustomPortableText value={productPage.howToUse.content as any} />,
          },
        ]
      : []),
    ...(productPage?.shipping?.content
      ? [
          {
            key: "shipping",
            title: "Shipping",
            content: <CustomPortableText value={productPage.shipping.content as any} />,
          },
        ]
      : []),
    ...(productPage?.whereWeLive?.content
      ? [
          {
            key: "where-we-live",
            title: "Where We Live",
            content: <CustomPortableText value={productPage.whereWeLive.content as any} />,
          },
        ]
      : []),
  ];

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
          <div className={s.page}>
            <div className={s.galleryColumn}>
              <Gallery
                variants={product.variants}
                featuredImage={product.featuredImage}
                sanityGallery={productPage?.gallery as any ?? []}
              />
            </div>
            <div className={s.productDetails}>
              <div className={s.description}>
                <div className={s.descriptionTop}>
                  <div className={s.headerRow}>
                    <div>
                      {category && <p className={s.categoryLabel}>{category}</p>}
                      <h1>{product.title}</h1>
                    </div>
                    <p className={s.priceTop}>
                      <Price
                        amount={product.priceRange.minVariantPrice.amount}
                        currencyCode={product.priceRange.minVariantPrice.currencyCode}
                      />
                    </p>
                  </div>

                  {!!product.descriptionHtml && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml ?? "",
                      }}
                    />
                  )}

                  {notes.length > 0 && (
                    <dl className={s.notesList}>
                      {notes.map(({ label, values }) => (
                        <div key={label} className={s.notesRow}>
                          <dt className={s.notesLabel}>{label}:</dt>
                          <dd className={s.notesValue}>{values.join(", ")}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <div style={{ width: "300px" }}>
                  <AddToCart product={product} />
                </div>

                <Accordion items={accordionItems} />
              </div>
            </div>
          </div>
          {!!productPage?.pageBuilder?.length && (
            <PageBuilder page={productPage} />
          )}
        </div>
      </ProductProvider>
    </Suspense>
  );
}
