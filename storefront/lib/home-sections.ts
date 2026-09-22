// Shared helpers for the home page's pinned/stacked sections (the 6
// anchor sections + footer, each marked with data-snap-section — see
// anchor-carousel-section.tsx, footer.tsx). Used by both
// components/home-scroll-snap.tsx and components/home-parallax.tsx so
// the two effects always agree on where each section starts.
export function getSnapSections(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-snap-section]"),
  );
}

// Cumulative document-flow offsets, one per section, computed by summing
// offsetHeight rather than reading offsetTop directly. Once the sections
// became position: sticky (for the pin-and-cover effect), offsetTop
// stopped being reliable for this: browsers aren't consistent about
// whether it reports a sticky element's static (flow) position or its
// current, scroll-adjusted "stuck" position — which is what silently
// broke scroll-snapping. offsetHeight isn't affected by sticky's
// positioning offset at all, only by actual box size, so summing it
// gives correct boundaries regardless of which section happens to be
// stuck at the moment this runs.
export function getSnapSectionTops(sections: HTMLElement[]): number[] {
  const tops: number[] = [];
  let acc = 0;
  for (const el of sections) {
    tops.push(acc);
    acc += el.offsetHeight;
  }
  return tops;
}
