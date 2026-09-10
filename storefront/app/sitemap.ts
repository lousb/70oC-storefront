import type { MetadataRoute } from "next";

import { sanityFetch } from "../data/sanity";
import {
  ALL_COLLECTION_PAGES_SLUGS,
  ALL_PAGES_SLUGS,
  ALL_POST_SLUGS,
  ALL_PRODUCT_PAGES_SLUGS,
  SETTINGS_QUERY,
} from "../data/sanity/queries";

function getBaseUrl(metadataBase?: string | null) {
  if (metadataBase) return metadataBase.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    { data: settings },
    { data: products },
    { data: collections },
    { data: pages },
    { data: posts },
  ] = await Promise.all([
    sanityFetch({ query: SETTINGS_QUERY, stega: false }),
    sanityFetch({ query: ALL_PRODUCT_PAGES_SLUGS, stega: false }),
    sanityFetch({ query: ALL_COLLECTION_PAGES_SLUGS, stega: false }),
    sanityFetch({ query: ALL_PAGES_SLUGS, stega: false }),
    sanityFetch({ query: ALL_POST_SLUGS, stega: false }),
  ]);

  const baseUrl = getBaseUrl(settings?.metadataBase);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/collections`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/archive`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = (collections ?? []).map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const pageRoutes: MetadataRoute.Sitemap = (pages ?? []).map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${baseUrl}/archive/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...pageRoutes,
    ...postRoutes,
  ];
}
