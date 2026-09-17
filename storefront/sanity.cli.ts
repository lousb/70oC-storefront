/**
 * Sanity CLI config for the storefront workspace, needed only so the
 * "sanity typegen generate" step (run via the predev/prebuild npm
 * scripts) can find a project/dataset to introspect — the actual Studio
 * config (and schema) lives in the separate ../studio workspace; see
 * sanity-typegen.json's "schema" path, which points at its extracted
 * ../studio/schema.json rather than any config here.
 * Learn more: https://www.sanity.io/docs/cli
 */

import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "<your project ID>";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  autoUpdates: true,
});
