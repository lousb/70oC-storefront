"use client";

import { useEffect, useRef, useState } from "react";
import s from "./footer.module.css";

// Mirrors HOME_CATEGORIES in studio/src/constants.ts — see footer.tsx for
// why this list is duplicated here rather than imported (storefront and
// studio are separate packages). Icon files live in
// public/icons/categories/, copied from Set-Up-Components/Footer/Assets.
const CATEGORY_ICONS = [
  { title: "Pressure", slug: "pressure" },
  { title: "Flow", slug: "flow" },
  { title: "Momentum", slug: "momentum" },
  { title: "Repetition", slug: "repetition" },
  { title: "Balance", slug: "balance" },
  { title: "Bloom", slug: "bloom" },
];

// Split out as its own client component because it needs an
// IntersectionObserver to trigger the desktop slide-in-from-the-top
// reveal once it scrolls into view — Footer itself is a server component
// (it awaits the Sanity fetch), so this bit of interactivity has to live
// separately. The reveal is CSS-only beyond the "in view" class: on
// mobile, .iconRowInView has no matching rule, so this is a no-op there.
export default function FooterIconRow() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${s.iconRow} ${inView ? s.iconRowInView : ""}`}>
      {CATEGORY_ICONS.map((category, i) => (
        // Assumption: each icon links to its Home page section — adjust
        // once the real destination (e.g. a filtered shop view) is known.
        // Staggered opacity reveal - each icon's own transition-delay
        // (see .iconLink in footer.module.css) fades it in a beat after
        // the last, instead of the whole row fading in as one block.
        <a
          key={category.slug}
          href={`/#${category.slug}`}
          aria-label={category.title}
          className={s.iconLink}
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          <img
            src={`/icons/categories/${category.slug}.svg`}
            alt=""
            width={40}
            height={40}
          />
        </a>
      ))}
    </div>
  );
}
