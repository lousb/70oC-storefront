import { Link } from "next-view-transitions";
import s from "./floating-logo.module.css";

// The floating "70°C" wordmark: three independent SVG pieces (7 / 0 / OC)
// rather than one combined graphic, so each can be positioned (and later
// animated) on its own without warping as viewport height changes — sizing
// below is driven by vw, never vh.
//
// Plain <img> (not next/image) — these are simple static SVGs and
// next/image's optimizer doesn't handle SVG sources without extra config.
// Note: an <img>-sourced SVG can't inherit page CSS, so each SVG file
// hardcodes its own white fill rather than using currentColor here.
//
// Fixed + mix-blend-mode: difference on the layer means the mark is
// always legible against whatever's behind it (reads black on a white
// background, white on the black footer, etc.) with no manual color
// logic needed as the user scrolls.
//
// Each glyph is wrapped in its own Link to "/" with pointer-events
// re-enabled ONLY on that link — .layer and .gridLayer stay
// pointer-events: none, so the click target is exactly the visible
// SVG pixels, not the invisible space around/between them.
//
// This is only the logo — the rest of the header (nav, cart, links) is
// untouched and handled separately in <Header/>.
export function FloatingLogo() {
  return (
    <div className={s.layer}>
      <Link href="/" aria-label="70oC — Home" className={`${s.hit} ${s.seven}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/7.svg" alt="" className={s.icon} />
      </Link>
      <div className={s.gridLayer}>
        <Link href="/" aria-label="70oC — Home" className={`${s.hit} ${s.zero}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/0.svg" alt="" className={s.icon} />
        </Link>
        <Link href="/" aria-label="70oC — Home" className={`${s.hit} ${s.oc}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/oc.svg" alt="" className={s.icon} />
        </Link>
      </div>
    </div>
  );
}
