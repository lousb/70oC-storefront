import { Link } from "next-view-transitions";
import { MediaItem } from "./media-item";
import s from "./story-card.module.css";

export type Story = {
  id: string;
  slug: string;
  /** "April, 2026" */
  date: string;
  title: string;
  /** Anchor display name, e.g. "Pressure" */
  category: string;
  /** Shown at the bottom of the cover; falls back to the anchor. */
  topic?: string | null;
  author?: string | null;
  readDuration?: number | null;
  /** Tonal fallback when there's no cover (and behind it while it loads). */
  color: string;
  /** Sanity cover (same shape as ALL_POSTS_QUERY's "cover"). */
  cover?: {
    mediaType?: "image" | "video" | null;
    image?: any;
    video?: { playbackId: string; aspectRatio?: string | null } | null;
  } | null;
  /** Real stories link to /archive/[slug]; demo placeholders don't. */
  href?: string | null;
};


export function StoryCard({ story }: { story: Story }) {
  const cover = story.cover;
  const hasMedia =
    (cover?.mediaType === "image" && cover.image?.asset) ||
    (cover?.mediaType === "video" && cover.video?.playbackId);

  const inner = (
    <div className={s.cover} style={{ backgroundColor: story.color }}>
      {hasMedia && (
        <div className={s.media} aria-hidden="true">
          <MediaItem
            mediaType={cover!.mediaType as "image" | "video"}
            image={cover!.image ?? undefined}
            video={(cover!.video as any) ?? undefined}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className={s.shade} />
        </div>
      )}
      <span className={s.date}>{story.date}</span>
      <span className={s.title}>{story.title}</span>
      <span className={s.topic}>{story.topic || story.category}</span>
    </div>
  );

  return (
    <article>
      {story.href ? (
        <Link href={story.href} className={s.card}>
          {inner}
        </Link>
      ) : (
        <div className={s.card}>{inner}</div>
      )}
      <div className={s.byline}>
        <span>{story.author}</span>
        {story.readDuration ? <span>{story.readDuration} Minutes</span> : <span />}
      </div>
    </article>
  );
}
