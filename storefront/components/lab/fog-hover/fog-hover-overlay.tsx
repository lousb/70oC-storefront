"use client";

// Turns the sauna fog on over the real site for testing.
//
//   any-page?fog-hover       turn it on (stays on while you browse, this tab only)
//   any-page?fog-hover=off   turn it off (or press "Off" in the panel)
//
// It sits over the page content but under the header, logo and cart.
// The fog code (and three.js) is only downloaded once it's switched on,
// so normal visitors never load it. Not shown on /studio or /lab pages.

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const FogHoverSite = dynamic(() => import("./fog-hover-site"), { ssr: false });

const SESSION_KEY = "70oc-fog-hover-on";
const OFF_VALUES = ["off", "0", "false", "no"];

export function FogHoverOverlay() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let on = false;
    try {
      on = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (params.has("fog-hover")) {
      on = !OFF_VALUES.includes((params.get("fog-hover") ?? "").toLowerCase());
      try {
        if (on) sessionStorage.setItem(SESSION_KEY, "1");
        else sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
    }
    if (pathname.startsWith("/studio") || pathname.startsWith("/lab")) on = false;
    setActive(on);
  }, [pathname]);

  const turnOff = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has("fog-hover")) {
      url.searchParams.delete("fog-hover");
      window.history.replaceState(window.history.state, "", url);
    }
    setActive(false);
  };

  return active ? <FogHoverSite onClose={turnOff} /> : null;
}
