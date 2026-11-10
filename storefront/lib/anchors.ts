import { stegaClean } from "@sanity/client/stega";
import { sanityFetch } from "../data/sanity";
import { ANCHOR_NAMES_QUERY } from "../data/sanity/queries";

// The 6 anchors' locked icon keys (what products/stories store as
// `category`, and what icon filenames + #anchor links key off). Mirrors
// HOME_CATEGORIES in studio/src/constants.ts.
export const ANCHOR_KEYS = [
  "PRESSURE",
  "FLOW",
  "MOMENTUM",
  "REPETITION",
  "BALANCE",
  "BLOOM",
] as const;

const titleCase = (key: string) => key.charAt(0) + key.slice(1).toLowerCase();

export type Anchors = {
  /** Icon key ("PRESSURE") -> display name (the Studio "Anchor Name", or "Pressure"). */
  labels: Record<string, string>;
  /** Display names in the editor's Home section order, for filter menus. */
  ordered: string[];
};

/**
 * Single source for anchor display names across the storefront. Editors
 * rename anchors on the Home singleton (homeSection.anchorName); the
 * icon key stays fixed, so icons/links never move when a name changes.
 */
export async function getAnchors(): Promise<Anchors> {
  const { data } = await sanityFetch({ query: ANCHOR_NAMES_QUERY, stega: false });

  const labels: Record<string, string> = {};
  for (const key of ANCHOR_KEYS) labels[key] = titleCase(key);
  for (const section of data ?? []) {
    const key = section?.sectionName ? stegaClean(section.sectionName) : null;
    const name = section?.anchorName?.trim();
    if (key && name) labels[key] = name;
  }

  const order = (data ?? [])
    .map((s) => (s?.sectionName ? stegaClean(s.sectionName) : null))
    .filter((k): k is string => !!k && k in labels);
  const keys = order.length === ANCHOR_KEYS.length ? order : [...ANCHOR_KEYS];

  return { labels, ordered: keys.map((k) => labels[k]) };
}

export function anchorLabel(anchors: Anchors, key: string | null | undefined) {
  if (!key) return null;
  return anchors.labels[key] ?? titleCase(key);
}
