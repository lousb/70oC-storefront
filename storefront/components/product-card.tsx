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
      </div>
      <div className={s.caption}>
        {/* "Title  Category 001": two non-breaking spaces between the
            title and the anchor, one between category and index. */}
        <div className={s.captionLeft}>
          <span className={s.title}>{product.title}</span>
          {"\u00a0\u00a0"}
          <span className={s.category}>{product.category}</span>{" "}
          <span className={s.index}>{product.index}</span>
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
