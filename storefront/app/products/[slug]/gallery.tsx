"use client";
import NextImage from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { MediaItem } from "../../../components/media-item";
import { Image } from "../../../shopify/types";
import s from "./page.module.css";

type SanityGalleryItem = {
  mediaType: "image" | "video" | null;
  image?: any;
  video?: { playbackId: string; aspectRatio?: string } | null;
  featuredHover?: boolean;
};

export function Gallery({
  featuredImage,
  sanityGallery = [],
}: {
  variants?: any[];
  featuredImage: Image;
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

  const allItems = [
    {
      key: "featured",
      content: (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", backgroundColor: "#f1f1f1" }}>
          <NextImage
            src={featuredImage.url}
            fill
            alt={featuredImage.altText ?? ""}
            style={{ objectFit: "cover", mixBlendMode: "multiply" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      ),
    },
    ...sanityGallery.map((item, i) => ({
      key: `sanity-${i}`,
      content: (
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/5" }}>
          {item.mediaType && (
            <MediaItem
              mediaType={item.mediaType}
              image={item.image}
              video={item.video ?? undefined}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
      ),
    })),
  ];

  return (
    <>
      {/* Desktop: vertical stack */}
      <div className={s.galleryStack}>
        {allItems.map(({ key, content }) => (
          <div key={key}>{content}</div>
        ))}
      </div>

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