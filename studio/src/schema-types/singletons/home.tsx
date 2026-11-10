import { defineField, defineType } from "sanity";
import { HOME_CATEGORIES } from "../../constants";

/**
 * Home page. Made up of 6 fixed sections (Pressure, Flow, Momentum,
 * Repetition, Balance, Bloom) — each with the same shape (see
 * objects/home/home-section.ts). Each section's name is locked (readOnly
 * on homeSection.sectionName), but editors can reorder the 6 sections
 * themselves by dragging them in this array — that's what actually
 * controls the order they render in on the home page (see
 * app/page.tsx/HOME_QUERY in the storefront, which now read this as
 * `sections` rather than 6 separately-named fields).
 */
export const home = defineType({
  name: "home",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [{ type: "homeSection" }],
      description:
        "Drag to reorder — this is the order they'll appear in on the home page. Drag to reorder. Each anchor's name and icon can be changed inside it. The 6 anchors can't be added or removed.",
      initialValue: HOME_CATEGORIES.map(({ value }) => ({
        sectionName: value,
      })),
      validation: (Rule) =>
        Rule.required()
          .length(HOME_CATEGORIES.length)
          .error(`Exactly ${HOME_CATEGORIES.length} sections are required — one per category.`)
          .custom((sections) => {
            if (!Array.isArray(sections)) return true;

            const expected = HOME_CATEGORIES.map(({ value }) => value);
            const present = sections.map(
              (section: any) => section?.sectionName,
            );

            const missing = expected.filter((name) => !present.includes(name));
            if (missing.length > 0) {
              return `Missing section(s): ${missing.join(", ")}. Sections can be reordered but not removed, added, or renamed.`;
            }

            const seen = new Set<string>();
            const duplicates = new Set<string>();
            for (const name of present) {
              if (seen.has(name)) duplicates.add(name);
              seen.add(name);
            }
            if (duplicates.size > 0) {
              return `Duplicate section(s): ${[...duplicates].join(", ")}. Each of the 6 sections should appear exactly once.`;
            }

            // Each icon can only be used by one anchor (blank = its default).
            const icons = sections.map(
              (section: any) => section?.icon || section?.sectionName,
            );
            const dupIcons = icons.filter((icon, i) => icons.indexOf(icon) !== i);
            if (dupIcons.length > 0) {
              const names = [...new Set(dupIcons)].map(
                (v: string) => v.charAt(0) + v.slice(1).toLowerCase(),
              );
              return `Icon used twice: ${names.join(", ")}. Each anchor needs its own icon.`;
            }

            return true;
          }),
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home" }),
  },
});
