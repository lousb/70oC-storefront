"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren } from "react";
import { setLenis } from "./lenis-store";

// Fired on window right after the shared Lenis instance is created and
// registered in lenis-store, so components that mount before this
// provider's own effect runs (React fires child effects before parent
// effects, and this provider wraps the page content) can pick it up
// instead of racing getLenis() against a still-null store.
export const LENIS_READY_EVENT = "lenis:ready";

const LenisProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<Lenis | null>(null);

  const isStudio = pathname.startsWith("/studio");

  useEffect(() => {
    if (isStudio) return; // Skip initializing Lenis in Sanity Studio

    const lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    setLenis(lenis);
    window.dispatchEvent(new Event(LENIS_READY_EVENT));

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, [isStudio]);

  useEffect(() => {
    if (isStudio) return;

    const handleNavigation = () => {
      if (lenisRef.current) {
        lenisRef.current.stop();
      }
      window.scrollTo(0, 0);
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    };

    handleNavigation();
  }, [pathname, searchParams, isStudio]);

  return <>{children}</>;
};

export default LenisProvider;
