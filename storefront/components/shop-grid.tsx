"use client";

import { useEffect, useRef, useState } from "react";
import { ImageBlock } from "./image-block";
import { ProductBlock } from "./product-block";

type DesktopColumnOption = 3 | 4 | 8;
type MobileColumnOption = 1 | 2;
type ColumnOption = DesktopColumnOption | MobileColumnOption;

const DESKTOP_COLUMN_OPTIONS = [3, 4, 8] as const;
const MOBILE_COLUMN_OPTIONS = [1, 2] as const;

const DESKTOP_STORAGE_KEY = "shop-column-preference";
const MOBILE_STORAGE_KEY = "shop-column-preference-mobile";

const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;
}

export function ShopGrid({
  pageBuilder,
  title,
  description,
}: {
  pageBuilder: any[];
  pageId?: string;
  pageType?: string;
  title?: string | null;
  description?: string | null;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [columns, setColumns] = useState<ColumnOption>(4);
  const [mounted, setMounted] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [visibleWords, setVisibleWords] = useState(0);
  const [gridReady, setGridReady] = useState(false);
  const isFirst = useRef(true);
  const words = description ? description.split(" ") : [];

  useEffect(() => {
    const mobile = isMobileViewport();
    setIsMobile(mobile);

    if (mobile) {
      const stored = localStorage.getItem(MOBILE_STORAGE_KEY);
      const parsed = Number(stored) as MobileColumnOption;
      setColumns(
        stored && (MOBILE_COLUMN_OPTIONS as readonly number[]).includes(parsed) ? parsed : 1
      );
    } else {
      const stored = localStorage.getItem(DESKTOP_STORAGE_KEY);
      const parsed = Number(stored) as DesktopColumnOption;
      setColumns(
        stored && (DESKTOP_COLUMN_OPTIONS as readonly number[]).includes(parsed) ? parsed : 4
      );
    }

    setMounted(true);

    const handleResize = () => {
      const nowMobile = isMobileViewport();
      setIsMobile((prev) => {
        if (prev === nowMobile) return prev;
        if (nowMobile) {
          const stored = localStorage.getItem(MOBILE_STORAGE_KEY);
          const parsed = Number(stored) as MobileColumnOption;
          setColumns(
            stored && (MOBILE_COLUMN_OPTIONS as readonly number[]).includes(parsed) ? parsed : 1
          );
        } else {
          const stored = localStorage.getItem(DESKTOP_STORAGE_KEY);
          const parsed = Number(stored) as DesktopColumnOption;
          setColumns(
            stored && (DESKTOP_COLUMN_OPTIONS as readonly number[]).includes(parsed) ? parsed : 4
          );
        }
        return nowMobile;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (words.length === 0) {
      const t = setTimeout(() => setGridReady(true), 100);
      return () => clearTimeout(t);
    }

    let wordIndex = 0;
    const interval = setInterval(() => {
      wordIndex += 1;
      setVisibleWords(wordIndex);
      if (wordIndex >= words.length) {
        clearInterval(interval);
        setTimeout(() => setGridReady(true), 200);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [mounted]);

  const handleSet = (val: ColumnOption) => {
    if (val === columns) return;
    setColumns(val);
    const key = isMobile ? MOBILE_STORAGE_KEY : DESKTOP_STORAGE_KEY;
    localStorage.setItem(key, String(val));
    isFirst.current = false;
    setFadeKey((k) => k + 1);
  };

  const columnOptions = isMobile ? MOBILE_COLUMN_OPTIONS : DESKTOP_COLUMN_OPTIONS;

  const allItems: any[] = [];
  for (const block of pageBuilder) {
    if (block._type !== "contentRow") continue;
    const blockColumns = block.columns ?? [];
    let i = 0;
    while (i < blockColumns.length) {
      const col = blockColumns[i];
      const span = col._type === "imageBlock" ? (col.columnSpan || 1) : 1;
      if (col._type === "imageBlock" && span === 2) {
        allItems.push(col);
        const next = blockColumns[i + 1];
        if (next && next._type === "emptyBlock") {
          i += 2;
        } else {
          i += 1;
        }
      } else {
        allItems.push(col);
        i += 1;
      }
    }
  }

  return (
    <div>
      <div
        data-shop-header
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          padding: "10px 0rem",
          alignItems: "end",
          marginTop: "200px",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 1,
        }}
      >
        <div style={{ opacity: gridReady ? 1 : 0, transition: "opacity 0.4s ease" }}>
          {title && <p style={{ margin: 0 }}>{title}</p>}
        </div>

        <div />

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", opacity: gridReady ? 1 : 0, transition: "opacity 0.4s ease" }}>
          {columnOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSet(opt)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.85rem",
                opacity: !mounted || columns === opt ? 1 : 0.35,
                letterSpacing: "0.05em",
                padding: 0,
                transition: "opacity 0.2s",
              }}
            >
              {opt} 
            </button>
          ))}
           <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.35 }}>Columns</p>
        </div>

        <div>
          {words.length > 0 && (
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.6 }}>
              {words.map((word, i) => (
                <span
                  key={i}
                  style={{ visibility: i < visibleWords ? "visible" : "hidden" }}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>

      <div
        data-shop-grid
        key={fadeKey}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "1rem",
        }}
      >
        {allItems.map((col, idx) => {
          const span = col._type === "imageBlock" ? (col.columnSpan || 1) : 1;
          const delay = `${idx * 0.04}s`;
          const cellStyle: React.CSSProperties = {
            minWidth: 0,
            animationDelay: delay,
            animationPlayState: gridReady || !isFirst.current ? "running" : "paused",
          };

          if (col._type === "productBlock") {
            return (
              <div key={col._key || idx} className="shop-item-fade" style={{ ...cellStyle, gridColumn: "span 1" }}>
                <ProductBlock product={col.product} />
              </div>
            );
          }
          if (col._type === "imageBlock") {
            const clampedSpan = isMobile ? 1 : Math.min(span, columns);
            return (
              <div key={col._key || idx} className="shop-item-fade" style={{ ...cellStyle, gridColumn: `span ${clampedSpan}` }}>
                <ImageBlock items={col.items} title={col.title} description={col.description} />
              </div>
            );
          }
          if (col._type === "emptyBlock") {
            if (isMobile || columns === 3) return null;
            return (
              <div key={col._key || idx} style={{ gridColumn: "span 1", minWidth: 0 }} aria-hidden="true" />
            );
          }
          return null;
        })}
      </div>

      <style>{`
        .shop-item-fade {
          opacity: 0;
          animation: shopFadeIn 0.4s ease forwards;
          animation-fill-mode: forwards;
        }

        @keyframes shopFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          [data-shop-header] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}