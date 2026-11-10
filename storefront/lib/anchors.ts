import { stegaClean } from "@sanity/client/stega";
import { sanityFetch } from "../data/sanity";
import { ANCHOR_NAMES_QUERY } from "../data/sanity/queries";

// The 6 anchors' permanent section IDs (what products/stories store as
// `category`, and what #anchor links key off). Mirrors HOME_CATEGORIES in
// studio/src/constants.ts. Each anchor's display name AND icon are
// editable on the Home singleton, so never derive either from the ID
// directly - go through getAnchors().
export const ANCHOR_KEYS = [
  "PRESSURE",
  "FLOW",
  "MOMENTUM",
  "REPETITION",
  "BALANCE",
  "BLOOM",
] as const;

const titleCase = (key: string) => key.charAt(0) + key.slice(1).toLowerCase();

export type AnchorItem = {
  /** Permanent section ID, e.g. "PRESSURE". */
  key: string;
  /** Display name (Studio "Anchor Name", falls back to "Pressure"). */
  label: string;
  /** Icon filename slug, e.g. "flow" -> /icons/02Icons/flow.png. */
  icon: string;
};

export type Anchors = {
  /** Section ID -> display name. */
  labels: Record<string, string>;
  /** Section ID -> icon slug. */
  icons: Record<string, string>;
  /** Anchors in the editor's Home order. */
  items: AnchorItem[];
  /** Display names in Home order, for filter menus. */
  ordered: string[];
};

export async function getAnchors(): Promise<Anchors> {
  const { data } = await sanityFetch({ query: ANCHOR_NAMES_QUERY, stega: false });

  const labels: Record<string, string> = {};
  const icons: Record<string, string> = {};
  for (const key of ANCHOR_KEYS) {
    labels[key] = titleCase(key);
    icons[key] = key.toLowerCase();
  }
  for (const section of data ?? []) {
    const key = section?.sectionName ? stegaClean(section.sectionName) : null;
    if (!key) continue;
    const name = section?.anchorName?.trim();
    const icon = section?.icon ? stegaClean(section.icon) : null;
    if (name) labels[key] = name;
    if (icon) icons[key] = icon.toLowerCase();
  }

  const order = (data ?? [])
    .map((s) => (s?.sectionName ? stegaClean(s.sectionName) : null))
    .filter((k): k is string => !!k && k in labels);
  const keys = order.length === ANCHOR_KEYS.length ? order : [...ANCHOR_KEYS];
  const items = keys.map((key) => ({ key, label: labels[key], icon: icons[key] }));

  return { labels, icons, items, ordered: items.map((i) => i.label) };
}

export function anchorLabel(anchors: Anchors, key: string | null | undefined) {
  if (!key) return null;
  return anchors.labels[key] ?? titleCase(key);
}

export function anchorIcon(anchors: Anchors, key: string | null | undefined) {
  if (!key) return null;
  return anchors.icons[key] ?? key.toLowerCase();
}
