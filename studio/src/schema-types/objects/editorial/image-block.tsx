import { defineField, defineType } from "sanity";

export const imageBlock = defineType({
  name: "imageBlock",
  title: "Image Block",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Media",
      description: "Add one item for static display. Add multiple for a carousel. Each can be an image or video.",
      type: "array",
      of: [{ type: "media" }],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "columnSpan",
      title: "Column Span",
      type: "number",
      initialValue: 1,
      options: {
        list: [
          { title: "1 column", value: 1 },
          { title: "2 columns", value: 2 },
        ],
        layout: "radio",
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      items: "items",
      columnSpan: "columnSpan",
    },
    prepare({ title, items, columnSpan }) {
      const count = items?.length || 0;
      const firstImage = items?.find((i: any) => i.mediaType === "image")?.image;
      return {
        title: title || "Untitled Image Block",
        subtitle: `${count > 1 ? `Carousel (${count} items)` : "Static"} · ${columnSpan || 1} col`,
        media: firstImage,
      };
    },
  },
});