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
      name: "credits",
      title: "Author(s)",
      description:
        'Shown under the title as "Words: Name, Photos: Name". Add one row per credit.',
      type: "array",
      of: [
        {
          type: "object",
          name: "credit",
          fields: [
            defineField({
              name: "role",
              title: "Role",
              description: "e.g. Words, Photos, Interview",
              type: "string",
            }),
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        },
      ],
    }),
    // Legacy plain-string authors (pre credits rows). Hidden from
    // editors; the storefront only falls back to it when Credits is empty.
    defineField({
      name: "authors",
      title: "Authors (legacy)",
      type: "array",
      of: [{ type: "string" }],
      hidden: true,
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
      title: "Introduction",
      description:
        "Large serif standfirst under the hero. Also used as the excerpt on story cards.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "cover",
      title: "Hero Image",
      description:
        "Top of the story and story cards. Keeps its own aspect ratio (desktop: height-locked to the first screen).",
      type: "media",
    }),
    defineField({
      name: "pageBuilder",
      title: "Story Body",
      description:
        "Stack Question, Header / Pull Quote and Media blocks in reading order.",
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
