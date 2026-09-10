import SanityLink from "./sanity-link";
import Newsletter from "./newsletter";
import FooterIconRow from "./footer-icon-row";
import { sanityFetch } from "../data/sanity";
import { SETTINGS_QUERY } from "../data/sanity/queries";
import s from "./footer.module.css";

// Info links are 4 fixed, named fields in the schema (not a repeater), so
// we always know their labels even before an editor fills in the actual
// link — unlike Shop/Connect, which are free-form lists with no fixed
// labels to fall back on.
const INFO_LINK_LABELS = {
  stockists: "Stockists",
  shippingAndReturns: "Shipping and Returns",
  termsAndConditions: "Terms & Conditions",
  privacyPolicy: "Privacy Policy",
} as const;

// Number of placeholder rows to show for a free-form list column when
// Sanity has no links yet, so the grid still previews at roughly the
// right proportions (matches the counts in the Set-Up-Components mockup).
const SHOP_PLACEHOLDER_COUNT = 6;
const CONNECT_PLACEHOLDER_COUNT = 4;

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className={s.placeholder}>{children}</span>;
}

export async function Footer() {
  const { data: settings } = await sanityFetch({
    query: SETTINGS_QUERY,
  });

  const footer = settings?.footer;
  const shopLinks = footer?.shopLinks ?? [];
  const infoLinks = footer?.infoLinks;
  const connectLinks = footer?.connectLinks ?? [];

  return (
    <footer className={s.footer}>
      <FooterIconRow />

      <div className={`${s.section} ${s.shop}`}>
        <h4 className={s.label}>Shop</h4>
        <ul role="list" className={s.list}>
          {shopLinks.length > 0
            ? shopLinks.map((link) => (
                <li key={link._key}>
                  <SanityLink link={link}>{link.label}</SanityLink>
                </li>
              ))
            : Array.from({ length: SHOP_PLACEHOLDER_COUNT }).map((_, i) => (
                <li key={i}>
                  <Placeholder>Shop link</Placeholder>
                </li>
              ))}
        </ul>
      </div>

      <div className={`${s.section} ${s.info}`}>
        <h4 className={s.label}>Information</h4>
        <ul role="list" className={s.list}>
          {(Object.keys(INFO_LINK_LABELS) as Array<keyof typeof INFO_LINK_LABELS>).map(
            (key) => {
              const link = infoLinks?.[key];
              return (
                <li key={key}>
                  {link ? (
                    <SanityLink link={link}>{link.label ?? INFO_LINK_LABELS[key]}</SanityLink>
                  ) : (
                    <Placeholder>{INFO_LINK_LABELS[key]}</Placeholder>
                  )}
                </li>
              );
            },
          )}
        </ul>
      </div>

      <div className={`${s.section} ${s.connect}`}>
        <h4 className={s.label}>Connect</h4>
        <ul role="list" className={s.list}>
          {connectLinks.length > 0
            ? connectLinks.map((link) => (
                <li key={link._key}>
                  <SanityLink link={link}>{link.label}</SanityLink>
                </li>
              ))
            : Array.from({ length: CONNECT_PLACEHOLDER_COUNT }).map((_, i) => (
                <li key={i}>
                  <Placeholder>Connect link</Placeholder>
                </li>
              ))}
        </ul>
      </div>

      <div className={`${s.section} ${s.newsletter}`}>
        <Newsletter />
      </div>
    </footer>
  );
}
