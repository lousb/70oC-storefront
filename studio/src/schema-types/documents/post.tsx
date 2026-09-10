import { defineField, defineType } from "sanity";
import { HOME_CATEGORIES } from "../../constants";

export const post = defineType({
  name: "post",
  title: "Story",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authors",
      title: "Author(s)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "Displayed as Month, Year on the site.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "readDuration",
      title: "Read Duration",
      description: "In minutes.",
      type: "number",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: HOME_CATEGORIES,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "media",
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Builder",
      type: "array",
      of: [
        { type: "storyMediaBlock" },
        { type: "storyHeaderBlock" },
        { type: "storyQuestionBlock" },
      ],
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      media: "cover.image",
    },
    prepare({ title, date, media }) {
      return {
        title: title || "Untitled Story",
        subtitle: date,
        media,
      };
    },
  },
});
