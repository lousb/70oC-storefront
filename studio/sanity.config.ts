import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { customDocumentActions } from "./src/custom-document-action";
import { schemaTypes } from "./src/schema-types";
import { structure } from "./src/structure";
import { singletonTypes } from "./src/structure/singletons";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "5d2pzqv7";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";
const SANITY_STUDIO_PREVIEW_URL =
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:3000";

const homeLocation = { title: "Home", href: "/" } satisfies DocumentLocation;
const shopLocation = { title: "Shop", href: "/products" } satisfies DocumentLocation;

function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case "product":
      return slug ? `/products/${slug}` : undefined;
    case "page":
      return slug ? `/${slug}` : undefined;
    case "home":
      return "/";
    case "shop":
      return "/products";
    default:
      console.warn("Invalid document type:", documentType);
      return undefined;
  }
}

export default defineConfig({
  name: "default",
  title: "70oC",
  projectId,
  dataset,
  plugins: [
    presentationTool({
      title: "Preview",
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: {
        mainDocuments: defineDocuments([
          {
            route: "/",
            filter: `_type == "home"`,
          },
          {
            route: "/products",
            filter: `_type == "shop"`,
          },
          {
            route: "/:slug",
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
          {
            route: "/products/:slug",
            filter: `_type == "product" && slug.current == $slug || _id == $slug`,
          },
          {
            route: "/archive",
            filter: `_type == "archive"`,
          },
          {
            route: "/archive/:slug",
            filter: `_type == "post" && slug.current == $slug`,
          },
        ]),
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: "This document is used on all pages",
            tone: "positive",
          }),
          home: defineLocations({
            locations: [homeLocation],
          }),
          shop: defineLocations({
            locations: [shopLocation],
          }),
          page: defineLocations({
            select: { name: "name", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || "Untitled",
                  href: resolveHref("page", doc?.slug)!,
                },
              ],
            }),
          }),
          product: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: resolveHref("product", doc?.slug)!,
                },
                { title: "Home", href: "/" } satisfies DocumentLocation,
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
          archive: defineLocations({
            locations: [{ title: "Archive", href: "/archive" }],
          }),
          post: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || "Untitled", href: `/archive/${doc?.slug}` }],
            }),
          }),
        },
      },
    }),
    structureTool({ structure }),
    visionTool({ title: "API" }),
    colorInput(),
    customDocumentActions(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        ({ schemaType }) => !singletonTypes.has(schemaType) && schemaType !== "productInfoBlock",
      ),
  },
  tools: (prev, context) =>
    prev.filter((tool) => {
      if (tool.name === "schedules") return false;
      if (!context.currentUser && tool.name === "presentation") return false;
      return true;
    }),
});
