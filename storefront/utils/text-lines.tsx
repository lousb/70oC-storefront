import { Fragment, type ReactNode } from "react";

// Shared helper for anything that animates or styles text word by word
// (reveal animations etc). Splitting on /\s+/ or " " throws away the
// line breaks editors type into Sanity text fields, so this keeps them:
//
//   - one entry in `lines` per typed line, in order
//   - an empty line in the Studio stays as an empty entry (a blank line)
//   - leading and trailing blank lines are trimmed
//   - every word gets an `index`, numbered straight through in reading
//     order across all lines, for stagger delays / reveal counters
//
// Render with renderTextLines() below. It joins lines with a plain "\n"
// text node, and body's `white-space: pre-line` (styles/globals.css)
// turns those into real line breaks and blank-line gaps. Don't wrap lines
// in display:block spans instead: those can lose the break at some
// breakpoints and add extra gaps at others.

export type TextWord = { text: string; index: number };
export type TextLine = TextWord[];

export type TextLines = {
  lines: TextLine[];
  wordCount: number;
};

export function splitTextLines(text: string | null | undefined): TextLines {
  if (!text) return { lines: [], wordCount: 0 };

  const rawLines = text.replace(/\r\n?/g, "\n").split("\n");

  let start = 0;
  let end = rawLines.length;
  while (start < end && rawLines[start].trim() === "") start++;
  while (end > start && rawLines[end - 1].trim() === "") end--;

  let index = 0;
  const lines = rawLines.slice(start, end).map((line) =>
    line
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ text: word, index: index++ })),
  );

  return { lines, wordCount: index };
}

/**
 * Renders split lines back as inline content: words separated by spaces,
 * lines separated by "\n" (empty lines become "\n\n", i.e. a blank line
 * under pre-line). `renderWord` returns the element for a single word.
 */
export function renderTextLines(
  lines: TextLine[],
  renderWord: (word: TextWord) => ReactNode,
): ReactNode {
  return lines.map((line, lineIndex) => (
    <Fragment key={lineIndex}>
      {lineIndex > 0 ? "\n" : null}
      {line.map((word, wordIndex) => (
        <Fragment key={word.index}>
          {wordIndex > 0 ? " " : null}
          {renderWord(word)}
        </Fragment>
      ))}
    </Fragment>
  ));
}
