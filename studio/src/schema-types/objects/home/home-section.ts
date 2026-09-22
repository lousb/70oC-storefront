import { defineField, defineType } from "sanity";

/**
 * Shared shape for each of the 6 fixed Home sections (Pressure, Flow, Momentum,
 * Repetition, Balance, Bloom). The section name is locked and read-only here
 * so editors can't rename or mismatch a section — its value is one of the
 * upper-case HOME_CATEGORIES codes (e.g. "PRESSURE") set by the migration/
 * initialValue, kept upper-case to match what the rest of the app matches
 * against (see app/page.tsx). preview.prepare() below just reformats it to
 * Title Case for a nicer read in Studio's sections list and document title.
 */
export const homeSection = defineType({
  name: "homeSection",
  title: "Home Section",
  type: "object",
  fields: [
    defineField({
      name: "image1",
      title: "Image 1",
      type: "picture",
      description: "Slide 1 — shown with the (locked) Section Name.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sectionName",
      title: "Section Name",
      type: "string",
      readOnly: true,
      description: "Slide 1 — locked, set automatically for this section.",
    }),
    defineField({
      name: "sectionIntro",
      title: "Section Introduction",
      type: "text",
      rows: 3,
      description: "Slide 2 — always a plain white background with this section's icon, no image.",
    }),
    defineField({
      name: "image3",
      title: "Image 3",
      type: "picture",
      description: "Slide 3 — shown with the Section Description.",
    }),
    defineField({
      name: "sectionDescription",
      title: "Section Description",
      type: "text",
      rows: 4,
      description: "Slide 3 — shown with Image 3.",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      description: "Optional — where this section should link to.",
    }),
  ],
  preview: {
    select: {
      sectionName: "sectionName",
      subtitle: "sectionIntro",
      media: "image1",
    },
    prepare({ sectionName, subtitle, media }) {
      // Studio-display only — reformats the stored upper-case code (e.g.
      // "PRESSURE") to Title Case ("Pressure"). The stored value itself
      // stays upper-case; nothing downstream that matches against it changes.
      const title = sectionName
        ? sectionName.charAt(0) + sectionName.slice(1).toLowerCase()
        : "Untitled";
      return { title, subtitle, media };
    },
  },
});
