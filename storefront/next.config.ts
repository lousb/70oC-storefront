import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // The `sanity` package (used only by the embedded /studio route's
    // config + custom document actions) internally imports React's native
    // `useEffectEvent` hook, which the react-server webpack build condition
    // strips out - causing "useEffectEvent is not exported from react" during
    // the build even though the Studio page/config is wrapped in a "use
    // client" boundary. Marking it external here tells Next.js to leave it as
    // a plain Node require() at runtime instead of webpack-bundling it against
    // that condition, which sidesteps the incompatibility entirely.
    serverExternalPackages: ["sanity"],
  experimental: {
        reactCompiler: { compilationMode: "annotation" }, // Sanity Studio's own components (pulled in via studio/src/custom-document-action) weren't authored for React Compiler and get miscompiled under the default "infer" mode, crashing /studio at runtime with "Cannot read properties of null (reading 'useMemoCache')". Annotation mode only compiles files that explicitly opt in with a "use memo" directive, so Studio's code is left untouched.
    viewTransition: true,
    // typedRoutes: true,
  },
  logging: {
    fetches: {
      // fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
  minimumCacheTTL: 31536000,
  formats: ["image/avif", "image/webp"],
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cdn.shopify.com",
    },
    {
      protocol: "https",
      hostname: "cdn.sanity.io",
    },
  ],
  unoptimized: true, // add this temporarily
},
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: "false",
  },
};

export default nextConfig;
