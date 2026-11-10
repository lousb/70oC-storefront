import { defineField, defineType } from "sanity";
import { HOME_CATEGORIES } from "../../../constants";
import { AnchorIconInput } from "../../../components/inputs/anchor-icon-input";

/**
 * Shared shape for each of the 6 fixed Home sections (Pressure, Flow, Momentum,
 * Repetition, Balance, Bloom). `anchorName` is the editable display name
 * used across the storefront. The section name (icon key) is locked and read-only here
 * so editors can't rename or mismatch a section — its value is one of the
 * upper-case HOME_CATEGORIES codes (e.g. "PRESSURE") set by the migration/
 * initialValue, kept upper-case to match what the rest of the app matches
 * against (see app/page.tsx). preview.prepare() below just reformats it to
 * Title Case for a nicer read in Studio's sections list and document title.
 */
export const homeSection = defineType({
  name: "homeSection",
  title: "Home Section",
  type: "object",
  fields: [
    defineField({
      name: "image1",
      title: "Image 1",
      type: "picture",
      description: "Slide 1 — shown with the (locked) Section Name.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "anchorName",
      title: "Anchor Name",
      type: "string",
      description:
        "Slide 1 — the name shown for this anchor everywhere on the site (home, shop filters, product pages, cart).",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description:
        "Which icon this anchor uses across the site. Each icon can only be used once. Products and stories in this anchor keep their tag when you switch icons.",
      options: { list: HOME_CATEGORIES, layout: "dropdown" },
      components: { input: AnchorIconInput },
    }),
    defineField({
      // Internal, permanent ID for this section. Products/stories store it
      // as `category`, so it never changes — the editable name and icon
      // above sit on top of it. Hidden to avoid confusion with the Icon.
      name: "sectionName",
      title: "Section ID",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "sectionIntro",
      title: "Section Introduction",
      type: "text",
      rows: 3,
      description: "Slide 2 — always a plain white background with this section's icon, no image.",
    }),
    defineField({
      name: "image3",
      title: "Image 3",
      type: "picture",
      description: "Slide 3 — shown with the Section Description.",
    }),
    defineField({
      name: "sectionDescription",
      title: "Section Description",
      type: "text",
      rows: 4,
      description: "Slide 3 — shown with Image 3.",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      description: "Optional — where this section should link to.",
    }),
  ],
  preview: {
    select: {
      sectionName: "sectionName",
      anchorName: "anchorName",
      icon: "icon",
      media: "image1",
    },
    prepare({ sectionName, anchorName, icon, media }) {
      // Studio-display only — reformats the stored upper-case code (e.g.
      // "PRESSURE") to Title Case ("Pressure"). The stored value itself
      // stays upper-case; nothing downstream that matches against it changes.
      const tc = (v?: string) => (v ? v.charAt(0) + v.slice(1).toLowerCase() : "");
      const title = anchorName?.trim() || tc(sectionName) || "Untitled";
      return { title, subtitle: `Icon: ${tc(icon || sectionName)}`, media };
    },
  },
});
