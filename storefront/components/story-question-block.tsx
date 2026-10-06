import { PortableText, type PortableTextBlock, type PortableTextComponents } from "next-sanity";
import s from "./story-article.module.css";

type Footnote = { _key: string; _type: "storyFootnote"; text?: string };

type StoryQuestionBlockProps = {
  block: {
    continuation?: boolean | null;
    asker?: string | null;
    question?: string | null;
    answerer?: string | null;
    answer?: PortableTextBlock[] | null;
  };
  // _key -> story-wide footnote number, computed once in page.tsx so
  // numbering runs in reading order across every block.
  footnoteNumbers: Record<string, number>;
  className?: string;
};

function collectFootnotes(answer: PortableTextBlock[] | null | undefined): Footnote[] {
  const out: Footnote[] = [];
  for (const b of answer ?? []) {
    for (const child of ((b as any).children ?? []) as any[]) {
      if (child?._type === "storyFootnote") out.push(child);
    }
  }
  return out;
}

export function StoryQuestionBlock({ block, footnoteNumbers, className = "" }: StoryQuestionBlockProps) {
  const continuation = !!block.continuation;
  if (!continuation && !block.question && !block.answer?.length) return null;

  const footnotes = collectFootnotes(block.answer);

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => <p className={s.para}>{children}</p>,
    },
    types: {
      // Inline: "(n)" marker + the desktop margin note. The note is
      // absolutely positioned with only `left` set, so it keeps the
      // vertical position of the line it sits in (its static position)
      // and lines up with the reference automatically.
      storyFootnote: ({ value }: { value: Footnote }) => {
        const n = footnoteNumbers[value._key];
        if (!n) return null;
        return (
          <>
            <sup className={s.fnRef}>({n})</sup>
            <span className={s.sidenote} aria-hidden="true">
              <span className={s.sidenoteInner}>
                <span className={s.fnIndex}>{n}</span>
                <span className={s.fnText}>{value.text}</span>
              </span>
            </span>
          </>
        );
      },
    },
  };

  return (
    <div className={`${s.grid} ${s.qa} ${continuation ? s.qaContinued : ""} ${className}`}>
      {!continuation && (
        <>
          <p className={s.asker}>{block.asker || "70oC"}</p>
          <p className={s.question}>{block.question}</p>
          {block.answerer && <p className={s.answerer}>{block.answerer}</p>}
        </>
      )}
      {block.answer?.length ? (
        <div className={s.answer}>
          <PortableText value={block.answer} components={components} />
        </div>
      ) : null}
      {footnotes.length > 0 && (
        // Mobile-only list under the answer (desktop uses the margin notes).
        <ol className={s.notesList}>
          {footnotes.map((f) => (
            <li key={f._key} className={s.noteItem}>
              <span className={s.noteIndex}>{footnoteNumbers[f._key]}</span>
              <span className={s.noteText}>{f.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
