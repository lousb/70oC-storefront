import { defineField, defineType } from "sanity";

// Video (Mux) support was removed — this object is image-only. The
// mediaType field is kept (rather than dropping straight to a bare image
// field) so existing content shaped as { mediaType, image } — and every
// GROQ projection that reads media.mediaType / media.image — keeps working
// unchanged; it just now only ever resolves to "image".
export const media = defineType({
  name: "media",
  title: "Media",
  type: "object",
  fields: [
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [{ title: "Image", value: "image" }],
        layout: "radio",
      },
      initialValue: "image",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "picture",
      hidden: ({ parent }) => parent?.mediaType !== "image",
      validation: (Rule) =>
        Rule.custom((value: any, context) => {
          const parent = context.parent as any;
          // if no mediaType set at all, skip
          if (!parent?.mediaType) return true;
          if (parent?.mediaType !== "image") return true;
          if (!value?.asset) return "An image is required";
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      image: "image",
    },
    prepare({ image }) {
      return {
        title: "Image",
        media: image,
      };
    },
  },
});
