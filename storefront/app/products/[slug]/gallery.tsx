"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MediaItem } from "../../../components/media-item";
import s from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

type SanityGalleryItem = {
  mediaType: "image" | "video" | null;
  image?: any;
  video?: { playbackId: string; aspectRatio?: string } | null;
  featuredHover?: boolean;
};

export function Gallery({
  sanityGallery = [],
}: {
  variants?: any[];
  sanityGallery?: SanityGalleryItem[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  // Desktop: which stacked image is currently most in view, for the
  // right-aligned scroll-position dots (see .desktopDots below). The stack
  // just scrolls in normal page flow on desktop (there's no "selected
  // slide" API to hook into like Embla gives the mobile carousel), so this
  // tracks it the way a reading-progress indicator would: one
  // IntersectionObserver watching every stacked image, picking whichever
  // one currently covers the most of the viewport as "active".
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const stackItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stackRatios = useRef<Map<number, number>>(new Map());
  const galleryStackRef = useRef<HTMLDivElement>(null);
  const dotsBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = stackItemRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          stackRatios.current.set(index, entry.intersectionRatio);
        }
        let bestIndex = 0;
        let bestRatio = -1;
        stackRatios.current.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });
        setActiveStackIndex(bestIndex);
      },
      // Enough steps to update smoothly as each (tall, aspect-ratio: 4/5)
      // stacked image scrolls past.
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sanityGallery.length]);

  // Pin the dots for exactly the same scroll distance product-section.tsx
  // pins .productDetails/.floatingIconBox for, so it docks (releases back
  // to static flow) at the same moment they do - right before the footer,
  // instead of staying fixed on over it. This can't share that
  // ScrollTrigger directly (this component has no ref to .page, the
  // element it's triggered off), but .galleryStack has the same top and
  // bottom edges .page does - it's what makes .page as tall as it is (see
  // .galleryColumn's own comments) - so "top top"/"bottom bottom" against
  // it lands on the identical start/end. Desktop only, matching
  // product-section.tsx's own breakpoint.
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      if (!galleryStackRef.current || !dotsBoxRef.current) return;

      const st = ScrollTrigger.create({
        trigger: galleryStackRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: dotsBoxRef.current,
      });

      return () => st.kill();
    });

    return () => mm.revert();
  }, [sanityGallery.length]);

  const scrollStackItemIntoView = (index: number) => {
    stackItemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // The Shopify featured image is not used here — Sanity's gallery (edited
  // per-product in Studio) is the sole source for on-page media, with the
  // first item doubling as the product's listing/tile image elsewhere on
  // the site (see product.tsx's gallery field description).
  const allItems = sanityGallery.map((item, i) => ({
    key: `sanity-${i}`,
    content: (
      <div className={s.galleryItem}>
        {item.mediaType && (
          <MediaItem
            mediaType={item.mediaType}
            image={item.image}
            video={item.video ?? undefined}
            sizes="50vw"
          />
        )}
      </div>
    ),
  }));

  return (
    <>
      {/* Desktop: vertical stack */}
      <div className={s.galleryStack} ref={galleryStackRef}>
        {allItems.map(({ key, content }, i) => (
          <div
            key={key}
            ref={(el) => {
              stackItemRefs.current[i] = el;
            }}
            data-index={i}
          >
            {content}
          </div>
        ))}
      </div>

      {/* Desktop: right-aligned vertical dots tracking scroll position
          through the stack above (see the IntersectionObserver above) -
          hidden on mobile, which has its own dots on the carousel below. */}
      {allItems.length > 1 && (
        <div className={s.desktopDots} ref={dotsBoxRef}>
          {allItems.map((_, i) => (
            <button
              key={i}
              className={`${s.desktopDot} ${i === activeStackIndex ? s.desktopDotActive : ""}`}
              onClick={() => scrollStackItemIntoView(i)}
              aria-label={`Scroll to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile: full-bleed Embla carousel */}
      <div className={s.galleryCarousel}>
  <div className={s.galleryCarouselViewport} ref={emblaRef}>
    <div className={s.galleryCarouselTrack}>
      {allItems.map(({ key, content }) => (
        <div key={key} className={s.galleryCarouselSlide}>
          {content}
        </div>
      ))}
    </div>
    <div className={s.dots}>
      {allItems.map((_, i) => (
        <button
          key={i}
          className={`${s.dot} ${i === selectedIndex ? s.dotActive : ""}`}
          onClick={() => emblaApi?.scrollTo(i)}
          aria-label={`Go to image ${i + 1}`}
        />
      ))}
    </div>
  </div>
</div>
    </>
  );
}