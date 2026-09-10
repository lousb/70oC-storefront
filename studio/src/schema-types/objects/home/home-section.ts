import { defineField, defineType } from "sanity";

/**
 * Shared shape for each of the 6 fixed Home sections (Pressure, Flow, Momentum,
 * Repetition, Balance, Bloom). The section name is locked — it's set via
 * initialValue on each field in singletons/home.tsx and is read-only here so
 * editors can't rename or mismatch a section.
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
      title: "sectionName",
      subtitle: "sectionIntro",
      media: "image1",
    },
  },
});
