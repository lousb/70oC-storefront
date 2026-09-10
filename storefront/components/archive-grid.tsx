"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PostCard } from "./post-card";

gsap.registerPlugin(ScrollTrigger);

type Post = {
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

export function ArchiveGrid({ posts }: { posts: Post[] }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const mediaEls = gridRef.current.querySelectorAll<HTMLElement>("[data-parallax]");

    const tweens = Array.from(mediaEls).map((el) =>
      gsap.fromTo(
        el,
        { y: 40 },
        {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement!, // the overflow:hidden wrapper
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      )
    );

    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [posts]);

  return (
    <div
      ref={gridRef}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
      }}
    >
      {posts?.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}