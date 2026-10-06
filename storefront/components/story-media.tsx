import NextImage from "next/image";
import { MediaItem } from "./media-item";
import { urlForImage } from "../sanity/utils";

// One piece of story media at its NATIVE aspect ratio. The width is
// whatever the parent grid cell gives it; height follows the image's own
// proportions (crop-adjusted when an editor has cropped it in Studio).
// Videos use the Mux aspect ratio.

export type StoryMediaValue = {
  mediaType?: "image" | "video";
  image?: {
    asset?: any;
    crop?: { top: number; bottom: number; left: number; right: number } | null;
    hotspot?: any;
    alt?: string | null;
    lqip?: string | null;
    dimensions?: { width: number; height: number; aspectRatio?: number } | null;
  } | null;
  video?: { playbackId: string; aspectRatio?: string | null } | null;
} | null;

export function mediaAspect(media: StoryMediaValue): number | null {
  if (!media) return null;
  if (media.mediaType === "video" && media.video?.playbackId) {
    const [w, h] = (media.video.aspectRatio || "16:9").split(":").map(Number);
    return w && h ? w / h : 16 / 9;
  }
  const d = media.image?.dimensions;
  if (!d?.width || !d?.height) return null;
  const c = media.image?.crop;
  const w = d.width * (1 - (c?.left ?? 0) - (c?.right ?? 0));
  const h = d.height * (1 - (c?.top ?? 0) - (c?.bottom ?? 0));
  return w / h;
}

export function StoryMedia({
  media,
  sizes,
  priority = false,
  className,
}: {
  media: StoryMediaValue;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!media) return null;
  const aspect = mediaAspect(media) ?? 4 / 5;

  if (media.mediaType === "video" && media.video?.playbackId) {
    return (
      <div className={className} style={{ position: "relative", aspectRatio: String(aspect) }}>
        <MediaItem mediaType="video" video={media.video as any} sizes={sizes} />
      </div>
    );
  }

  const src = media.image ? urlForImage(media.image)?.url() : undefined;
  if (!src) return null;
  // Intrinsic size only needs the right RATIO - CSS sets the real
  // rendered size (width: 100%, height: auto unless overridden).
  const width = 2000;
  const height = Math.round(width / aspect);

  return (
    <NextImage
      className={className}
      src={src}
      width={width}
      height={height}
      alt={media.image?.alt || ""}
      sizes={sizes}
      priority={priority}
      placeholder={media.image?.lqip ? "blur" : "empty"}
      blurDataURL={media.image?.lqip || undefined}
      style={{ display: "block", width: "100%", height: "auto" }}
    />
  );
}
