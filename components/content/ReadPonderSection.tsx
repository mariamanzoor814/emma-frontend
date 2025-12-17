// frontend/components/content/ReadPonderSection.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function resolveImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("/media") ? `${BACKEND_URL}${url}` : url;
}


type Block = { key: string; value: any };

function getBlock(blocks: Block[] = [], key: string, field = "text") {
  const b = blocks.find((x) => x.key === key);
  return b?.value?.[field] ?? "";
}

function getListItems<T = any>(blocks: Block[] = [], key: string): T[] {
  const b = blocks.find((x) => x.key === key);
  const items = b?.value?.items;
  return Array.isArray(items) ? items : [];
}

/* Inline SVG arrows (no installs needed) */
const LeftArrow = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const RightArrow = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

function Card({ img, body }: { img: string; body: string }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden border border-slate-200 bg-white"
    >
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        {img && (
          <motion.img
            src={resolveImageUrl(img)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}

        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex h-full items-end p-8">
          <p className="max-w-xl text-lg md:text-xl font-medium leading-relaxed text-white">
            {body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


function StyledTextFromJson({ text, centered = false }: { text: string; centered?: boolean }) {
  if (!text) return null;

  // Normalize whitespace
  const raw = text.replace(/\r/g, "").trim();

  // Split into chunks by roman numerals or numbers like:
  // i)  ii)  iii)  iv)  1)  2)
  const splitRegex = /(?:^|\s)([ivx]+|\d+)\)\s+/gi;

  // If text has list markers, this will split correctly even on same line.
  const parts = raw.split(splitRegex).map(p => p.trim()).filter(Boolean);

  const listItems: string[] = [];
  const paragraphs: string[] = [];

  // parts pattern:
  // [beforeListText?, marker1, item1, marker2, item2, ...]
  // We'll treat "marker + item" pairs as listItems.
  if (splitRegex.test(raw)) {
    // When regex matched, parts alternates marker/item
    for (let i = 0; i < parts.length; i++) {
      const maybeMarker = parts[i];
      const maybeItem = parts[i + 1];

      // marker is roman numeral or number
      if (/^[ivx]+$/i.test(maybeMarker) || /^\d+$/.test(maybeMarker)) {
        if (maybeItem) listItems.push(maybeItem);
        i++; // skip next because we consumed it
      } else {
        // any leading chunk before first marker
        paragraphs.push(maybeMarker);
      }
    }
  } else {
    // fallback: split by newlines if no markers
    const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
    paragraphs.push(...lines);
  }

  return (
    <div className={`space-y-6 text-[color:var(--text-muted)] text-base md:text-lg leading-snug ${centered ? "text-center" : ""}`}>
      {listItems.length > 0 && (
        <ol className={`list-decimal pl-6 space-y-2 font-medium text-[color:var(--text-heading)] ${centered ? "mx-auto inline-block text-left" : ""}`}>
          {listItems.map((item, i) => (
            <li key={i} className="marker:text-slate-400">
              {item}
            </li>
          ))}
        </ol>
      )}

      {paragraphs.map((p, i) => {
        const isEllipsisLine = p.startsWith("...then") || p.startsWith("….then");
        return (
          <p
            key={i}
            className={
              isEllipsisLine
                ? "font-semibold italic text-[color:var(--text-heading)]"
                : "text-[color:var(--text-muted)]"
            }
          >
            {p}
          </p>
        );
      })}
    </div>
  );
}


export function ReadPonderSection({ blocks }: { blocks: Block[] }) {
  const title = getBlock(blocks, "readponder.title");
  const body = getBlock(blocks, "readponder.body");
  const rp = blocks.find((b) => b.key === "readponder.body")?.value || {};

  const cards = getListItems<{ body: string; image: string }>(
    blocks,
    "readponder.cards"
  );

  const total = cards.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const current = useMemo(() => cards[index], [cards, index]);

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % total);
  };
  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + total) % total);
  };

  // Auto-advance carousel after a short delay
  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % total);
    }, 8000);
    return () => clearInterval(id);
  }, [total, paused]);

  if (!title && !body && total === 0 && !rp?.title && !rp?.footer) return null;

  return (
    <section className="w-full py-24">
  <div className="mx-auto w-full max-w-7xl px-4 md:px-6 space-y-16">
      {title && (
  <motion.h2
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--text-heading)]"
  >
    {title}
  </motion.h2>
)}

{body && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.05 }}
    className="mx-auto max-w-3xl"
  >
    <StyledTextFromJson text={body} centered />
  </motion.div>
)}



      {/* Read & Ponder extra structured block */}
      {rp && (rp.title || rp.footer || (Array.isArray(rp.items) && rp.items.length)) && (
        <div className="mt-8 space-y-4">
          {rp.title && (
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">
              {rp.title}
            </h3>
          )}

          {Array.isArray(rp.items) && rp.items.length > 0 && (
            <ul className="list-disc pl-6 text-slate-700 text-base md:text-lg space-y-1">
              {rp.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}

          {rp.footer && (
            <StyledTextFromJson text={rp.footer} />
          )}
        </div>
      )}

      {/* ---------------- CAROUSEL ---------------- */}
      {total > 0 && (
        <div
          className="relative mx-auto max-w-6xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >

          <div className="relative w-full overflow-hidden">
            {/* Invisible clone preserves height so slides overlap without gaps */}
            <div className="opacity-0 pointer-events-none select-none">
              <Card img={current.image} body={current.body} />
            </div>

            <AnimatePresence mode="sync">
              <motion.div
                key={index}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%" }),
                  center: { x: 0 },
                  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 22,
                  mass: 0.95
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) next();
                  if (info.offset.x > 80) prev();
                }}
                className="cursor-grab w-full h-full absolute inset-0"
              >
                <Card img={current.image} body={current.body} />
              </motion.div>
            </AnimatePresence>

            {/* Arrows */}
            {total > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Previous"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 shadow-md backdrop-blur hover:bg-white transition"
                >
                  <LeftArrow className="h-5 w-5" />
                </button>

                <button
                  onClick={next}
                  aria-label="Next"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 p-2 shadow-md backdrop-blur hover:bg-white transition"
                >
                  <RightArrow className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {total > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === index
                      ? "w-8 bg-slate-900"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </section>
  );
}
