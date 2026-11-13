import type { Metadata } from "next";
import FogHoverLab from "../../../components/lab/fog-hover/fog-hover-lab";

// Test-only page for the sauna fog hover experiment. Not linked from the
// site, not in the sitemap, and kept out of search results.
export const metadata: Metadata = {
  title: "Lab: Fog hover",
  robots: { index: false, follow: false },
};

export default function FogHoverLabPage() {
  return <FogHoverLab />;
}
