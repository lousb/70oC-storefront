// Snapshots what's currently on screen into a canvas, so the fog shader can
// blur/refract the real page behind the glass (WebGL can't read the DOM).
//
// Uses modern-screenshot (SVG foreignObject). To keep it quick:
//  - only the viewport (plus padY px above and below, so small scrolls stay
//    covered) is rendered: the body is offset by the scroll position
//  - anything entirely below the fold is skipped
//  - <img>s outside the viewport get a 1px placeholder instead of being fetched
//  - fixed layers that sit ABOVE the fog (header, logo, cart, panels) are left
//    out, since they stay sharp on top of it anyway
// Elements marked data-fog-ignore are always left out.
import { createContext, domToCanvas } from "modern-screenshot";

export type PageCapture = {
  canvas: HTMLCanvasElement;
  scrollX: number;
  scrollY: number;
  /** extra CSS px captured above / below the viewport */
  padTop: number;
  padBottom: number;
};

const PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export async function capturePage({
  scale = 0.5,
  zAbove = 450,
  padY = 200,
}: { scale?: number; zAbove?: number; padY?: number } = {}): Promise<PageCapture> {
  const sx = window.scrollX;
  const sy = window.scrollY;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Never capture above the top of the page
  const pad = Math.max(0, Math.min(padY, sy));
  const padBottom = padY;
  const margin = padBottom + vh * 0.25;

  const visible = new Set<string>();
  const offscreen = new Set<string>();
  document.querySelectorAll("img").forEach((img) => {
    const r = img.getBoundingClientRect();
    const inView = r.bottom > -pad - 50 && r.top < vh + margin && r.right > 0 && r.left < vw;
    for (const url of [img.currentSrc, img.src]) if (url) (inView ? visible : offscreen).add(url);
  });

  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const isClear = (c: string) => c === "transparent" || c === "rgba(0, 0, 0, 0)";
  const backgroundColor = !isClear(bodyBg) ? bodyBg : !isClear(htmlBg) ? htmlBg : "#ffffff";

  // createContext first waits for every <img> on the page to load. Lazy images
  // below the fold never do until you scroll to them, so with the normal
  // timeout that wait alone took ~10s. Everything on screen has already
  // loaded, so give that wait 100ms, then restore the real timeout for
  // fetching/embedding the assets.
  const context = await createContext(document.body, {
    autoDestruct: true,
    scale,
    width: vw,
    height: vh + pad + padBottom,
    backgroundColor,
    timeout: 100,
    features: { restoreScrollPosition: true },
    // Shift the page so the current viewport lands at the top of the snapshot.
    // overflow: visible matters - the site's <body> is overflow: hidden auto, so
    // in the snapshot it's a box clipped to its own (fixed) height, and anything
    // scrolled further than that came out blank white.
    style: { marginTop: `${-(sy - pad)}px`, marginLeft: `${-sx}px`, overflow: "visible" },
    filter: (node) => {
      if (!(node instanceof Element)) return true;
      if (node.hasAttribute("data-fog-ignore")) return false;
      const cs = getComputedStyle(node);
      if (cs.position === "fixed") {
        const z = parseInt(cs.zIndex, 10);
        return Number.isNaN(z) || z < zAbove;
      }
      if (cs.display === "contents") return true;
      const r = node.getBoundingClientRect();
      return !(r.height > 0 && r.top > vh + margin);
    },
    fetchFn: async (url) => (offscreen.has(url) && !visible.has(url) ? PLACEHOLDER : false),
  });
  context.timeout = 8000;
  const canvas = await domToCanvas(context);

  return { canvas, scrollX: sx, scrollY: sy, padTop: pad, padBottom };
}
