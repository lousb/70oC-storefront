"use client";

import { useState } from "react";
import { Product, ProductVariant } from "../../shopify/types";
import { useProduct } from "../products/[slug]/product-context";
import { useCart } from "./cart-context";
import s from "../products/[slug]/page.module.css";

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale, priceRange } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [added, setAdded] = useState(false);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find((v) => v.id === selectedVariantId)!;

  const price = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: priceRange.minVariantPrice.currencyCode,
  }).format(Number(priceRange.minVariantPrice.amount));

  const handleAdd = () => {
    if (!finalVariant || !availableForSale) return;
    addCartItem(finalVariant, product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
        aria-label={added ? "Added" : label}
      >
        {/* Price left */}
        <span
          style={{
            position: "relative",
            overflow: "hidden",
            height: "1.2em",
            display: "inline-block",
          }}
        >
          <span
            style={{
              display: "block",
              transform: added ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 0.25s ease",
            }}
          >
            {price}
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

        {/* Label right — slides up on added */}
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
        </span>
      </button>
    </form>
  );
}
