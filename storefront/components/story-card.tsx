import s from "./story-card.module.css";

export type DemoStory = {
  id: string;
  slug: string;
  date: string;
  title: string;
  category: string;
  topic: string;
  author: string;
  readDuration: number;
  color: string;
};

// Demo card: no real Sanity post exists yet, so the cover is a flat
// tonal placeholder — the same fallback the Stories reference design
// itself uses for cards without real cover photography.
// No real Sanity posts exist yet, so these demo slugs don't resolve to
// a real /archive/[slug] page — unlinked (a plain div, not an <a>/Link)
// until real stories exist, matching s.card's existing layout either way.
export function StoryCard({ story }: { story: DemoStory }) {
  return (
    <article>
      <div className={s.card}>
        <div className={s.cover} style={{ backgroundColor: story.color }}>
          <span className={s.date}>{story.date}</span>
          <span className={s.title}>{story.title}</span>
          <span className={s.topic}>{story.topic}</span>
        </div>
      </div>
      <div className={s.byline}>
        <span>{story.author}</span>
        <span>{story.readDuration} Minutes</span>
      </div>
    </article>
  );
}
