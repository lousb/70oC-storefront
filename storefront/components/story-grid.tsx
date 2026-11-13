"use client";

import { useState } from "react";
import { StoryCard, type Story } from "./story-card";
import s from "./story-grid.module.css";

export function StoryGrid({
  stories,
  anchors: ANCHORS,
}: {
  stories: Story[];
  /** Anchor display names, in Home order (see lib/anchors.ts). */
  anchors: string[];
}) {
  const [anchor, setAnchor] = useState<string | null>(null);
  const [anchorOpen, setAnchorOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);

  // Only real topics (Sanity posts have none yet) - the filter hides if there are none.
  const topics = Array.from(new Set(stories.map((s) => s.topic).filter((t): t is string => !!t)));

  const filtered = stories.filter(
    (story) =>
      (anchor === null || story.category === anchor) &&
      (topic === null || story.topic === topic),
  );

  return (
    <div className={s.page}>
      <div className={s.bar}>
        <div className={s.barGroup}>
          <button
            type="button"
            className={s.barTrigger}
            onClick={() => setAnchorOpen((v) => !v)}
            aria-expanded={anchorOpen}
          >
            {anchor ?? "All Anchors"} +
          </button>
          {anchorOpen && (
            <div className={`${s.dropdown} ${s.dropdownLeft}`}>
              <button
                type="button"
                className={s.dropdownItem}
                data-active={anchor === null}
                onClick={() => {
                  setAnchor(null);
                  setAnchorOpen(false);
                }}
              >
                All Anchors
              </button>
              {ANCHORS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={s.dropdownItem}
                  data-active={anchor === a}
                  onClick={() => {
                    setAnchor(a);
                    setAnchorOpen(false);
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={s.barGroup} style={topics.length === 0 ? { visibility: "hidden" } : undefined}>
          <button
            type="button"
            className={`${s.barTrigger} ${s.plusTrigger}`}
            onClick={() => setTopicOpen((v) => !v)}
            aria-expanded={topicOpen}
          >
            <span>{topic ?? "All Topics"}</span>
            <span aria-hidden="true">+</span>
          </button>
          {topicOpen && (
            <div className={`${s.dropdown} ${s.dropdownRight}`}>
              <button
                type="button"
                className={s.dropdownItem}
                data-active={topic === null}
                onClick={() => {
                  setTopic(null);
                  setTopicOpen(false);
                }}
              >
                All Topics
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={s.dropdownItem}
                  data-active={topic === t}
                  onClick={() => {
                    setTopic(t);
                    setTopicOpen(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={s.empty}>No stories match those filters yet.</p>
      ) : (
        <div className={s.grid}>
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}
