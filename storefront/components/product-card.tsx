import NextImage from "next/image";
import { Link } from "next-view-transitions";
import Price from "./price";
import s from "./product-card.module.css";

export type ListedProduct = {
  id: string;
  slug: string;
  index: string;
  category: string;
  title: string;
  price: number | null;
  imageUrl?: string | null;
  // Hover state: the product's anchor's Home section Image 1, with that
  // anchor's slim line-art icon (public/icons/02Icons/<slug>.png, same as
  // the Home and product pages) on top, inverted to white.
  hoverImageUrl?: string | null;
  iconSlug?: string | null;
  // Fallback tonal color, used only when the product has no gallery image
  // yet in Studio and no Shopify featured image either — same palette the
  // Home/Stories placeholders use, so an incomplete product still looks
  // intentional rather than broken.
  color: string;
};

export function ProductCard({ product }: { product: ListedProduct }) {
  return (
    <Link href={`/products/${product.slug}`} className={s.card}>
      <div className={s.cover}>
        {product.imageUrl ? (
          <NextImage
            src={product.imageUrl}
            fill
            alt={`Image for product: ${product.title}`}
            style={{ objectFit: "cover" }}
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : (
          <div
            className={s.coverFallback}
            style={{ backgroundColor: product.color }}
          />
        )}
        {product.hoverImageUrl && (
          <div className={s.hover} aria-hidden="true">
            <NextImage
              src={product.hoverImageUrl}
              fill
              alt=""
              style={{ objectFit: "cover" }}
              sizes="(min-width: 768px) 25vw, 50vw"
            />
            {product.iconSlug && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/icons/02Icons/${product.iconSlug}.png`}
                alt=""
                className={s.hoverIcon}
              />
            )}
          </div>
        )}
      </div>
      <div className={s.caption}>
        {/* "001  Category  Title": index, anchor, then title - the same
            two non-breaking spaces as the gap between each. */}
        <div className={s.captionLeft}>
          {product.index && (
            <>
              <span className={s.index}>{product.index}</span>
              {"\u00a0\u00a0"}
            </>
          )}
          <span className={s.category}>{product.category}</span>
          {"\u00a0\u00a0"}
          <span className={s.title}>{product.title}</span>
        </div>
        {product.price != null && (
          <span className={s.price}>
            <Price amount={String(product.price)} currencyCode="AUD" />
          </span>
        )}
      </div>
    </Link>
  );
}
