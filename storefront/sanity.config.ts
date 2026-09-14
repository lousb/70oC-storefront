import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";

import { projectId, dataset } from "./sanity/api";
import { customDocumentActions } from "../studio/src/custom-document-action";
import { schemaTypes } from "../studio/src/schema-types";
import { structure } from "../studio/src/structure";
import { singletonTypes } from "../studio/src/structure/singletons";

// Embedded Studio, served at /studio directly on the live site (see
// app/studio/[[...tool]]/page.tsx) instead of redirecting to a separate
// standalone Studio deployment. Mirrors studio/sanity.config.ts as closely
// as possible; kept in sync by hand since the two workspaces are separate
// npm packages and can't share this file outright.
//
// Deliberately NOT included yet:
// - @sanity/vision (the GROQ playground) — cosmetic, low priority to add.

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
  basePath: "/studio",
  name: "default",
  title: "70oC",
  projectId,
  dataset,
  plugins: [
    presentationTool({
      title: "Preview",
      previewUrl: {
        // No origin set — presentationTool falls back to the current
        // origin, which is right for an embedded Studio either in dev or
        // in production, whatever domain /studio is actually served from.
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
