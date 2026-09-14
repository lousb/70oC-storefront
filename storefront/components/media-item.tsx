"use client";

import NextImage from "next/image";
import { urlForImage } from "../sanity/utils";

// Video (Mux) support has been removed — mediaType/video are still accepted
// here so existing call sites don't need to change, but only "image" ever
// renders anything now.
type MediaItemProps = {
  mediaType: "image" | "video";
  image?: {
    asset?: any;
    crop?: any;
    hotspot?: any;
    alt?: string;
  };
  video?: {
    playbackId: string;
    aspectRatio?: string; // e.g. "16:9" or "4:3"
  };
  alt?: string;
  sizes?: string;
  priority?: boolean;
};

export function MediaItem({
  mediaType,
  image,
  alt = "",
  sizes = "100vw",
  priority = false,
}: MediaItemProps) {
  if (mediaType === "image" && image) {
    const src = urlForImage(image)?.url();
    if (!src) return null;
    return (
      <NextImage
        src={src}
        fill
        alt={image.alt || alt}
        style={{ objectFit: "cover" }}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return null;
}
