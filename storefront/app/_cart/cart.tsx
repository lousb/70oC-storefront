"use client";

import Image from "next/image";
import { Link } from 'next-view-transitions'
import { useEffect, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import Price from "../../components/price";
import { useMobilePanel } from "../../components/mobile-panel-context";
import { DEFAULT_OPTION } from "../../shopify/constants";
import { CartItem } from "../../shopify/types";
import { createUrl } from "../../shopify/utils";
import { redirectToCheckout, saveCart } from "./cart-actions";
import { useCart } from "./cart-context";
import { useProductAnchors } from "./product-anchors";
import s from "./cart.module.css";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export function Cart() {
  const { cart, updateCartItem, hydrated } = useCart();
  const productAnchors = useProductAnchors();
  // Desktop keeps its own local open state (unchanged side-drawer
  // behaviour). Mobile is driven by the shared MobilePanelProvider so
  // the corner triggers rendered in header-content.tsx ("Cart (n)" /
  // "Close", and "Menu" for cross-navigation) can open/close it and
  // switch straight to the Menu panel — see mobile-panel-context.tsx.
  const { activePanel, close: closeMobilePanel } = useMobilePanel();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const isMobileCartOpen = activePanel === "cart";
  const isOpen = desktopOpen || isMobileCartOpen;

  // Keeps the drawer mounted through its slide-out, and flips
  // data-state a frame after mount so the slide-in transition runs.
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setShown(false);
    const t = setTimeout(() => setRendered(false), 400);
    return () => clearTimeout(t);
  }, [isOpen]);

  const openCart = () => setDesktopOpen(true);
  const closeCart = () => {
    setDesktopOpen(false);
    if (isMobileCartOpen) closeMobilePanel();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeCart();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Body-scroll lock for the desktop drawer. The mobile takeover's lock
  // is handled centrally in MobilePanelProvider (keyed off activePanel),
  // so this only needs to react to the desktop-local state.
  useEffect(() => {
    if (desktopOpen) {
      document.body.style.overflow = "hidden";
    } else if (!isMobileCartOpen) {
      document.body.style.overflow = "";
    }
    return () => {
      if (!isMobileCartOpen) document.body.style.overflow = "";
    };
  }, [desktopOpen, isMobileCartOpen]);

  useEffect(() => {
    if (cart && hydrated) saveCart(cart);
  }, [cart, hydrated]);

  return (
    <>
      {/* Desktop-only trigger — lives in the nav stack (header-content's
          DesktopNav). The mobile "Cart (n)" / "Close" trigger is a
          separate, always-mounted button in header-content.tsx (its
          click drives the shared MobilePanelProvider instead of this
          local state), so nothing mobile-specific renders here. */}
      <button
        aria-label={isOpen ? "Close cart" : "Open cart"}
        onClick={isOpen ? closeCart : openCart}
        className={`${s.cartButton} ${s.desktopOnly}`}
        data-open={isOpen}
      >
        <span className={s.cartLabel}>
          {isOpen ? "Close" : `Cart (${cart?.totalQuantity ?? 0})`}
        </span>
      </button>

      {rendered &&
        createPortal(
        <>
          {/* Clicking off the drawer (this backdrop) is how it closes on
              desktop - no close button in the drawer itself. */}
          <div
            className={`${s.overlay} ${s.desktopOnly}`}
            data-state={shown ? "open" : "closed"}
            onClick={closeCart}
            aria-hidden="true"
          />

          <aside
            className={s.cart}
            data-cart-drawer
            data-state={shown ? "open" : "closed"}
            role="dialog"
            aria-label="Shopping cart"
            aria-modal="true"
          >
            {/* Desktop: "Cart (n)" left, "Close" right, on the site
                header's top line (Set-Up-Components/Cart). */}
            <div className={s.cartHeader}>
              <span className={s.cartTitle}>
                Cart ({cart?.totalQuantity ?? 0})
              </span>
              <button
                type="button"
                className={s.closeButton}
                onClick={closeCart}
              >
                Close
              </button>
            </div>

            {!cart || cart.lines.length === 0 ? (
              <div className={s.emptyState}><p>Your cart is empty.</p></div>
            ) : (
              <div className={s.cartBody}>
                <ul className={s.itemList}>
                  {cart.lines
                    .sort((a, b) => a.merchandise.product.title.localeCompare(b.merchandise.product.title))
                    .map((item, i) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;
                      item.merchandise.selectedOptions.forEach(({ name, value }) => {
                        if (value !== DEFAULT_OPTION) merchandiseSearchParams[name.toLowerCase()] = value;
                      });
                      const merchandiseUrl = createUrl(
                        `/products/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams),
                      );
                      const cartImage = item.merchandise.variantImage ?? item.merchandise.product.featuredImage;
                      const hasVariant = item.merchandise.title !== DEFAULT_OPTION;
                      const anchor = productAnchors[item.merchandise.product.handle];
                      // Product line: Shopify title, plus the variant and
                      // a quantity when they apply (the reference has no
                      // stepper, so quantity is shown rather than edited).
                      const productLine = [
                        item.merchandise.product.title,
                        hasVariant ? item.merchandise.title : null,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <li key={i} className={s.cartItem}>
                          <Link href={merchandiseUrl} onClick={closeCart} className={s.itemImageLink}>
                            {/* Title/price-only products (no image uploaded
                                in Shopify yet) show a flat placeholder box
                                instead of crashing on a missing image. */}
                            {cartImage?.url ? (
                              <Image
                                width={80} height={80}
                                alt={cartImage.altText || item.merchandise.product.title}
                                src={cartImage.url}
                                className={s.itemImage}
                              />
                            ) : (
                              <div className={s.itemImage} style={{ backgroundColor: "#f1f1f1" }} />
                            )}
                          </Link>

                          {/* "Pressure 001" + price, product title,
                              "Remove" - same on desktop and mobile
                              (Set-Up-Components/Cart). */}
                          <div className={s.itemInfo}>
                            <div className={s.itemTopLine}>
                              <span className={s.itemAnchor}>
                                {anchor ? (
                                  <>
                                    {anchor.anchor}
                                    {anchor.index && (
                                      <span className={s.itemIndex}>{anchor.index}</span>
                                    )}
                                  </>
                                ) : (
                                  <Link href={merchandiseUrl} onClick={closeCart} className={s.itemTitle}>
                                    {productLine}
                                  </Link>
                                )}
                              </span>
                              <span className={s.itemPrice}>
                                {formatMoney(item.cost.totalAmount.amount, item.cost.totalAmount.currencyCode)}
                              </span>
                            </div>
                            {anchor && (
                              <Link href={merchandiseUrl} onClick={closeCart} className={s.itemTitle}>
                                {productLine}
                                {item.quantity > 1 && ` \u00d7 ${item.quantity}`}
                              </Link>
                            )}
                            <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                          </div>

                        </li>
                      );
                    })}
                </ul>

                <div className={s.cartFooter}>
                  <p className={s.shippingNote}>Shipping &amp; taxes calculated at checkout.</p>
                  <form action={() => { redirectToCheckout(cart); }}>
                    <CheckoutButton
                      total={formatTotal(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                    />
                  </form>
                </div>

              </div>
            )}
          </aside>
        </>,
        document.body,
        )}
    </>
  );
}

// "$180 AUD" - symbol amount plus the visible currency code, per the
// reference's checkout bar.
function formatTotal(amount: string, currencyCode: string) {
  return `${formatMoney(amount, currencyCode)} ${currencyCode}`;
}

// "$90" rather than "$90.00" - cents only when there are any, per the
// reference.
function formatMoney(amount: string, currencyCode: string) {
  const value = parseFloat(amount);
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function CheckoutButton({ total }: { total: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={s.checkoutButton} data-pending={pending}>
      <span>{pending ? "Redirecting…" : "Checkout"}</span>
      <span>{total}</span>
    </button>
  );
}


function DeleteItemButton({ item, optimisticUpdate }: { item: CartItem; optimisticUpdate: any }) {
  return (
    <form action={() => { optimisticUpdate(item.merchandise.id, "delete"); }}>
      <button type="submit" aria-label="Remove cart item" className={s.removeButton}>Remove</button>
    </form>
  );
}

function EditItemQuantityButton({ item, type, optimisticUpdate }: { item: CartItem; type: "plus" | "minus"; optimisticUpdate: any }) {
  const merchandiseId = item.merchandise.id;
  const quantity = type === "plus" ? item.quantity + 1 : item.quantity - 1;
  const label = type === "plus" ? "Increase item quantity" : "Reduce item quantity";
  return (
    <form action={() => { optimisticUpdate(merchandiseId, type); }}>
      <button type="submit" aria-label={label} className={s.qtyButton}>
        {type === "plus" ? "+" : "−"}
      </button>
    </form>
  );
}
