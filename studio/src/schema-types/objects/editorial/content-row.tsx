import { defineField, defineType } from "sanity";

export const contentRow = defineType({
  name: "contentRow",
  title: "Content Row",
  type: "object",
  fields: [
    defineField({
      name: "columns",
      title: "Columns",
      type: "array",
      description: "Add up to 4 columns. A 2-column image block must have an empty slot to its right. The 4th column cannot span 2.",
      validation: (Rule) =>
  Rule.custom((columns: any[] | undefined) => {
    if (!columns || columns.length === 0) return true;

    let position = 0;
    let i = 0;

    while (i < columns.length) {
      const col = columns[i];
      const span = col._type === "imageBlock" ? (col.columnSpan || 1) : 1;

      // Rule: 4th column (position 3, 0-indexed) cannot be span 2
      if (position === 3 && span === 2) {
        return "The 4th column cannot span 2 columns — there is no room.";
      }

      // Rule: a span-2 block needs the next slot to be empty
      if (span === 2) {
        const next = columns[i + 1];
        if (!next || next._type !== "emptyBlock") {
          return `A 2-column image block at position ${position + 1} must be followed by an empty block.`;
        }
        // consume both this block and the empty placeholder
        position += 2;
        i += 2; // skip the empty block in the loop
        continue;
      }

      position += 1;
      i += 1;

      if (position > 4) {
        return "Total column spans exceed 4. Reduce the number of columns or column spans.";
      }
    }

    return true;
  }),
      of: [
        { type: "productBlock" },
        { type: "imageBlock" },
        {
          type: "object",
          name: "emptyBlock",
          title: "Empty Block",
          fields: [
            defineField({
              name: "label",
              title: "Label (internal only)",
              type: "string",
              initialValue: "Empty column",
            }),
          ],
          preview: {
            prepare: () => ({ title: "Empty Column" }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { columns: "columns" },
    prepare({ columns }) {
      const count = columns?.length || 0;
      return {
        title: "Content Row",
        subtitle: `${count} of 4 column${count !== 1 ? "s" : ""}`,
      };
    },
  },
});