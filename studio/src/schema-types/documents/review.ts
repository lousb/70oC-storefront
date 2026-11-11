import { CommentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Customer review. The reviews list is site-wide: every product page's
 * Reviews table/flyout shows all of them. The Anchor + Number columns come
 * from the reviewed product (category + its "001" position), so they
 * aren't entered here. Only published reviews appear on the site.
 */
export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Reviewer's first name, as shown on the site.",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      description:
        "The product this review is for. Sets the Anchor, Number and Product columns. Reviews show on every product page.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Variant Bought",
      type: "reference",
      to: [{ type: "productVariant" }],
      description:
        "Optional, e.g. 10 Pack. Shown in the Product column as \"Product, Variant\". Pick the Product first.",
      options: {
        disableNew: true,
        filter: ({ document }) => {
          const productId = (document as any)?.product?._ref;
          if (!productId) return { filter: "false" };
          return {
            filter:
              "_id in *[_id == $productId || _id == 'drafts.' + $productId][0].store.variants[]._ref",
            params: { productId },
          };
        },
      },
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      options: {
        list: [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((n) => ({
          title: `${n} / 5`,
          value: n,
        })),
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "body",
      title: "Review",
      type: "text",
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "age",
      title: "Age",
      type: "string",
      options: {
        list: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "hairLength",
      title: "Hair Length",
      type: "string",
      options: { list: ["Short", "Medium", "Long"], layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "hairType",
      title: "Hair Type",
      type: "string",
      description: "e.g. Straight, Dry",
    }),
    defineField({
      name: "heatType",
      title: "Heat Type",
      type: "string",
      options: { list: ["Traditional", "Infrared"], layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "Newest reviews show first. Defaults to today.",
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
  ],
  orderings: [
    { title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { name: "name", rating: "rating", product: "product.store.title", body: "body" },
    prepare({ name, rating, product }) {
      return {
        title: `${name ?? "Unnamed"}${rating ? ` · ${rating}/5` : ""}`,
        subtitle: product ?? "No product",
      };
    },
  },
});
