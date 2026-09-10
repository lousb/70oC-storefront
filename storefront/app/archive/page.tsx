import { StoryGrid } from "../../components/story-grid";
import { pickRandomTones } from "../../lib/demo-tones";
import type { DemoStory } from "../../components/story-card";

const ANCHORS = [
  "Pressure",
  "Flow",
  "Momentum",
  "Repetition",
  "Balance",
  "Bloom",
];

const TOPICS = ["Spaces", "Practitioner Spotlight"];

const DEMO_MONTHS = [
  "September, 2026",
  "August, 2026",
  "July, 2026",
  "June, 2026",
  "May, 2026",
  "April, 2026",
];

// No real Sanity posts exist yet — this renders a working demo of the
// Stories All layout (Set-Up-Components/Stories All/Articles.pdf) with
// 6 placeholder items, one per Anchor/category, "Title" standing in for
// the Sanity title field until real stories exist. Colors are
// randomized per request in this Server Component, then passed down as
// data, so there's no client/server hydration mismatch.
function getDemoStories(): DemoStory[] {
  const colors = pickRandomTones(ANCHORS.length);
  return ANCHORS.map((category, i) => ({
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

export default function Page() {
  const stories = getDemoStories();

  return (
    <div>
      <StoryGrid stories={stories} />
    </div>
  );
}
