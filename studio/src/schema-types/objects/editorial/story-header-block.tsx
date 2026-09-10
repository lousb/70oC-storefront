import { defineField, defineType } from "sanity";

export const storyHeaderBlock = defineType({
  name: "storyHeaderBlock",
  title: "Header Block",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Header Text",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare({ title }) {
      return { title: title || "Untitled Header", subtitle: "Header Block" };
    },
  },
});
