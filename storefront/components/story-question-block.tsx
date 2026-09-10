import { CustomPortableText } from "./custom-portable-text";
import { PortableTextBlock } from "next-sanity";

type StoryQuestionBlockProps = {
  block: {
    question?: string;
    answerer?: string;
    answer?: PortableTextBlock[];
  };
};

export function StoryQuestionBlock({ block }: StoryQuestionBlockProps) {
  if (!block.question) return null;
  return (
    <div className="story-question-block" style={{ maxWidth: "65ch", margin: "0 auto" }}>
      <p style={{ fontWeight: 500 }}>{block.question}</p>
      {block.answerer && (
        <p style={{ fontSize: "0.8rem", opacity: 0.5, margin: "0.25rem 0 1rem" }}>
          {block.answerer}
        </p>
      )}
      {block.answer && <CustomPortableText value={block.answer} />}
    </div>
  );
}
