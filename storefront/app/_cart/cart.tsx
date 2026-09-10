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
import s from "./cart.module.css";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export function Cart() {
  const { cart, updateCartItem } = useCart();
  // Desktop keeps its own local open state (unchanged side-drawer
  // behaviour). Mobile is driven by the shared MobilePanelProvider so
  // the corner triggers rendered in header-content.tsx ("Cart (n)" /
  // "Close", and "Menu" for cross-navigation) can open/close it and
  // switch straight to the Menu panel — see mobile-panel-context.tsx.
  const { activePanel, close: closeMobilePanel } = useMobilePanel();
  const [desktopOpen, setDesktopOpen] = useState(false);
  const isMobileCartOpen = activePanel === "cart";
  const isOpen = desktopOpen || isMobileCartOpen;

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
    if (cart) saveCart(cart);
  }, [cart]);

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

      {isOpen &&
        createPortal(
        <>
          <div className={`${s.overlay} ${s.desktopOnly}`} onClick={closeCart} aria-hidden="true" />

          <aside className={s.cart} role="dialog" aria-label="Shopping cart" aria-modal="true">
            <div className={`${s.cartHeader} ${s.desktopOnly}`}>
              <span className={s.cartTitle}>
                {cart?.totalQuantity ? `(${cart.totalQuantity})` : "Cart"}
              </span>
              <button className={s.closeButton} onClick={closeCart} aria-label="Close cart">×</button>
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
                        `/product/${item.merchandise.product.handle}`,
                        new URLSearchParams(merchandiseSearchParams),
                      );
                      const cartImage = item.merchandise.variantImage ?? item.merchandise.product.featuredImage;
                      const hasVariant = item.merchandise.title !== DEFAULT_OPTION;

                      return (
                        <li key={i} className={s.cartItem}>
                          <Link href={merchandiseUrl} onClick={closeCart} className={s.itemImageLink}>
                            <Image
                              width={80} height={80}
                              alt={cartImage.altText || item.merchandise.product.title}
                              src={cartImage.url}
                              className={s.itemImage}
                            />
                          </Link>

                          {/* Desktop layout — unchanged */}
                          <div className={`${s.itemInfo} ${s.desktopOnly}`}>
                            <Link href={merchandiseUrl} onClick={closeCart} className={s.itemTitle}>
                              {item.merchandise.product.title}
                            </Link>
                            {hasVariant && (
                              <p className={s.itemVariant}>{item.merchandise.title}</p>
                            )}
                            <Price amount={item.cost.totalAmount.amount} currencyCode={item.cost.totalAmount.currencyCode} />
                          </div>
                          <div className={`${s.itemControls} ${s.desktopOnly}`}>
                            <div className={s.quantityRow}>
                              <EditItemQuantityButton item={item} type="minus" optimisticUpdate={updateCartItem} />
                              <span className={s.quantity}>{item.quantity}</span>
                              <EditItemQuantityButton item={item} type="plus" optimisticUpdate={updateCartItem} />
                            </div>
                            <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                          </div>

                          {/* Mobile layout — full-width row: title +
                              variant/price meta line, "Remove" below.
                              No quantity stepper (not in the reference). */}
                          <div className={`${s.itemInfoMobile} ${s.mobileOnly}`}>
                            <div className={s.itemMobileTopLine}>
                              <Link href={merchandiseUrl} onClick={closeCart} className={s.itemTitle}>
                                {item.merchandise.product.title}
                              </Link>
                              {hasVariant && (
                                <span className={s.itemVariant}>{item.merchandise.title}</span>
                              )}
                              <span className={s.itemPriceMobile}>
                                <Price amount={item.cost.totalAmount.amount} currencyCode={item.cost.totalAmount.currencyCode} />
                              </span>
                            </div>
                            <DeleteItemButton item={item} optimisticUpdate={updateCartItem} />
                          </div>
                        </li>
                      );
                    })}
                </ul>

                <div className={`${s.cartFooter} ${s.desktopOnly}`}>
                  <div className={s.totalRow}>
                    <span>Total</span>
                    <Price amount={cart.cost.totalAmount.amount} currencyCode={cart.cost.totalAmount.currencyCode} />
                  </div>
                  <p className={s.shippingNote}>Shipping calculated at checkout</p>
                  <form action={() => { redirectToCheckout(cart); }}>
                    <CheckoutButton />
                  </form>
                </div>

                <form
                  action={() => { redirectToCheckout(cart); }}
                  className={`${s.mobileCheckoutRow} ${s.mobileOnly}`}
                >
                  <MobileCheckoutButton />
                  <span className={s.mobileCheckoutTotal}>
                    <Price amount={cart.cost.totalAmount.amount} currencyCode={cart.cost.totalAmount.currencyCode} />
                  </span>
                </form>
              </div>
            )}
          </aside>
        </>,
        document.body,
        )}
    </>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={s.checkoutButton} data-pending={pending}>
      {pending ? "Redirecting…" : "Proceed to Checkout"}
    </button>
  );
}

function MobileCheckoutButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={s.mobileCheckoutButton} data-pending={pending}>
      {pending ? "Redirecting…" : "Checkout"}
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
