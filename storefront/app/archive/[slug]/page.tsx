import { notFound } from "next/navigation";
import { sanityFetch } from "../../../data/sanity";
import { POST_QUERY, ALL_POST_SLUGS } from "../../../data/sanity/queries";
import { BlogPageBuilder } from "../../../components/blog-page-builder";
import { StoryMedia, type StoryMediaValue } from "../../../components/story-media";
import s from "../../../components/story-article.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: ALL_POST_SLUGS,
    perspective: "published",
    stega: false,
  });
  return data ?? [];
}

// "April, 2026"
function formatStoryDate(date?: string | null) {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00`);
  const month = d.toLocaleDateString("en-AU", { month: "long" });
  return `${month}, ${d.getFullYear()}`;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { data } = await sanityFetch({ query: POST_QUERY, params });
  // Typegen output catches up on the next `npm run dev` (predev runs
  // typegen) - typed loosely here so the new fields don't block that.
  const post = data as any;

  if (!post?._id) return notFound();

  const blocks: any[] = post.pageBuilder ?? [];

  // Story-wide footnote numbering, in reading order.
  const footnoteNumbers: Record<string, number> = {};
  let fn = 0;
  for (const block of blocks) {
    if (block._type !== "storyQuestionBlock") continue;
    for (const para of block.answer ?? []) {
      for (const child of para.children ?? []) {
        if (child?._type === "storyFootnote" && child._key) footnoteNumbers[child._key] = ++fn;
      }
    }
  }

  // Desktop thumbnail strip: hero + every story image, each linking to
  // its figure.
  const thumbs: { id: string; media: StoryMediaValue }[] = [];
  const mediaAnchors: Record<string, [string, string?]> = {};
  if (post.cover?.mediaType) thumbs.push({ id: "story-top", media: post.cover });
  for (const block of blocks) {
    if (block._type !== "storyMediaBlock" || !block.media) continue;
    const a = `fig-${thumbs.length}`;
    thumbs.push({ id: a, media: block.media });
    const isDouble = block.layout === "double" && block.secondMedia;
    if (isDouble) {
      const b = `fig-${thumbs.length}`;
      thumbs.push({ id: b, media: block.secondMedia });
      mediaAnchors[block._key] = [a, b];
    } else {
      mediaAnchors[block._key] = [a];
    }
  }

  const credits: string | null = post.credits?.length
    ? post.credits
        .filter((c: any) => c?.name)
        .map((c: any) => (c.role ? `${c.role}: ${c.name}` : c.name))
        .join(", ")
    : post.authors?.length
    ? post.authors.join(", ")
    : null;
  const dateLabel = formatStoryDate(post.date);

  return (
    <article className={s.story}>
      <header id="story-top" className={s.hero}>
        {thumbs.length > 1 && (
          <nav className={s.thumbs} aria-label="Story images">
            {thumbs.map((t) => (
              <a key={t.id} href={`#${t.id}`} className={s.thumb}>
                <StoryMedia media={t.media} sizes="60px" />
              </a>
            ))}
          </nav>
        )}

        {post.cover?.mediaType && (
          <div className={s.heroMedia}>
            <StoryMedia media={post.cover} sizes="(max-width: 768px) 100vw, 40vw" priority />
          </div>
        )}

        <h1 className={s.title}>{post.title}</h1>
        {post.category && <p className={s.category}>{post.category}</p>}
        {(credits || dateLabel) && (
          <p className={s.credits}>
            {credits}
            {credits && dateLabel && <br />}
            {dateLabel}
          </p>
        )}
      </header>

      {post.excerpt && (
        <div className={`${s.grid} ${s.introWrap}`}>
          <p className={s.intro}>{post.excerpt}</p>
        </div>
      )}

      {blocks.length > 0 && (
        <BlogPageBuilder
          blocks={blocks}
          footnoteNumbers={footnoteNumbers}
          mediaAnchors={mediaAnchors}
        />
      )}
    </article>
  );
}
