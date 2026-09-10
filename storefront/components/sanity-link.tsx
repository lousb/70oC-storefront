import { Link } from 'next-view-transitions'
import { LinkFieldsType } from "../data/sanity/queries";

export default function SanityLink({
  children,
  link,
}: {
  children: React.ReactNode;
  link: LinkFieldsType;
}) {
  return (
    <>
      {link.linkType === "href" ? (
        <a
          href={link?.url || "#"}
          target={link.openInNewTab ? "_blank" : "_self"}
        >
          {children}
          {" ↗"}
        </a>
      ) : (
        <Link
          href={link?.url || "#"}
          target={link.openInNewTab ? "_blank" : "_self"}
        >
          {children}
        </Link>
      )}
    </>
  );
}
