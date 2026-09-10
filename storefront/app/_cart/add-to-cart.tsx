"use client";

import { useState } from "react";
import { Product, ProductVariant } from "../../shopify/types";
import { useProduct } from "../products/[slug]/product-context";
import { useCart } from "./cart-context";

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
    ? "Unavailable"
    : !selectedVariantId
    ? "Select an option"
    : added
    ? "Added"
    : "Add to Cart";

  return (
    <form action={handleAdd}>
      <button

        className="add-to-cart"
        type="submit"
        disabled={disabled}
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          background: disabled ? "#888" : "black",
          color: "white",
          border: "none",
          padding: "0.85rem 1rem",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "0.85rem",
          letterSpacing: "0.04em",
          transition: "background 0.2s ease",
          overflow: "hidden",
          position: "relative",
          borderRadius: "4px",
          marginBlock: "1rem",
        }}
      >
        {/* Price left */}
        <span
          style={{
            opacity: added ? 0 : 1,
            transform: added ? "translateY(-100%)" : "translateY(0)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            display: "inline-block",
          }}
        >
          {price}
        </span>
        <span
            style={{
              display: "block",
              position: "absolute",
              top: "100%",
              left: '0.85rem',
              transform: added ? "translateY(-175%)" : "translateY(0)",
              transition: "transform 0.25s ease",
            }}
          >
            Added
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
            {!availableForSale ? "Sold Out" : !selectedVariantId ? "Select option" : "Add to Cart"}
          </span>
          
        </span>
      </button>
    </form>
  );
}