import { defineField, defineType } from "sanity";

export const productBlock = defineType({
  name: "productBlock",
  title: "Product Block",
  type: "object",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
    }),
  ],
  preview: {
    select: {
      title: "product.store.title",
      media: "product.store.previewImageUrl",
    },
    prepare({ title, media }) {
      return {
        title: title || "No product selected",
        subtitle: "Product Block",
        media: media
          ? () => <img src={media} alt={title} style={{ objectFit: "cover" }} />
          : undefined,
      };
    },
  },
});