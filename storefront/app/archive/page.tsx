import { StoryGrid } from "../../components/story-grid";
import { pickRandomTones } from "../../lib/demo-tones";
import type { Story } from "../../components/story-card";
import { getAnchors, anchorLabel } from "../../lib/anchors";
import { sanityFetch } from "../../data/sanity";
import { ALL_POSTS_QUERY } from "../../data/sanity/queries";
import { stegaClean } from "@sanity/client/stega";

const TOPICS = ["Spaces", "Practitioner Spotlight"];

const DEMO_MONTHS = [
  "September, 2026",
  "August, 2026",
  "July, 2026",
  "June, 2026",
  "May, 2026",
  "April, 2026",
];

// "April, 2026" - same format as the story page.
function formatStoryDate(date?: string | null) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  const month = d.toLocaleDateString("en-AU", { month: "long" });
  return `${month}, ${d.getFullYear()}`;
}

// Placeholder stories (Set-Up-Components/Stories All/Articles.pdf), one per
// Anchor - only shown while there are no stories in Sanity at all, so the
// layout never sits empty. Colors are randomized per request here on the
// server, then passed down as data, so there's no hydration mismatch.
function getDemoStories(anchorNames: string[]): Story[] {
  const colors = pickRandomTones(anchorNames.length);
  return anchorNames.map((category, i) => ({
    id: `demo-story-${i}`,
    slug: `demo-story-${i}`,
    date: DEMO_MONTHS[i],
    title: "Title",
    category,
    topic: TOPICS[i % TOPICS.length],
    author: "Author",
    readDuration: 7,
    color: colors[i],
  }));
}

export default async function Page() {
  const [{ data }, anchors] = await Promise.all([
    sanityFetch({ query: ALL_POSTS_QUERY }),
    getAnchors(),
  ]);
  // Typed loosely until typegen picks up the query's new credits field
  // (predev runs typegen).
  const posts = (data ?? []) as any[];

  let stories: Story[];
  if (posts.length === 0) {
    stories = getDemoStories(anchors.ordered);
  } else {
    // Tones sit behind each cover while it loads (or stand in if there's none)
    const colors = pickRandomTones(posts.length);
    stories = posts.map((post, i) => {
      // Byline: the Credits names (as on the story page), else legacy authors
      const names: string[] = post.credits?.length
        ? post.credits.map((c: { name?: string }) => c?.name).filter(Boolean)
        : post.authors ?? [];
      return {
        id: post._id,
        slug: post.slug,
        href: `/archive/${post.slug}`,
        date: formatStoryDate(post.date),
        title: post.title ?? "Untitled",
        category:
          anchorLabel(anchors, post.category ? stegaClean(post.category) : null) ??
          "Uncategorised",
        author: names.join(", ") || null,
        readDuration: post.readDuration ?? null,
        color: colors[i],
        cover: post.cover,
      };
    });
  }

  return (
    <div>
      <StoryGrid stories={stories} anchors={anchors.ordered} />
    </div>
  );
}
