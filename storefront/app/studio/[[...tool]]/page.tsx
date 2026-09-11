/**
 * Embedded Sanity Studio, served directly at /studio on this Next.js app
 * (see ../../../sanity.config.ts) instead of redirecting to a separately
 * hosted Studio deployment. Standard next-sanity App Router pattern.
 *
 * This stays a plain Server Component (so `metadata`/`viewport` and the
 * `force-static` route config below are valid) and just renders
 * ./StudioClient, which is where sanity.config.ts actually gets imported
 * and <NextStudio> rendered — see that file for why.
 */
import StudioClient from "./StudioClient";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <StudioClient />;
}
