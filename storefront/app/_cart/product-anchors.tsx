"use client";

import { createContext, useContext, type ReactNode } from "react";

// Shopify cart lines only know the Shopify title/handle - the anchor
// ("Pressure") and its within-anchor number ("001") live in Sanity. The
// root layout's <Header> fetches them once (ALL_PRODUCTS_QUERY) and hands
// them down as a handle -> { anchor, index } map so the cart can show
// "Pressure 001" above each title, matching Set-Up-Components/Cart.
export type ProductAnchor = { anchor: string; index: string };
export type ProductAnchorMap = Record<string, ProductAnchor>;

const ProductAnchorsContext = createContext<ProductAnchorMap>({});

export function ProductAnchorsProvider({
  value,
  children,
}: {
  value: ProductAnchorMap;
  children: ReactNode;
}) {
  return (
    <ProductAnchorsContext.Provider value={value}>
      {children}
    </ProductAnchorsContext.Provider>
  );
}

export function useProductAnchors() {
  return useContext(ProductAnchorsContext);
}
