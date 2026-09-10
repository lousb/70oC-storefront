import { defineField, defineType } from "sanity";

export const storyMediaBlock = defineType({
  name: "storyMediaBlock",
  title: "Media Block",
  type: "object",
  fields: [
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      initialValue: "single",
      options: {
        list: [
          { title: "Single", value: "single" },
          { title: "Double", value: "double" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "string",
      initialValue: "centered",
      options: {
        list: [
          { title: "Centered", value: "centered" },
          { title: "Full Width", value: "fullWidth" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondMedia",
      title: "Second Media",
      description: "Shown alongside Media when Layout is set to Double.",
      type: "media",
      hidden: ({ parent }) => parent?.layout !== "double",
    }),
    defineField({
      name: "caption",
      title: "Fig Description",
      description: "Caption shown under the figure number (e.g. \"Fig. 1\").",
      type: "string",
    }),
  ],
  preview: {
    select: {
      image: "media.image",
      layout: "layout",
      width: "width",
    },
    prepare({ image, layout, width }) {
      return {
        title: "Media Block",
        subtitle: `${layout === "double" ? "Double" : "Single"} · ${width === "fullWidth" ? "Full Width" : "Centered"}`,
        media: image,
      };
    },
  },
});
