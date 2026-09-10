import { defineField, defineType } from "sanity";

export const storyQuestionBlock = defineType({
  name: "storyQuestionBlock",
  title: "Question Block",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "answerer",
      title: "Answerer",
      type: "string",
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "blockContent",
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "answerer" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled Question",
        subtitle: subtitle ? `Answered by ${subtitle}` : "Question Block",
      };
    },
  },
});
