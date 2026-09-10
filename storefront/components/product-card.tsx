import s from "./product-card.module.css";

export type DemoProduct = {
  id: string;
  index: string;
  category: string;
  title: string;
  price: string;
  color: string;
};

// Demo card: no real Shopify product wired up yet, so the cover is a
// flat tonal placeholder and the title falls back to "Title" (the
// Sanity field name) rather than any invented product copy.
export function ProductCard({ product }: { product: DemoProduct }) {
  return (
    <article className={s.card}>
      <div className={s.cover} style={{ backgroundColor: product.color }} />
      <div className={s.caption}>
        <div className={s.captionLeft}>
          <span className={s.index}>{product.index}</span>
          <span className={s.category}>{product.category}</span>
          <span className={s.title}>{product.title}</span>
        </div>
        <span className={s.price}>{product.price}</span>
      </div>
    </article>
  );
}
