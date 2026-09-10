import { defineLive } from "next-sanity";
import { client } from "../../sanity/client";
import { token } from "../../sanity/token";

/**
 * Use defineLive to enable automatic revalidation and refreshing of your fetched content
 * Learn more: https://github.com/sanity-io/next-sanity?tab=readme-ov-file#1-configure-definelive
 */

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
  // Remove the fetchOptions entirely, or set revalidate to 0
  fetchOptions: { revalidate: 0 },
});
