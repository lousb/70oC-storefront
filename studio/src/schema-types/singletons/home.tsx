import { defineField, defineType } from "sanity";

/**
 * Home page. Made up of 6 fixed sections (Pressure, Flow, Momentum, Repetition,
 * Balance, Bloom) — each with the same shape (see objects/home/home-section.ts).
 * The section names/order are locked; only the content within each is editable.
 */
export const home = defineType({
  name: "home",
  type: "document",
  __experimental_formPreviewTitle: false,
  fields: [
    defineField({
      name: "pressure",
      title: "Pressure",
      type: "homeSection",
      initialValue: { sectionName: "PRESSURE" },
    }),
    defineField({
      name: "flow",
      title: "Flow",
      type: "homeSection",
      initialValue: { sectionName: "FLOW" },
    }),
    defineField({
      name: "momentum",
      title: "Momentum",
      type: "homeSection",
      initialValue: { sectionName: "MOMENTUM" },
    }),
    defineField({
      name: "repetition",
      title: "Repetition",
      type: "homeSection",
      initialValue: { sectionName: "REPETITION" },
    }),
    defineField({
      name: "balance",
      title: "Balance",
      type: "homeSection",
      initialValue: { sectionName: "BALANCE" },
    }),
    defineField({
      name: "bloom",
      title: "Bloom",
      type: "homeSection",
      initialValue: { sectionName: "BLOOM" },
    }),
    defineField({
      name: "pageSeo",
      type: "pageSeo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home" }),
  },
});
