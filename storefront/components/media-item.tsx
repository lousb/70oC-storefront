"use client";

import NextImage from "next/image";
import MuxPlayer from "@mux/mux-player-react";
import { urlForImage } from "../sanity/utils";

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
  video,
  alt = "",
  sizes = "100vw",
  priority = false,
}: MediaItemProps) {
  if (mediaType === "video" && video?.playbackId) {
    // fallback aspect ratio
    let aspectRatio = video.aspectRatio || "16:9";
    const [w, h] = aspectRatio.split(":").map(Number);
    const paddingTop = (h / w) * 100; // % for padding-top trick

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%", // reserves space
          overflow: "hidden",
        }}
      >
        <MuxPlayer
          playbackId={video.playbackId}
          autoPlay="muted"
          streamType="on-demand"
          loop
          playsInline
          controls={false}
          poster={`https://image.mux.com/${video.playbackId}/thumbnail.png?time=0`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    );
  }

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