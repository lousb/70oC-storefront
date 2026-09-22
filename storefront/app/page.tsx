import { AnchorCarouselSection } from "../components/anchor-carousel-section";
import { HomeScrollSnap } from "../components/home-scroll-snap";
import { Footer } from "../components/footer";
import { pickRandomTones } from "../lib/demo-tones";
import { sanityFetch } from "../data/sanity/";
import { HOME_QUERY } from "../data/sanity/queries";

// Mirrors HOME_CATEGORIES in studio/src/constants.ts — see
// components/footer-icon-row.tsx for why this list is duplicated here
// rather than imported (storefront and studio are separate packages).
// `slug` is what everything else on the site (icon filenames, anchor
// links) keys off; `title.toUpperCase()` matches a section's own locked
// sectionName value (e.g. "PRESSURE") one-to-one, which is how each
// item coming back from Sanity's `sections` array (now reorderable by
// editors in Studio, see studio/src/schema-types/singletons/home.tsx) is
// matched back to its canonical title/slug below, regardless of what
// order Sanity returns them in.
const HOME_ANCHORS = [
  { title: "Pressure", slug: "pressure" },
  { title: "Flow", slug: "flow" },
  { title: "Momentum", slug: "momentum" },
  { title: "Repetition", slug: "repetition" },
  { title: "Balance", slug: "balance" },
  { title: "Bloom", slug: "bloom" },
] as const;

export default async function Page() {
  const { data: home } = await sanityFetch({
    query: HOME_QUERY,
    // Metadata should never contain stega
    stega: false,
  });

  // Same approach as the Shop All / Stories All demo pages: this renders
  // the 6 anchor sections unconditionally with placeholder content/tones,
  // rather than blocking on the Sanity "home" singleton existing yet —
  // an editor hasn't necessarily created/published it in Studio, and
  // there's no reason the homepage should show nothing until they do.
  // Sanity's own `sections` array is missing/empty in that case too, so
  // this falls back to HOME_ANCHORS' own (fixed) order for the initial,
  // unpublished state.
  const sections = home?.sections?.length
    ? home.sections
    : HOME_ANCHORS.map(({ title }) => ({ sectionName: title.toUpperCase() }));

  return (
    <div>
      {/* Renders nothing itself — just wires up section-boundary scroll
          snapping (each AnchorCarouselSection + the Footer below carry
          data-snap-section) for as long as this page is mounted. */}
      <HomeScrollSnap />

      {sections.map((section) => {
        // sectionName is locked in Studio to one of HOME_ANCHORS' own 6
        // values, so this should always find a match — the fallback to
        // HOME_ANCHORS[0] only guards against a not-yet-published/stale
        // document briefly disagreeing with this list.
        const anchor =
          HOME_ANCHORS.find(
            (a) => a.title.toUpperCase() === section.sectionName,
          ) ?? HOME_ANCHORS[0];

        return (
          <AnchorCarouselSection
            key={anchor.slug}
            categoryTitle={anchor.title}
            categorySlug={anchor.slug}
            // Same _key: string vs null looseness footer.tsx already lives
            // with when passing this query result's link field along.
            data={section as any}
            // Only 2 tones needed now — the middle/intro view is always a
            // flat white background/icon tile, not an image or tone.
            tones={pickRandomTones(2) as [string, string]}
          />
        );
      })}

      {/* Home-only, as the final scroll-snap stop — see app/layout.tsx. */}
      <Footer />
    </div>
  );
}
