import { redirect } from "next/navigation";

import { studioUrl } from "../../sanity/api";

/**
 * Studio lives in its own separate workspace (../studio at the monorepo
 * root, its own Vite dev server / deployment) instead of being embedded
 * in this Next.js app. This route is just a convenience redirect so
 * bookmarks/links to /studio on the site still land somewhere useful.
 */
export default function StudioRedirect() {
  redirect(studioUrl);
}
