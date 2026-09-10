import { defineField, defineType } from "sanity";

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
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
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
defineField({
  name: "video",
  title: "Video",
  type: "mux.video",
  hidden: ({ parent }) => parent?.mediaType !== "video",
  validation: (Rule) =>
    Rule.custom((value: any, context) => {
      const parent = context.parent as any;
      // if no mediaType set at all, skip
      if (!parent?.mediaType) return true;
      if (parent?.mediaType !== "video") return true;
      if (!value?.asset?._ref) return "A video is required";
      return true;
    }),
}),
  ],
  preview: {
    select: {
      mediaType: "mediaType",
      image: "image",
      video: "video.asset.playbackId",
    },
    prepare({ mediaType, image, video }) {
      return {
        title: mediaType === "video" ? "Video" : "Image",
        subtitle: mediaType === "video"
          ? video ? `Playback ID: ${video.slice(0, 8)}...` : "No video uploaded"
          : "Image",
        media: mediaType === "image" ? image : undefined,
      };
    },
  },
});