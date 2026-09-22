"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "./lenis-store";
import { LENIS_READY_EVENT } from "./lenis-provider";
import { getSnapSections, getSnapSectionTops } from "../lib/home-sections";

// Snaps the home page to its section boundaries (the 6 anchor sections +
// footer, each marked with data-snap-section).
//
// The goal here isn't "snapping" in the sense of a separate motion that
// kicks in after the fact — it's for the scroll the user is already doing
// to simply arrive at the anchor, as if that's where it was always headed.
// A few things make that work:
//
// 1. We react to the *user* stopping, not to Lenis finishing. For wheel
//    input (smoothWheel is on, 1.2s duration) Lenis keeps a running
//    `targetScroll` — the exact place its own in-flight animation is
//    already heading, updated on every wheel tick. We debounce on wheel
//    events themselves (via the `virtual-scroll` event Lenis emits) and,
//    once they stop arriving, snap-correct based on that targetScroll —
//    not on lenis.scroll (the current animated position) and not by
//    waiting for the animation to actually finish. So the correction can
//    fire well before Lenis's own glide would otherwise have settled.
//
// 2. We never override easing on our own scrollTo call — left unset, it
//    falls back to Lenis's own configured easing, the exact curve already
//    driving the scroll. And if the section the user is already heading
//    to is the right one, our computed target equals lenis.targetScroll
//    exactly, so Lenis's scrollTo treats it as a no-op — nothing to feel,
//    because nothing needed correcting.
//
// 3. Duration scales with how far the correction actually has to travel,
//    as a share of the section it's happening in — not a flat duration
//    regardless of distance. Stopping 10% into a section and settling
//    back needs a quick, small correction; stopping just past the 20%
//    threshold and continuing on needs something closer to the full
//    scroll duration. Using Lenis's own configured duration as the
//    "full section" pace keeps the correction's speed consistent with
//    how fast Lenis was already moving you.
//
// Touch is different: with syncTouch off (this project's config), Lenis
// doesn't drive touch scrolling at all — it hands off to the browser's
// native momentum entirely and just mirrors `scroll`/`targetScroll` to
// wherever that native scroll is on every native scroll event. There's no
// Lenis-side "heading towards" to read early, and correcting mid-native-
// momentum would fight the browser's own physics rather than blend into
// it. So touch (and anything else Lenis doesn't drive — keyboard,
// scrollbar drag) is handled on the native `scrollend` event instead: it
// fires once that motion has actually finished, and we snap from wherever
// it rested using the same distance-scaled, Lenis-eased approach.
const ADVANCE_THRESHOLD = 0.2;
const WHEEL_SETTLE_DELAY = 120; // ms of no wheel input before we treat the user as "stopped"
// Floor for correction duration, in seconds. Below ~0.5s an eased scroll
// reads as a snap/jump-cut rather than a glide, no matter how short the
// distance is — so tiny corrections still get a duration comfortably
// above that, they just don't get the *full* section-crossing duration.
const MIN_DURATION = 0.6;

// Resolves which section index a resting scroll position should land on,
// relative to `fromIndex` (the section last snapped to): you need to
// cross ADVANCE_THRESHOLD (20%) into the neighboring section — up or
// down — before it commits there, otherwise it settles back to the
// section you started from. That's necessarily relative to a
// remembered "current" section, not a stateless nearest-point lookup.
//
// Also returns the height of the section the position was progressing
// through, so the caller can scale correction duration by how far into
// that section the scroll actually was.
function resolveSnapIndex(fromIndex: number, target: number, tops: number[]) {
  let idx = fromIndex;
  let sectionHeight: number | undefined;

  if (target >= tops[idx]) {
    while (idx < tops.length - 1 && tops[idx + 1] <= target) idx++;
    if (idx < tops.length - 1) {
      sectionHeight = tops[idx + 1] - tops[idx];
      const progress = sectionHeight > 0 ? (target - tops[idx]) / sectionHeight : 0;
      if (progress > ADVANCE_THRESHOLD) idx += 1;
    }
  } else {
    while (idx > 0 && tops[idx - 1] > target) idx--;
    if (idx > 0) {
      sectionHeight = tops[idx] - tops[idx - 1];
      const progress = sectionHeight > 0 ? (tops[idx] - target) / sectionHeight : 0;
      if (progress > ADVANCE_THRESHOLD) idx -= 1;
    }
  }

  return { index: idx, sectionHeight };
}

