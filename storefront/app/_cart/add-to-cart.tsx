"use client";

import { useState } from "react";
import { Product, ProductVariant } from "../../shopify/types";
import { useProduct } from "../products/[slug]/product-context";
import { useCart } from "./cart-context";
import s from "../products/[slug]/page.module.css";

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [added, setAdded] = useState(false);
  // Separate, shorter flag for the ::after tick (.addToCart[data-tick]) -
  // shows for 1s, while the "Added" label keeps its own 2s.
  const [tick, setTick] = useState(false);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find((v) => v.id === selectedVariantId)!;

  const handleAdd = () => {
    if (!finalVariant || !availableForSale) return;
    addCartItem(finalVariant, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setTick(true);
    setTimeout(() => setTick(false), 1000);
  };

  const disabled = !availableForSale || !selectedVariantId;
  const label = !availableForSale
    ? "Sold Out"
    : !selectedVariantId
    ? "Select option"
    : "Add to Cart";

  return (
    <form action={handleAdd}>
      <button
        className={s.addToCart}
        type="submit"
        disabled={disabled}
        data-tick={tick || undefined}
        aria-label={added ? "Added" : label}
      >
        {/* Label — slides up to "Added" on add. No price here; it's
            already shown up top next to the title (.priceTop) on desktop,
            and the button's own price used to just duplicate it. */}
        <span style={{ position: "relative", height: "1.2em", overflow: "hidden", display: "inline-block" }}>
          <span
            style={{
              display: "block",
              transform: added ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 0.25s ease",
            }}
          >
            {label}
          </span>
          <span
            style={{
              display: "block",
              position: "absolute",
              top: "100%",
              left: 0,
              transform: added ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 0.25s ease",
            }}
          >
            Added
          </span>
        </span>
      </button>
    </form>
  );
}
