"use client";

/**
 * Actual Studio render, isolated in its own client component.
 *
 * sanity.config.ts pulls in custom document actions (shopify-delete.tsx
 * etc.) which use React hooks and call into the `sanity` package's
 * runtime (definePlugin, useClient, ...). That runtime imports
 * `useEffectEvent` directly from `react`, which is only available under
 * React's default/browser build — not the `react-server` build Next.js
 * uses to compile Server Components. Importing `config` here, inside a
 * "use client" file, keeps sanity.config.ts's whole import graph on the
 * client bundle so it never gets resolved against the react-server
 * condition.
 */
import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

export default function StudioClient() {
  return <NextStudio config={config} />;
}
