import { notFound } from "next/navigation";
import { getCollectionProducts, getProducts } from "../data/shopify";
import { Link } from 'next-view-transitions'
import NextImage from "next/image";
import Price from "./price";

export async function PLP(props: { collectionSlug?: string; tags: string[] }) {
  const { tags, collectionSlug } = props;
  let products;
  if (collectionSlug) {
    products = await getCollectionProducts({
      collection: collectionSlug,
      tags,
    });
  } else {
    products = await getProducts({ tags });
  }

  if (!products) {
    return notFound();
  }

  return (
    <div className="block-space">
      <div className="main-grid">
        {products
          .filter((product) => product.availableForSale)
          .map((product) => {
            return (
              <article key={product.id}>
                <Link href={`/products/${product.handle}`}>
                  <figure className="product-card">
                    <NextImage
                      src={product.featuredImage.url || ""}
                      fill
                      alt={`Image for product: ${product.title}`}
                      objectFit="contain"
                      sizes={"33vw"}
                    />
                    <figcaption>
                      <span>{product.title}</span>
                      <span>
                        <Price
                          amount={product.priceRange.maxVariantPrice.amount}
                          currencyCode={
                            product.priceRange.maxVariantPrice.currencyCode
                          }
                        />
                      </span>
                    </figcaption>
                  </figure>
                </Link>
              </article>
            );
          })}
      </div>
    </div>
  );
}
