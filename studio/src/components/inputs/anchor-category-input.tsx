import { useEffect, useState } from "react";
import { Select } from "@sanity/ui";
import { set, unset, useClient, type StringInputProps } from "sanity";
import { HOME_CATEGORIES, SANITY_API_VERSION } from "../../constants";

/**
 * Category dropdown for Products and Stories. The stored value is still
 * the section's permanent ID (e.g. "PRESSURE"), but the options are labelled
 * with each Home section's current Anchor Name and Icon, so editors pick by
 * what they actually see on the site.
 */
export function AnchorCategoryInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const client = useClient({ apiVersion: SANITY_API_VERSION });
  const [names, setNames] = useState<Record<string, string>>({});
  const [icons, setIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<{ sectionName?: string; anchorName?: string; icon?: string }[] | null>(
        `coalesce(*[_id == "drafts.home"][0], *[_id == "home"][0]).sections[]{sectionName, anchorName, icon}`,
      )
      .then((sections) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        const iconMap: Record<string, string> = {};
        for (const s of sections ?? []) {
          if (!s?.sectionName) continue;
          if (s.anchorName?.trim()) map[s.sectionName] = s.anchorName.trim();
          if (s.icon) iconMap[s.sectionName] = s.icon;
        }
        setNames(map);
        setIcons(iconMap);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <Select
      {...elementProps}
      value={value ?? ""}
      onChange={(e) => {
        const next = e.currentTarget.value;
        onChange(next ? set(next) : unset());
      }}
    >
      <option value="">Select an anchor…</option>
      {HOME_CATEGORIES.map(({ title, value: key }) => {
        const name = names[key] || title;
        const iconKey = icons[key] || key;
        const iconTitle = iconKey.charAt(0) + iconKey.slice(1).toLowerCase();
        return (
          <option key={key} value={key}>
            {`${name} (${iconTitle} icon)`}
          </option>
        );
      })}
    </Select>
  );
}
