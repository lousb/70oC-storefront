import { defineArrayMember, defineType } from "sanity";

// Rich text for a Question block's Answer. Deliberately minimal to match
// the story layout: plain paragraphs only (no headings / lists - the
// first paragraph sits flush, every following paragraph is indented one
// column automatically), bold/italic, and inline Footnotes.
export const storyAnswerContent = defineType({
  name: "storyAnswerContent",
  title: "Answer",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [],
      },
      of: [defineArrayMember({ type: "storyFootnote" })],
    }),
  ],
});
