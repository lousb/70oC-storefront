type StoryHeaderBlockProps = {
  block: {
    text?: string;
  };
};

export function StoryHeaderBlock({ block }: StoryHeaderBlockProps) {
  if (!block.text) return null;
  return (
    <h2 className="story-header-block" style={{ maxWidth: "65ch", margin: "0 auto" }}>
      {block.text}
    </h2>
  );
}
