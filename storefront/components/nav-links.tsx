"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/archive", label: "Archive" },
];

export function NavLinks() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ display: "flex" }}>
      {links.map(({ href, label }, i) => {
        const isActive =
          isHome
            ? true
            : href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/");

        const isHovered = hovered === href;
        const opacity = isHovered ? 1 : isActive ? 1 : 0.35;

        return (
          <span
            key={href}
            onMouseEnter={() => setHovered(href)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              alignItems: "center",
              opacity,
              transition: "opacity 0.2s ease",
            }}
          >
            {/* <Link
              href={href}
              style={{
                textDecoration: "none",
              }}
            >
              {label}
            </Link>

            {i < links.length - 1 && (
              <span style={{ paddingRight: "0.1rem" }}>,</span>
            )} */}
          </span>
        );
      })}
    </div>
  );
}