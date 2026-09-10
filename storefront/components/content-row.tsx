import { ImageBlock } from "./image-block";
import { ProductBlock } from "./product-block";

type ProductBlockType = {
  _type: "productBlock";
  _key: string;
  columnSpan: 1;
  product: any;
};

type ImageBlockType = {
  _type: "imageBlock";
  _key: string;
  columnSpan: 1 | 2;
  items?: any[];
  title?: string;
  description?: string;
};

type EmptyBlockType = {
  _type: "emptyBlock";
  _key: string;
  columnSpan: 1;
};

type Column = ProductBlockType | ImageBlockType | EmptyBlockType;

type ContentRowProps = {
  block: {
    columns?: Column[];
  };
};

export function ContentRow({ block }: ContentRowProps) {
  const { columns = [] } = block;
  const rendered: React.ReactNode[] = [];
  let usedSpans = 0;
  let i = 0;

  while (i < columns.length) {
    const col = columns[i];
    const span = col._type === "imageBlock" ? (col.columnSpan || 1) : 1;

    if (col._type === "productBlock") {
      rendered.push(
        <div key={col._key} style={{ gridColumn: "span 1", minWidth: 0 }}>
          <ProductBlock product={col.product} />
        </div>
      );
      usedSpans += 1;
      i += 1;
    } else if (col._type === "imageBlock") {
      rendered.push(
        <div key={col._key} style={{ gridColumn: `span ${span}`, minWidth: 0 }}>
          <ImageBlock
            items={col.items}
            title={col.title}
            description={col.description}
          />
        </div>
      );
      usedSpans += span;
      i += span === 2 ? 2 : 1;
    } else if (col._type === "emptyBlock") {
      rendered.push(
        <div key={col._key} style={{ gridColumn: "span 1", minWidth: 0 }} aria-hidden="true" />
      );
      usedSpans += 1;
      i += 1;
    } else {
      i += 1;
    }
  }

  const remaining = Math.max(0, 4 - usedSpans);
  for (let p = 0; p < remaining; p++) {
    rendered.push(
      <div key={`pad-${p}`} style={{ gridColumn: "span 1", minWidth: 0 }} aria-hidden="true" />
    );
  }

  return (
    <div
      data-content-row
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
      }}
    >
      {rendered}
    </div>
  );
}