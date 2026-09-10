// Shared placeholder "cover" colors for demo product/story grids — stands
// in for real photography until Shopify products / Sanity posts actually
// exist. Matches the fallback pattern already used in the Stories
// reference design itself: cards without a real cover image show a flat,
// moody, single-hue block instead (a few of the mockup's own story cards
// do exactly this).
const TONE_PALETTE = [
  "#2B1116", // oxblood
  "#332B12", // dark olive
  "#0F1B2E", // deep navy
  "#241A10", // dark chocolate
  "#1C1C1C", // charcoal
  "#241830", // deep plum
  "#14241C", // deep forest
  "#2A2118", // espresso
];

// Fisher-Yates shuffle, then take as many as needed — called once per
// request in a Server Component, so the chosen colors are baked into the
// server-rendered output (no client-side re-randomizing, no hydration
// mismatch).
export function pickRandomTones(count: number): string[] {
  const pool = [...TONE_PALETTE];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // If more tones are needed than the palette has, wrap around.
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[i % pool.length]);
  }
  return result;
}
