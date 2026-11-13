import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Suspense } from "react";
import { CustomPortableText } from "../../../components/custom-portable-text";
import { sanityFetch } from "../../../data/sanity";
import { stegaClean } from "@sanity/client/stega";

import {
  ALL_PRODUCT_PAGES_SLUGS,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
  ALL_REVIEWS_QUERY,
} from "../../../data/sanity/queries";
import { getProduct } from "../../../data/shopify";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import s from "./page.module.css";
import { ProductProvider } from "./product-context";
import { Gallery } from "./gallery";
import { AccordionEntry } from "./accordion";
import { ProductSection } from "./product-section";
import { ProductDetailsPanel } from "./product-details-panel";
import { getAnchors, anchorLabel, anchorIcon } from "../../../lib/anchors";

type Props = {
  params: Promise<{ slug: string }>;
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

  // Shopify drafts (and deleted products) are hidden on the storefront
  if (!product?.id || (productPage as any)?.isActive === false) {
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
  // Reviews come from Sanity (site-wide) — see `reviews` below.

  // Sanity's Visual Editing ("stega") encoding embeds invisible characters
  // into string field values returned by this query, so editors can click
  // rendered text in Presentation mode to jump to its Studio field. That's
  // only safe for text actually rendered as visible copy - `category` is
  // used to build a URL/filename (categoryIconSlug below) and as an exact
  // object-key lookup (anchor labels), so it has to be cleaned first or
  // the invisible characters silently break both (see sanity-image.tsx for
  // the same fix already applied to image alt text).
  const cleanCategory = productPage?.category
    ? stegaClean(productPage.category)
    : null;
  const anchors = await getAnchors();
  const category = anchorLabel(anchors, cleanCategory);
  // Same icon set/convention as components/anchor-carousel-section.tsx's
  // intro-view icon (public/icons/02Icons/<slug>.png).
  const categoryIconSlug = anchorIcon(anchors, cleanCategory) ?? undefined;

  // Related Products (Sanity, max 3) -> icon row under Add To Cart. The
  // query already drops refs with no slug/category; stegaClean because
  // both values end up in a URL/filename.
  const relatedProducts = (productPage?.relatedProducts ?? []).flatMap(
    (related) => {
      const slug = related?.slug ? stegaClean(related.slug) : null;
      const category = related?.category ? stegaClean(related.category) : null;
      return slug && category
        ? [{ slug, title: related.title, iconSlug: anchorIcon(anchors, category)! }]
        : [];
    },
  );

  // "Pressure 001"-style index next to the category label (see
  // product-details-panel.tsx's .categoryLabel): this product's position
  // within its own category (oldest first), computed in PRODUCT_QUERY.
  const categoryIndex =
    cleanCategory && productPage?.categoryPosition
      ? String(productPage.categoryPosition).padStart(3, "0")
      : null;

  // Reviews: site-wide list (same on every product page). Each row's
  // Anchor + Number are the reviewed product's own category/icon/"001".
  const { data: allReviews } = await sanityFetch({
    query: ALL_REVIEWS_QUERY,
    stega: false,
  });
  const reviewList = (allReviews ?? []).flatMap((r) => {
    if (!r.name || typeof r.rating !== "number" || !r.body) return [];
    const key = r.category ? stegaClean(r.category) : null;
    return [
      {
        id: r._id,
        name: r.name,
        product: [r.productTitle, r.variantTitle]
          .filter((t) => t && t !== "Default Title")
          .join(", "),
        rating: r.rating,
        body: r.body,
        age: r.age ?? null,
        hairLength: r.hairLength ?? null,
        hairType: r.hairType ?? null,
        heatType: r.heatType ?? null,
        anchor: {
          label: anchorLabel(anchors, key),
          iconSlug: anchorIcon(anchors, key),
          number: key && r.categoryPosition
            ? String(r.categoryPosition).padStart(3, "0")
            : null,
        },
      },
    ];
  });
  const reviews = {
    reviews: reviewList,
    count: reviewList.length,
    average: reviewList.length
      ? Math.round(
          (reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length) * 10,
        ) / 10
      : null,
  };

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
        content: (
          <p style={{ whiteSpace: "pre-line" }}>
            {productPage?.ingredients || ACCORDION_PLACEHOLDER}
          </p>
        ),
      },
    ],
    [
      {
        key: "how-to-use",
        title: "How To Use",
        content: (
          <p style={{ whiteSpace: "pre-line" }}>
            {productPage?.howToUse || ACCORDION_PLACEHOLDER}
          </p>
        ),
      },
    ],
    [
      {
        key: "shipping",
        title: "Shipping",
        content: (
          <p style={{ whiteSpace: "pre-line" }}>
            {productPage?.shipping || ACCORDION_PLACEHOLDER}
          </p>
        ),
      },
    ],
    [
      {
        key: "where-we-live",
        title: "Where We Live",
        content: (
          <p style={{ whiteSpace: "pre-line" }}>
            {productPage?.whereWeLive || ACCORDION_PLACEHOLDER}
          </p>
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
                      // HTML markup, not a typed text field: newlines in
                      // the markup aren't meant to show, so it opts out of
                      // body's pre-line (styles/globals.css).
                      <div
                        className={s.editorialDescription}
                        style={{ whiteSpace: "normal" }}
                        dangerouslySetInnerHTML={{
                          __html: product.descriptionHtml ?? "",
                        }}
                      />
                    )
                  )
                }
                accordionItems={accordionItems}
                categoryIconSlug={categoryIconSlug}
                relatedProducts={relatedProducts}
                product={product}
                reviews={reviews}
              />
            }
            categoryIconSlug={categoryIconSlug}
          />
        </div>
      </ProductProvider>
    </Suspense>
  );
}
