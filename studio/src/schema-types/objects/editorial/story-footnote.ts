import { defineField, defineType } from "sanity";

// Inline footnote, dropped into a Question block's Answer at the exact
// spot the "(1)" marker should sit. Numbering is automatic on the
// storefront: footnotes are counted in reading order across the whole
// story, so editors never type the number themselves.
//
// Desktop: the note sits in the right-hand margin (cols 15-18) level
// with the line that references it. Mobile: notes are listed under the
// answer they belong to.
export const storyFootnote = defineType({
  name: "storyFootnote",
  title: "Footnote",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Footnote Text",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare({ title }) {
      return { title: title || "Footnote", subtitle: "Footnote" };
    },
  },
});
