import { defineArrayMember, defineField, defineType } from "sanity";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "object",
  options: {
    collapsed: false,
    collapsible: true,
  },
  fields: [
    defineField({
      name: "shopLinks",
      title: "Footer Shop Links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
    defineField({
      name: "infoLinks",
      title: "Footer Info Links",
      type: "object",
      options: { collapsed: false, collapsible: true },
      fields: [
        defineField({ name: "stockists", title: "Stockists", type: "link" }),
        defineField({
          name: "shippingAndReturns",
          title: "Shipping and Returns",
          type: "link",
        }),
        defineField({
          name: "termsAndConditions",
          title: "Terms & Conditions",
          type: "link",
        }),
        defineField({
          name: "privacyPolicy",
          title: "Privacy Policy",
          type: "link",
        }),
      ],
    }),
    defineField({
      name: "connectLinks",
      title: "Footer Connect Links",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
    }),
  ],
});
