import { defineField, defineType } from "sanity";

// Q&A block. Desktop layout (18-col grid):
//   Asker ("70oC") col 6 · Question cols 7-13
//   Answerer ("RE") col 7 · Answer cols 8-13 · footnotes cols 15-18
// Mobile (8-col grid): labels col 1, text cols 3-8, footnotes listed
// under the answer.
//
// "Continues previous answer" is for an answer that carries on after a
// Header / Pull Quote breaks into it: the labels and question are
// hidden and the first paragraph is indented like any follow-on
// paragraph.
export const storyQuestionBlock = defineType({
  name: "storyQuestionBlock",
  title: "Question Block",
  type: "object",
  fields: [
    defineField({
      name: "continuation",
      title: "Continues previous answer",
      description:
        "Turn on when this follows a Pull Quote mid-answer. Hides the question and labels.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "asker",
      title: "Asker",
      description: "Label beside the question.",
      type: "string",
      initialValue: "70oC",
      hidden: ({ parent }) => !!parent?.continuation,
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "text",
      rows: 2,
      hidden: ({ parent }) => !!parent?.continuation,
      validation: (Rule) =>
        Rule.custom((value, context: any) =>
          context.parent?.continuation || value ? true : "Question is required",
        ),
    }),
    defineField({
      name: "answerer",
      title: "Answerer",
      description: "Initials beside the answer, e.g. RE.",
      type: "string",
      hidden: ({ parent }) => !!parent?.continuation,
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description:
        "New paragraph = new indent. Use the Footnote button in the toolbar to add a numbered note at the cursor.",
      type: "storyAnswerContent",
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "answerer", continuation: "continuation", answer: "answer" },
    prepare({ title, subtitle, continuation, answer }) {
      const firstText =
        answer?.[0]?.children?.map((c: any) => c.text || "").join("") || "";
      if (continuation) {
        return { title: firstText.slice(0, 80) || "Answer (continued)", subtitle: "Answer (continued)" };
      }
      return {
        title: title || "Untitled Question",
        subtitle: subtitle ? `Question · answered by ${subtitle}` : "Question Block",
      };
    },
  },
});
