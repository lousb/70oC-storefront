import s from "./story-article.module.css";

// Header / Pull Quote - large serif across the text column.
export function StoryHeaderBlock({
  block,
  className = "",
}: {
  block: { text?: string };
  className?: string;
}) {
  if (!block.text) return null;
  return (
    <div className={`${s.grid} ${className}`}>
      <h2 className={s.pullQuote}>{block.text}</h2>
    </div>
  );
}
