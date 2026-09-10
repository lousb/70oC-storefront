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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sectionName",
      title: "Section Name",
      type: "string",
      readOnly: true,
      description: "Locked — set automatically for this section.",
    }),
    defineField({
      name: "image2",
      title: "Image 2",
      type: "picture",
    }),
    defineField({
      name: "sectionIntro",
      title: "Section Introduction",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image3",
      title: "Image 3",
      type: "picture",
    }),
    defineField({
      name: "sectionDescription",
      title: "Section Description",
      type: "text",
      rows: 4,
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