export function HomeScrollSnap() {
  const currentIndexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let detach: (() => void) | undefined;

    function attach() {
      const lenis = getLenis();
      if (!lenis || cancelled) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) return;

      let wheelSettleTimer: number | undefined;

      // `current` is whichever position means "where things are settling" —
      // targetScroll for a wheel-driven correction (Lenis's own in-flight
      // destination), lenis.scroll for a scrollend-driven one (an actual
      // rest position, native momentum already done).
      const snapTo = (current: number) => {
        const sections = getSnapSections();
        if (sections.length < 2) return;

        const tops = getSnapSectionTops(sections);
        const fromIndex = Math.min(currentIndexRef.current, tops.length - 1);
        const { index, sectionHeight } = resolveSnapIndex(fromIndex, current, tops);
        currentIndexRef.current = index;

        const target = tops[index];
        const distance = Math.abs(target - current);
        if (distance < 1) return;

        // Interpolate between MIN_DURATION (a small nudge, e.g. settling
        // back from 10% into a section) and Lenis's own full configured
        // duration (a correction that's carrying most of the way into the
        // next section) — using sqrt of the distance ratio rather than a
        // straight line, so short corrections land well clear of
        // "too-short-to-glide" territory instead of scaling all the way
        // down to near-zero.
        const baseDuration = lenis.options.duration ?? 1.2;
        const travelHeight = sectionHeight && sectionHeight > 0 ? sectionHeight : window.innerHeight;
        const ratio = Math.min(1, distance / travelHeight);
        const duration = MIN_DURATION + (baseDuration - MIN_DURATION) * Math.sqrt(ratio);

        // No easing passed — inherits Lenis's own, so this still reads as
        // the same motion, just paced to the distance actually travelled.
        lenis.scrollTo(target, { duration });
      };

      const onVirtualScroll = ({ event }: { event: WheelEvent | TouchEvent }) => {
        if (!event.type.includes("wheel")) return;
        window.clearTimeout(wheelSettleTimer);
        wheelSettleTimer = window.setTimeout(() => {
          snapTo(lenis.targetScroll);
        }, WHEEL_SETTLE_DELAY);
      };

      const onScrollEnd = () => {
        // Covers touch/native-momentum rest, and anything else Lenis
        // doesn't drive itself. For wheel input this also fires once our
        // own correction above lands — harmless, since by then
        // current === target and the distance guard skips it.
        window.clearTimeout(wheelSettleTimer);
        snapTo(lenis.scroll);
      };

      const unsubscribeVirtualScroll = lenis.on("virtual-scroll", onVirtualScroll);
      window.addEventListener("scrollend", onScrollEnd);

      detach = () => {
        window.clearTimeout(wheelSettleTimer);
        unsubscribeVirtualScroll();
        window.removeEventListener("scrollend", onScrollEnd);
      };
    }

    if (getLenis()) {
      attach();
    } else {
      // The provider that creates the shared Lenis instance is a parent
      // of this component, and React mounts/runs child effects before
      // parent effects — so on first mount the instance can easily not
      // exist yet. Wait for the ready event it fires once it does.
      window.addEventListener(LENIS_READY_EVENT, attach, { once: true });
      detach = () => window.removeEventListener(LENIS_READY_EVENT, attach);
    }

    return () => {
      cancelled = true;
      detach?.();
    };
  }, []);

  return null;
}
