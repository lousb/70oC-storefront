import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { Link } from 'next-view-transitions'
import { Suspense } from "react";
import { PageBuilder } from "../../../components/page-builder";
import Price from "../../../components/price";
import { sanityFetch } from "../../../data/sanity";

import {
  ALL_PRODUCT_PAGES_SLUGS,
  PRODUCT_METADATA_QUERY,
  PRODUCT_QUERY,
} from "../../../data/sanity/queries";
import { getProduct, getProducts, getProductRecommendations } from "../../../data/shopify";
import { resolveOpenGraphImage } from "../../../sanity/utils";
import { Product } from "../../../shopify/types";
import { AddToCart } from "../../_cart/add-to-cart";
import s from "./page.module.css";
import { ProductProvider } from "./product-context";
import { Gallery } from "./gallery";
import { ProductImage } from "./product-image";

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

  if (!product?.id) {
    return notFound();
  }

const allProducts = await getProducts({ sortKey: "TITLE", reverse: false, query: "" });
const otherProducts = allProducts.filter(p => p.id !== product.id);
const seed = product.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
const relatedProducts = [0, 1, 2].map(i => otherProducts[(seed + i) % otherProducts.length]).filter(Boolean);

console.log("relatedProducts", relatedProducts.length);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage.url,
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
            <div className={s.gallery}>
              <Gallery
                variants={product.variants}
                featuredImage={product.featuredImage}
                sanityGallery={productPage?.gallery as any ?? []}
              />
            </div>
            <div className={s.productDetails}>
              <ProductDescription product={product} relatedProducts={relatedProducts} />
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

function ProductDescription({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  return (
    <div className={s.description}>
      <div className={s.descriptionTop}>
        <h1>{product.title}</h1>
        {!!product.descriptionHtml && (
          <div
            dangerouslySetInnerHTML={{
              __html: product.descriptionHtml ?? "",
            }}
          />
        )}
      </div>

      <div style={{ width: "300px" }}>
        <AddToCart product={product} />
        {/* svg */}
      </div>

      {relatedProducts.length > 0 && (
  <div style={{ display: "flex", gap: "1em", flexWrap: "nowrap", width: "100%" }} className="related-products">
    {relatedProducts.slice(0, 3).map((related) => (
      <Link key={related.handle} href={`/products/${related.handle}`} prefetch={true} style={{ flex: "1 1 0", minWidth: 0 }}>
        <div className="product-card">
          <ProductImage
            shopifyImage={related.featuredImage}
            objectFit="cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
          />
        </div>
        <h3>{related.title}</h3>
      </Link>
    ))}
  </div>
)}

      
    </div>
  );
}