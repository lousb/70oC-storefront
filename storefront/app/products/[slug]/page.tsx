import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { CustomPortableText } from "../../../components/custom-portable-text";
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
  // (Category + Title / Price, description, Add to Cart, then the
  // Details/Ingredients/How To Use/Shipping/Where We Live accordion). The
  // "Reviews Flyout" variant and star-rating summary are out of scope for
  // now — no real review data exists yet.

  const category = productPage?.category
    ? CATEGORY_LABELS[productPage.category]
    : null;
  // Same icon set/convention as components/anchor-carousel-section.tsx's
  // intro-view icon (public/icons/02Icons/<slug>.png).
  const categoryIconSlug = productPage?.category?.toLowerCase();

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
                      <div
                        dangerouslySetInnerHTML={{
                          __html: product.descriptionHtml ?? "",
                        }}
                      />
                    )
                  )
                }
                accordionItems={accordionItems}
                categoryIconSlug={categoryIconSlug}
                addToCart={<AddToCart product={product} />}
              />
            }
            categoryIconSlug={categoryIconSlug}
          />
        </div>
      </ProductProvider>
    </Suspense>
  );
}
