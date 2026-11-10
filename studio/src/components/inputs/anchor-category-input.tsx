import { useEffect, useState } from "react";
import { Select } from "@sanity/ui";
import { set, unset, useClient, type StringInputProps } from "sanity";
import { HOME_CATEGORIES, SANITY_API_VERSION } from "../../constants";

/**
 * Category dropdown for Products and Stories. The stored value is still
 * the locked icon key (e.g. "PRESSURE"), but the options are labelled with
 * each Home section's current Anchor Name, so editors pick by the name
 * they actually see on the site, not the original icon name.
 */
export function AnchorCategoryInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props;
  const client = useClient({ apiVersion: SANITY_API_VERSION });
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<{ sectionName?: string; anchorName?: string }[] | null>(
        `coalesce(*[_id == "drafts.home"][0], *[_id == "home"][0]).sections[]{sectionName, anchorName}`,
      )
      .then((sections) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const s of sections ?? []) {
          if (s?.sectionName && s.anchorName?.trim()) map[s.sectionName] = s.anchorName.trim();
        }
        setNames(map);
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
        const name = names[key];
        return (
          <option key={key} value={key}>
            {name && name !== title ? `${name} (${title} icon)` : title}
          </option>
        );
      })}
    </Select>
  );
}
