"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../app/_cart/cart-context";
import { LocalCart } from "../app/_cart/local-cart";
import { LinkFieldsType } from "../data/sanity/queries";
import { useMobilePanel } from "./mobile-panel-context";
import SanityLink from "./sanity-link";
import s from "./header-content.module.css";

const DEFAULT_HEADER_DESCRIPTION =
  "70oC is a sensory-led brand grounded in quality and purpose.\nEach product is shaped by touch, scent, heat, and time.";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/archive", label: "Stories" },
];

// Info links are 4 fixed, named fields in the schema (not a repeater), so
// we always know their labels even before an editor fills in the actual
// link — matches the same fallback pattern used in components/footer.tsx.
const INFO_LINK_LABELS = {
  stockists: "Stockists",
  shippingAndReturns: "Shipping and Returns",
  termsAndConditions: "Terms & Conditions",
  privacyPolicy: "Privacy Policy",
} as const;

type InfoLinks =
  | Partial<Record<keyof typeof INFO_LINK_LABELS, LinkFieldsType | null>>
  | null
  | undefined;

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

// Sydney clock — ticks every second, timezone abbreviation (AEST/AEDT)
// comes straight from Intl so daylight saving is handled automatically.
function useSydneyClock() {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Sydney",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });

    const update = () => {
      const parts = formatter.formatToParts(new Date());
      const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
      const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
      // Intl gives "GMT+11" in some environments instead of "AEDT" — fall
      // back to the raw zone name either way, whatever the browser gives.
      const zone =
        parts.find((p) => p.type === "timeZoneName")?.value ?? "";
      setDisplay(`${hour}:${minute} ${zone}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return display;
}

// Sydney temperature via Open-Meteo (free, no API key). Refreshed every
// 10 minutes; failures just leave the last good reading in place.
function useSydneyTemperature() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTemp = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-33.8688&longitude=151.2093&current=temperature_2m",
        );
        const data = await res.json();
        const value = data?.current?.temperature_2m;
        if (!cancelled && typeof value === "number") {
          setTemp(Math.round(value));
        }
      } catch {
        // keep the last known reading
      }
    };

    fetchTemp();
    const interval = setInterval(fetchTemp, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return temp;
}

function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className={s.navStack} aria-label="Main">
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={s.navLink}
          data-active={isLinkActive(pathname, href)}
        >
          {label}
        </Link>
      ))}
      <LocalCart />
    </nav>
  );
}

// ---- mobile: full-screen "Menu" takeover, portaled to document.body ----
// (outside .layer's blended subtree — see header-content.module.css — so
// it paints as a normal opaque white panel, not inverted along with the
// header text).
function MobileMenuPanel({
  pathname,
  description,
  infoLinks,
}: {
  pathname: string;
  description: string;
  infoLinks: InfoLinks;
}) {
  const clockDisplay = useSydneyClock();
  const temp = useSydneyTemperature();

  return (
    <div
      className={s.menuPanel}
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
    >
      <nav className={s.menuNav} aria-label="Main">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={s.menuNavLink}
            data-active={isLinkActive(pathname, href)}
          >
            {label}
          </Link>
        ))}
      </nav>

      <p className={s.menuDescription}>{description}</p>

      <ul className={s.menuInfoLinks} role="list">
        {(
          Object.keys(INFO_LINK_LABELS) as Array<
            keyof typeof INFO_LINK_LABELS
          >
        ).map((key) => {
          const link = infoLinks?.[key];
          return (
            <li key={key}>
              {link ? (
                <SanityLink link={link}>
                  {link.label ?? INFO_LINK_LABELS[key]}
                </SanityLink>
              ) : (
                INFO_LINK_LABELS[key]
              )}
            </li>
          );
        })}
      </ul>

      <div className={s.menuMeta}>
        <p className={s.menuClock}>{clockDisplay ?? " "}</p>
        <p className={s.menuWeather}>
          {temp === null ? " " : `Temperature ${temp}°C`}
        </p>
      </div>
    </div>
  );
}

// ---- mobile: the two persistent corner triggers ("Menu"/"Close" top
// left, "Cart (n)"/"Close" top right) that double as the open/close and
// cross-navigation controls for the Menu and Cart takeovers. These stay
// inside .layer (blended, always on top of whichever panel is open — see
// header-content.module.css) so they read as plain black text sitting on
// the open panel, exactly like the reference designs. ----
function MobileTriggers({
  description,
  infoLinks,
}: {
  description: string;
  infoLinks: InfoLinks;
}) {
  const pathname = usePathname();
  const { activePanel, openMenu, openCart, close } = useMobilePanel();
  const { cart } = useCart();

  // Close whichever panel is open on route change. (Body-scroll
  // locking for the shared mobile panels lives centrally in
  // MobilePanelProvider — see mobile-panel-context.tsx.)
  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isMenuOpen = activePanel === "menu";
  const isCartOpen = activePanel === "cart";
  const cartQuantity = cart?.totalQuantity ?? 0;

  return (
    <>
      <button
        type="button"
        className={s.mobileTriggerLeft}
        onClick={isMenuOpen ? close : openMenu}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? "Close" : "Menu"}
      </button>

      <button
        type="button"
        className={s.mobileTriggerRight}
        onClick={isCartOpen ? close : openCart}
        aria-expanded={isCartOpen}
        aria-label={isCartOpen ? "Close cart" : "Open cart"}
      >
        {isCartOpen ? "Close" : `Cart (${cartQuantity})`}
      </button>

      {isMenuOpen &&
        createPortal(
          <MobileMenuPanel
            pathname={pathname}
            description={description}
            infoLinks={infoLinks}
          />,
          document.body,
        )}
    </>
  );
}

function SydneyClock() {
  const display = useSydneyClock();
  return <p className={s.clock}>{display ?? " "}</p>;
}

function SydneyWeather() {
  const temp = useSydneyTemperature();
  return (
    <p className={s.weather}>
      {temp === null ? " " : `Temperature ${temp}°C`}
    </p>
  );
}

export function HeaderContent({
  headerDescription,
  footerInfoLinks,
}: {
  headerDescription?: string | null;
  footerInfoLinks?: InfoLinks;
}) {
  const description = headerDescription?.trim() || DEFAULT_HEADER_DESCRIPTION;

  return (
    <div className={s.layer} aria-hidden={false}>
      <p className={`${s.description} ${s.desktopOnly}`}>{description}</p>

      <div className={s.mobileOnly}>
        <MobileTriggers description={description} infoLinks={footerInfoLinks} />
      </div>

      <div className={s.desktopOnly}>
        <DesktopNav />
      </div>

      <div className={s.desktopOnly}>
        <SydneyClock />
      </div>
      <div className={s.desktopOnly}>
        <SydneyWeather />
      </div>
    </div>
  );
}
