"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Footer itself is a Server Component (it does its own sanityFetch), so it
// can't be imported and rendered directly from here — importing a server
// component's module into a "use client" file pulls its server-only
// dependencies into the client bundle and crashes the build. Instead the
// already-rendered <Footer/> is passed down from layout.tsx (a Server
// Component) as a plain prop, and this just decides whether to show it.
//
// The home page renders its own <Footer/> as the final section of its
// scroll-snap sequence (see app/page.tsx) rather than picking up this
// global one — so it's excluded here to avoid a second, redundant footer.
// Studio is its own app shell and never wants the storefront footer.
export function ConditionalFooter({ footer }: { footer: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/studio")) {
    return null;
  }

  return <>{footer}</>;
}
