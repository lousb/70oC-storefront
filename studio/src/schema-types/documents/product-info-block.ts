import { defineField, defineType } from "sanity";

/**
 * Reusable content block referenced by Product's "How To Use", "Shipping",
 * and "Where We Live" fields. Edit once here, applies everywhere it's
 * referenced — create multiple if different products need different copy.
 */
export const productInfoBlock = defineType({
  name: "productInfoBlock",
  title: "Product Info Block",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Untitled Info Block" };
    },
  },
});
