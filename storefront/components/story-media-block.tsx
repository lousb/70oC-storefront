import { StoryMedia, type StoryMediaValue } from "./story-media";
import s from "./story-article.module.css";

type StoryMediaBlockProps = {
  block: {
    media?: StoryMediaValue;
    secondMedia?: StoryMediaValue;
    layout?: "single" | "double";
    width?: "centered" | "fullWidth";
  };
  // Anchor ids for the desktop hero thumbnail strip (see page.tsx).
  anchorIds?: [string, string?];
  className?: string;
};

// Layouts (see studio story-media-block.tsx for the full table):
//   single/centered  desktop cols 6-13, mobile margin to margin
//   single/full      edge to edge (100vw), every breakpoint
//   double/centered  desktop cols 6-9 + 10-13, mobile stacked
//   double/full      desktop cols 1-9 + 10-18, mobile stacked
export function StoryMediaBlock({ block, anchorIds, className = "" }: StoryMediaBlockProps) {
  if (!block.media) return null;
  const isDouble = block.layout === "double" && !!block.secondMedia;
  const isFull = block.width === "fullWidth";

  if (!isDouble && isFull) {
    return (
      <figure id={anchorIds?.[0]} className={`${s.mediaBleed} ${className}`}>
        <StoryMedia media={block.media} sizes="100vw" />
      </figure>
    );
  }

  if (!isDouble) {
    return (
      <figure className={`${s.grid} ${className}`}>
        <div id={anchorIds?.[0]} className={s.mediaCentered}>
          <StoryMedia media={block.media} sizes="(max-width: 768px) 100vw, 45vw" />
        </div>
      </figure>
    );
  }

  const half = isFull ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 23vw";
  return (
    <figure className={`${s.grid} ${s.mediaDouble} ${isFull ? s.mediaDoubleFull : s.mediaDoubleCentered} ${className}`}>
      <div id={anchorIds?.[0]} className={s.mediaDoubleA}>
        <StoryMedia media={block.media} sizes={half} />
      </div>
      <div id={anchorIds?.[1]} className={s.mediaDoubleB}>
        <StoryMedia media={block.secondMedia!} sizes={half} />
      </div>
    </figure>
  );
}
