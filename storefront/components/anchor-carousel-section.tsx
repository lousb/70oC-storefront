"use client";

import { useState } from "react";
import NextImage from "next/image";
import { urlForImage } from "../sanity/utils";
import { LinkFieldsType } from "../data/sanity/queries";
import SanityLink from "./sanity-link";
import s from "./anchor-carousel-section.module.css";

// Placeholder copy shown until an editor fills in the real Sanity
// fields — matches the "just a working demo for now" approach already
// used for the Shop All / Stories All grids (default title/price).
const DEFAULT_INTRO =
  "A closer look at how touch, scent, heat, and time shape this ritual.";
const DEFAULT_DESCRIPTION =
  "The full story: what it's made of, how it's used, and the sensory experience it's built around.";

type SanityImageField =
  | {
      asset?: { _ref?: string | null } | null;
      alt?: string | null;
    }
  | null
  | undefined;

export type AnchorCarouselData = {
  sectionName?: string | null;
  image1?: SanityImageField;
  image2?: SanityImageField;
  image3?: SanityImageField;
  sectionIntro?: string | null;
  sectionDescription?: string | null;
  link?: LinkFieldsType | null;
} | null;

// One 100vh section per home anchor (Pressure / Flow / Momentum /
// Repetition / Balance / Bloom). Each has 3 "views" — Image 1 + the
// (locked) section name, Image 2 + the intro, Image 3 + the description —
// toggled via the 3 thumbnails, matching Set-Up-Components'
// 3-different-carousel-views references. Real Sanity images are used
// once an editor uploads them; until then each view falls back to a flat
// tone block, same placeholder pattern as the Shop All / Stories All
// grids (see lib/demo-tones.ts).
export function AnchorCarouselSection({
  categoryTitle,
  data,
  tones,
}: {
  categoryTitle: string;
  data: AnchorCarouselData;
  tones: [string, string, string];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionName = data?.sectionName?.trim() || categoryTitle;
  const introText = data?.sectionIntro?.trim() || DEFAULT_INTRO;
  const descriptionText = data?.sectionDescription?.trim() || DEFAULT_DESCRIPTION;
  const link = data?.link;

  const images: SanityImageField[] = [data?.image1, data?.image2, data?.image3];

  return (
    <section className={s.section} aria-label={categoryTitle}>
      {images.map((image, i) => {
        const src = urlForImage(image)?.width(1920).url();
        return (
          <div key={i} className={s.slide} data-active={i === activeIndex}>
            {src ? (
              <NextImage
                src={src}
                alt={image?.alt || sectionName}
                fill
                priority={i === 0}
                sizes="100vw"
                className={s.slideImage}
              />
            ) : (
              <div className={s.slideTone} style={{ backgroundColor: tones[i] }} />
            )}
          </div>
        );
      })}

      {/* All 3 views' text shares one centered treatment — same size,
          same position, crossfading with the active slide. */}
      <div className={s.textOverlay}>
        <p className={s.overlayText} data-active={activeIndex === 0}>
          {`(${sectionName})`}
        </p>
        <p className={s.overlayText} data-active={activeIndex === 1}>
          {introText}
        </p>
        <p className={s.overlayText} data-active={activeIndex === 2}>
          {descriptionText}
        </p>
      </div>

      <div className={s.content}>
        <div className={s.thumbnails}>
          {images.map((image, i) => {
            const src = urlForImage(image)?.width(160).height(160).fit("crop").url();
            return (
              <button
                key={i}
                type="button"
                className={s.thumbnail}
                data-active={i === activeIndex}
                onClick={() => setActiveIndex(i)}
                aria-pressed={i === activeIndex}
                aria-label={`Show view ${i + 1} of ${categoryTitle}`}
              >
                {src ? (
                  <NextImage src={src} alt="" fill sizes="48px" className={s.thumbnailImage} />
                ) : (
                  <span className={s.thumbnailTone} style={{ backgroundColor: tones[i] }} />
                )}
              </button>
            );
          })}
        </div>

        {link?.url && (
          <div className={s.linkRow}>
            <SanityLink link={link}>{link.label || `Shop ${categoryTitle}`}</SanityLink>
          </div>
        )}
      </div>
    </section>
  );
}
