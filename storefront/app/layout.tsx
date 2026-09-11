import "../styles/globals.css";

import type { Metadata } from "next";
import { VisualEditing } from "next-sanity";
import { draftMode } from "next/headers";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next"

import { DraftModeToast } from "./draft-mode-toast";

import { sanityFetch, SanityLive } from "../data/sanity";
import { HOME_QUERY, SETTINGS_QUERY } from "../data/sanity/queries";
import { resolveOpenGraphImage } from "../sanity/utils";
import { handleError } from "./client-utils";

import { Footer } from "../components/footer";
import GridOverlay from "../components/grid-overlay";
import { FloatingLogo } from "../components/floating-logo";
import { HeaderContent } from "../components/header-content";
import { HideOnStudio } from "../components/hide-on-studio";
import localFont from 'next/font/local'
import { CartProvider } from "./_cart/cart-context";
import { MobilePanelProvider } from "../components/mobile-panel-context";
import s from "./layout.module.css";

import { ViewTransitions } from 'next-view-transitions'
import LenisProvider from "../components/lenis-provider";
import { Suspense } from "react";

// Real ABC Rom trial font file, dropped into public/fonts/. Only a
// Regular weight is provided (trial), so there's a single face here —
// add more src entries (with weight/style) if further weights arrive.
// Exposed as --font-abc-rom, referenced from styles/globals.css.
const abcRom = localFont({
  src: '../public/fonts/ABCROM-Regular-Trial.otf',
  variable: '--font-abc-rom',
  display: 'swap',
})


/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: home }] = await Promise.all([
    sanityFetch({
      query: SETTINGS_QUERY,
      // Metadata should never contain stega
      stega: false,
    }),
    sanityFetch({
      query: HOME_QUERY,
      // Metadata should never contain stega
      stega: false,
    }),
  ]);
  const title = settings?.title || "70oC";
  const description = home?.pageSeo?.description || settings?.title || "70oC";

  const ogImage = resolveOpenGraphImage(home?.pageSeo?.ogImage);
  let metadataBase: URL | undefined = undefined;
  try {
    metadataBase = settings?.metadataBase
      ? new URL(settings.metadataBase)
      : undefined;
  } catch {
    // ignore
  }
  return {
    metadataBase,
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: description,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <ViewTransitions>
    <html lang="en" className={abcRom.variable}>
      <body>
        {/* Dev aid: Option/Alt + G toggles a red grid overlay to check layout against the column grid. */}
        <GridOverlay />
        {/* Floating, fixed "70°C" wordmark — first piece of the header. Hidden on /studio, which wants the full viewport to itself. */}
        <HideOnStudio>
          <FloatingLogo />
        </HideOnStudio>
        {/* The <Toaster> component is responsible for rendering toast notifications used in /app/client-utils.ts and /app/components/DraftModeToast.tsx */}
        <Toaster />
        {isDraftMode && (
          <>
            <DraftModeToast />
            {/*  Enable Visual Editing, only to be rendered when Draft Mode is enabled */}
            <VisualEditing />
          </>
        )}
        {/* The <SanityLive> component is responsible for making all sanityFetch calls in your application live, so should always be rendered. */}
        <SanityLive onError={handleError} />
        {/* We'll keep a static store to demonstrate functionality. For a complete e-commerce solution, the cart should have server state in the form of cookies */}
        <MobilePanelProvider>
        <CartProvider>
          <HideOnStudio>
            <Header />
          </HideOnStudio>
          <main>
            <Suspense fallback={null}>
            <LenisProvider>
              <div className="overlay"></div>
              <div className="overlay-shadow"></div>
              {children}
              </LenisProvider>
            </Suspense>
           </main>

          <HideOnStudio>
            <Footer />
          </HideOnStudio>
        </CartProvider>
        </MobilePanelProvider>
        <Analytics />
      </body>
    </html>
    </ViewTransitions>
  );
}

export async function Header() {
  const { data: settings } = await sanityFetch({ query: SETTINGS_QUERY });

  return (
    <header className={s.header}>
      <HeaderContent
        headerDescription={settings?.header?.headerDescription}
        // Same _key: string vs null looseness footer.tsx already lives
        // with when passing this query result to SanityLink.
        footerInfoLinks={settings?.footer?.infoLinks as any}
      />
    </header>
  );
}
