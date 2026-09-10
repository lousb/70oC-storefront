"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren } from "react";

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

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
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
