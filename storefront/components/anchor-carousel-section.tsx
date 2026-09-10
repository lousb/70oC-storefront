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
  image3?: SanityImageField;
  sectionIntro?: string | null;
  sectionDescription?: string | null;
  link?: LinkFieldsType | null;
} | null;

// One 100vh section per home anchor (Pressure / Flow / Momentum /
// Repetition / Balance / Bloom). Each has 3 "views" — Image 1 + the
// (locked) section name, the intro (always a flat white background, no
// image — there is no image2 field), Image 3 + the description —
// toggled via the 3 thumbnails, matching Set-Up-Components'
// 3-different-carousel-views references. The middle/intro thumbnail
// always shows this category's icon (public/icons/categories/<slug>.svg)
// on a white tile rather than an image crop. Real Sanity images are used
// for views 1 and 3 once an editor uploads them; until then those two
// fall back to a flat tone block, same placeholder pattern as the Shop
// All / Stories All grids (see lib/demo-tones.ts).
export function AnchorCarouselSection({
  categoryTitle,
  categorySlug,
  data,
  tones,
}: {
  categoryTitle: string;
  categorySlug: string;
  data: AnchorCarouselData;
  tones: [string, string];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionName = data?.sectionName?.trim() || categoryTitle;
  const introText = data?.sectionIntro?.trim() || DEFAULT_INTRO;
  const descriptionText = data?.sectionDescription?.trim() || DEFAULT_DESCRIPTION;
  const link = data?.link;
  // High-res line-art PNGs (black artwork on transparent) uploaded to
  // public/icons/02Icons/ — replaces the old white categories/ SVGs for
  // both the thumbnail and the larger view-2 icon.
  const iconSrc = `/icons/02Icons/${categorySlug}.png`;

  // Index 1 (the intro view) is always a flat white background/thumbnail —
  // there's no image field for it in the schema.
  const images: [SanityImageField, null, SanityImageField] = [data?.image1, null, data?.image3];

  return (
    <section className={s.section} aria-label={categoryTitle}>
      {images.map((image, i) => {
        if (i === 1) {
          return (
            <div key={i} className={`${s.slide} ${s.slideWhite}`} data-active={i === activeIndex}>
              {/* Centered on the grid rather than the viewport, so it
                  lines up with everything else built on --grid-columns
                  (footer, floating logo, etc.) — spans a fixed number of
                  columns, horizontally + vertically centered. */}
              <div className={s.introIconGrid} aria-hidden="true">
                <div className={s.introIconBox}>
                  <NextImage
                    src={iconSrc}
                    alt=""
                    fill
                    sizes="(min-width: 769px) 33vw, 100vw"
                    className={s.introIcon}
                  />
                </div>
              </div>
            </div>
          );
        }
        const src = urlForImage(image)?.width(1920).url();
        const tone = i === 0 ? tones[0] : tones[1];
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
              <div className={s.slideTone} style={{ backgroundColor: tone }} />
            )}
          </div>
        );
      })}

      {/* All 3 views' text shares one centered treatment — same size,
          same position, crossfading with the active slide. The intro
          view (index 1) sits on the flat white background, so it gets
          dark text instead of the white text the image/tone views use. */}
      <div className={s.textOverlay}>
        <p className={s.overlayText} data-active={activeIndex === 0}>
          {`(${sectionName})`}
        </p>
        <p className={`${s.overlayText} ${s.overlayTextOnWhite}`} data-active={activeIndex === 1}>
          {introText}
        </p>
        <p className={s.overlayText} data-active={activeIndex === 2}>
          {descriptionText}
        </p>
      </div>

      <div className={s.content} data-on-white={activeIndex === 1}>
        <div className={s.thumbnails}>
          {images.map((image, i) => {
            if (i === 1) {
              return (
                <button
                  key={i}
                  type="button"
                  className={`${s.thumbnail} ${s.thumbnailWhite}`}
                  data-active={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                  aria-pressed={i === activeIndex}
                  aria-label={`Show view ${i + 1} of ${categoryTitle}`}
                >
                  <NextImage
                    src={iconSrc}
                    alt=""
                    fill
                    sizes="48px"
                    className={s.thumbnailIcon}
                  />
                </button>
              );
            }
            const src = urlForImage(image)?.width(160).height(160).fit("crop").url();
            const tone = i === 0 ? tones[0] : tones[1];
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
                  <span className={s.thumbnailTone} style={{ backgroundColor: tone }} />
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
