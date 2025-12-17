"use client";

import React from "react";

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

function getList<T = any>(blocks: Block[] = [], key: string): T[] {
  const b = blocks.find((x) => x.key === key);
  const items = b?.value?.items;
  return Array.isArray(items) ? items : [];
}

function getImage(blocks: Block[] = [], key: string) {
  const b = blocks.find((x) => x.key === key);
  const rawUrl = b?.value?.url ?? "";
  return {
    url: resolveImageUrl(rawUrl),
    alt: b?.value?.alt ?? "",
  };
}


function Card({
  index,
  title,
  body,
  bullets,
}: {
  index: number;
  title: string;
  body: string;
  bullets?: string[];
}) {
  return (
    <article
      className="
        group h-full rounded-3xl border border-slate-200 bg-white
        p-7 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300
        flex flex-col relative overflow-hidden
      "
    >
      {/* soft gradient glow on hover */}
      <div
        className="
          pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-[radial-gradient(closest-side,rgba(99,102,241,0.12),transparent)]
        "
      />

      {/* header row */}
      <div className="relative flex items-start gap-4 mb-4">
        {/* number badge */}
        <div
          className="
            shrink-0 h-10 w-10 rounded-full
            bg-indigo-600/10 text-indigo-700
            flex items-center justify-center font-bold text-sm
          "
        >
          {index}
        </div>

        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
          {title}
        </h3>
      </div>

      {/* body */}
      <p className="relative text-slate-700 leading-relaxed whitespace-pre-line text-base md:text-lg flex-1">
        {body}
      </p>

      {/* bullets */}
      {bullets?.length ? (
        <ul className="relative mt-5 space-y-2 text-slate-700 text-base md:text-lg">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-2 w-2 rounded-full bg-indigo-600/70 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function BitterSadTruthSection({ blocks }: { blocks: Block[] }) {
  const title = getBlock(blocks, "bitter.title");
  const intro = getBlock(blocks, "bitter.one_percent.body");
  const hero = getImage(blocks, "bitter.hero_image");

  const sections = getList<{
    title: string;
    body: string;
    bullets?: string[];
  }>(blocks, "bitter.sections");

  return (
    <section className="w-full  pt-14 md:pt-16">
      <div className="mx-auto w-full max-w-7xl px-3 md:px-6 pb-16">
      {/* Title */}
      {title && (
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">
            {title}
          </h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-indigo-600/70" />
        </div>
      )}

      {/* Intro */}
      {intro && (
        <p className="max-w-4xl mx-auto text-center text-slate-900 text-base md:text-lg leading-relaxed whitespace-pre-line py-8">
          {intro}
        </p>
      )}

      {/* One big hero image */}
      {hero.url && (
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
          <img
            src={hero.url}
            alt={hero.alt || "Bitter and Sad Truth"}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* ✅ Cards Grid (2 per row) */}
      {sections.length > 0 && (
        <div className="grid gap-7 md:grid-cols-2 items-stretch">
          {sections.map((s, i) => (
            <Card
              key={i}
              index={i + 1}
              title={s.title}
              body={s.body}
              bullets={s.bullets}
            />
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
