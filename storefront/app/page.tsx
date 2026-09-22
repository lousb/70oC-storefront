import { AnchorCarouselSection } from "../components/anchor-carousel-section";
import { HomeScrollSnap } from "../components/home-scroll-snap";
import { HomeParallax } from "../components/home-parallax";
import { Footer } from "../components/footer";
import { pickRandomTones } from "../lib/demo-tones";
import { sanityFetch } from "../data/sanity/";
import { HOME_QUERY } from "../data/sanity/queries";

// Mirrors HOME_CATEGORIES in studio/src/constants.ts — see
// components/footer-icon-row.tsx for why this list is duplicated here
// rather than imported (storefront and studio are separate packages).
// `slug` matches the field name on the Home document / HOME_QUERYResult.
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
  return (
    <div>
      {/* Renders nothing themselves — just wire up section-boundary
          scroll snapping and the desktop-only pin/cover parallax (each
          AnchorCarouselSection + the Footer below carry
          data-snap-section) for as long as this page is mounted. */}
      <HomeScrollSnap />
      <HomeParallax />

      {HOME_ANCHORS.map(({ title, slug }) => (
        <AnchorCarouselSection
          key={slug}
          categoryTitle={title}
          categorySlug={slug}
          // Same _key: string vs null looseness footer.tsx already lives
          // with when passing this query result's link field along.
          data={home?.[slug] as any}
          // Only 2 tones needed now — the middle/intro view is always a
          // flat white background/icon tile, not an image or tone.
          tones={pickRandomTones(2) as [string, string]}
        />
      ))}

      {/* Home-only, as the final scroll-snap stop — see app/layout.tsx. */}
      <Footer />
    </div>
  );
}
