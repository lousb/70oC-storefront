import { defineField, defineType } from "sanity";

export const shop = defineType({
  name: "shop",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: "pageBuilder",
      title: "Page builder",
      type: "array",
      of: [{ type: "contentRow" }],
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Shop" }),
  },
});