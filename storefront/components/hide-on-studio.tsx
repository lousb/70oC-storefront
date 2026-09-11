"use client";

import { usePathname } from "next/navigation";

export function HideOnStudio({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

if (pathname === "/studio" || pathname?.startsWith("/studio/")) {
  return null;
}

return <>{children}</>;
}
