import { StoryHeaderBlock } from "./story-header-block";
import { StoryMediaBlock } from "./story-media-block";
import { StoryQuestionBlock } from "./story-question-block";

type Block = { _key: string; _type: string; [key: string]: any };

export function BlogPageBuilder({ blocks }: { blocks: Block[] }) {
  let mediaIndex = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
      {blocks.map((block) => {
        if (block._type === "storyMediaBlock") {
          mediaIndex += 1;
          return <StoryMediaBlock key={block._key} block={block as any} figureIndex={mediaIndex} />;
        }
        if (block._type === "storyHeaderBlock") {
          return <StoryHeaderBlock key={block._key} block={block as any} />;
        }
        if (block._type === "storyQuestionBlock") {
          return <StoryQuestionBlock key={block._key} block={block as any} />;
        }
        return null;
      })}
    </div>
  );
}
