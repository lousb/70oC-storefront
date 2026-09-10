import { defineArrayMember, defineField, defineType } from "sanity";

export const header = defineType({
  name: "header",
  title: "Header",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "headerDescription",
      title: "Header Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "announcementBar",
      type: "announcementBar",
    }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
  ],
});
