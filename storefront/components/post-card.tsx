"use client";

import { useRef, useEffect } from "react";
import { Link } from "next-view-transitions";
import { MediaItem } from "./media-item";
import gsap from "gsap";

type PostCardProps = {
  post: {
    _id: string;
    title: string;
    slug: string;
    date: string;
    excerpt?: string;
    cover?: {
      mediaType: "image" | "video";
      image?: any;
      video?: { playbackId: string; aspectRatio?: string };
    };
  };
};

export function PostCard({ post }: PostCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const media = mediaRef.current;
    if (!card || !media) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      gsap.to(media, { x: x * 14, duration: 0.6, ease: "power2.out" });
    };

    const handleMouseEnter = () => {
      gsap.to(media, { scale: 1.08, duration: 0.5, ease: "power3.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(media, { scale: 1, x: 0, duration: 0.6, ease: "power3.out" });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Link href={`/archive/${post.slug}`} style={{ display: "block" }}>
      <div ref={cardRef} style={{ cursor: "pointer" }}>
        {post.cover && (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4/5",
              overflow: "hidden",
              marginBottom: "0.5rem",
            }}
          >
            <div
              ref={mediaRef}
              data-parallax  // targeted by ArchiveGrid's ScrollTrigger
              style={{
                position: "absolute",
                inset: "-12%",
                willChange: "transform",
              }}
            >
              <MediaItem
                mediaType={post.cover.mediaType}
                image={post.cover.image}
                video={post.cover.video}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
        )}

        <p style={{ margin: 0 }}>{post.title}</p>
        <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem", opacity: 0.5 }}>
          {new Date(post.date).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}