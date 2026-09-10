import { defineField, defineType } from "sanity";

export const archive = defineType({
  name: "archive",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Archive",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Archive" }),
  },
});