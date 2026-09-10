import { MediaItem } from "./media-item";

type Media = {
  mediaType: "image" | "video";
  image?: any;
  video?: { playbackId: string; aspectRatio?: string };
};

type StoryMediaBlockProps = {
  block: {
    media?: Media;
    secondMedia?: Media;
    layout?: "single" | "double";
    width?: "centered" | "fullWidth";
    caption?: string;
  };
  figureIndex?: number;
};

export function StoryMediaBlock({ block, figureIndex }: StoryMediaBlockProps) {
  if (!block.media) return null;
  const isDouble = block.layout === "double" && block.secondMedia;
  const isFullWidth = block.width === "fullWidth";

  return (
    <figure
      className="story-media-block"
      style={{
        width: isFullWidth ? "100%" : "min(100%, 65ch)",
        margin: isFullWidth ? "0" : "0 auto",
      }}
    >
      <div
        style={{
          display: isDouble ? "grid" : undefined,
          gridTemplateColumns: isDouble ? "repeat(2, 1fr)" : undefined,
          gap: isDouble ? "1rem" : undefined,
        }}
      >
        <div style={{ position: "relative", width: "100%", aspectRatio: isFullWidth ? "16/9" : "4/5" }}>
          <MediaItem
            mediaType={block.media.mediaType}
            image={block.media.image}
            video={block.media.video}
            sizes={isFullWidth ? "100vw" : "65ch"}
          />
        </div>
        {isDouble && (
          <div style={{ position: "relative", width: "100%", aspectRatio: isFullWidth ? "16/9" : "4/5" }}>
            <MediaItem
              mediaType={block.secondMedia!.mediaType}
              image={block.secondMedia!.image}
              video={block.secondMedia!.video}
              sizes={isFullWidth ? "100vw" : "65ch"}
            />
          </div>
        )}
      </div>
      {(figureIndex || block.caption) && (
        <figcaption style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.5rem" }}>
          {figureIndex && <span>Fig. {figureIndex}</span>}
          {figureIndex && block.caption && <span> — </span>}
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
