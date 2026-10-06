import { defineField, defineType } from "sanity";

// Header / Pull Quote. Large serif, spans the text column (desktop cols
// 6-13, mobile full width). Type the quote marks yourself if you want
// them - the text is rendered exactly as entered.
export const storyHeaderBlock = defineType({
  name: "storyHeaderBlock",
  title: "Header / Pull Quote",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare({ title }) {
      return { title: title || "Untitled Header", subtitle: "Header / Pull Quote" };
    },
  },
});
