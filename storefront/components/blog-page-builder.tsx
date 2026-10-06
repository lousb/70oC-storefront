import { StoryHeaderBlock } from "./story-header-block";
import { StoryMediaBlock } from "./story-media-block";
import { StoryQuestionBlock } from "./story-question-block";
import s from "./story-article.module.css";

type Block = { _key: string; _type: string; [key: string]: any };

const isMedia = (b?: Block) => b?._type === "storyMediaBlock";

// Story body. Vertical rhythm comes from the design: text-to-text blocks
// sit ~30px apart, anything next to a media block gets the big media gap.
export function BlogPageBuilder({
  blocks,
  footnoteNumbers,
  mediaAnchors,
}: {
  blocks: Block[];
  footnoteNumbers: Record<string, number>;
  mediaAnchors: Record<string, [string, string?]>;
}) {
  return (
    <div className={s.body}>
      {blocks.map((block, i) => {
        const prev = blocks[i - 1];
        const gap =
          isMedia(block) || isMedia(prev)
            ? s.gapMedia
            : i === 0
            ? s.gapFirst
            : s.gapText;

        if (block._type === "storyMediaBlock") {
          return (
            <StoryMediaBlock
              key={block._key}
              block={block as any}
              anchorIds={mediaAnchors[block._key]}
              className={gap}
            />
          );
        }
        if (block._type === "storyHeaderBlock") {
          return <StoryHeaderBlock key={block._key} block={block as any} className={gap} />;
        }
        if (block._type === "storyQuestionBlock") {
          return (
            <StoryQuestionBlock
              key={block._key}
              block={block as any}
              footnoteNumbers={footnoteNumbers}
              className={gap}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
