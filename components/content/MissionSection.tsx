// frontend/components/content/MissionSection.tsx
"use client";

import React from "react";
import Link from "next/link";

type Block = { key: string; value: any };

function getBlock(blocks: Block[] = [], key: string, field: string = "text") {
  const b = blocks.find((x) => x.key === key);
  if (!b?.value) return "";
  return b.value[field] ?? "";
}

function getItems(blocks: Block[] = [], key: string): string[] {
  const b = blocks.find((x) => x.key === key);
  const items = b?.value?.items;
  if (!Array.isArray(items)) return [];
  return items.filter(Boolean);
}

function ActionButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex items-center gap-2 text-sm font-medium
                 text-[color:var(--text-heading)]
                 border-b border-current pb-1
                 hover:opacity-70 transition"
    >
      View details →
    </Link>
  );
}
function TwoColumnBlock({
  title,
  body,
  bullets,
  image,
  actionHref,
  reverse = false,
}: {
  title?: string;
  body?: string;
  bullets?: string[];
  image?: string;
  actionHref: string;
  reverse?: boolean;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-stretch min-h-[420px]">
      {/* Text */}
      <div
        className={`flex flex-col justify-between ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <div className="space-y-6 max-w-xl">
          {title && (
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-[color:var(--text-heading)]">
              {title}
            </h3>
          )}

          {body && (
            <p className="text-base md:text-lg leading-relaxed text-[color:var(--text-muted)] whitespace-pre-line">
              {body}
            </p>
          )}

          {bullets && bullets.length > 0 && (
            <ul className="space-y-2 text-[color:var(--text-muted)]">
              {bullets.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 bg-current flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ActionButton href={actionHref} />
      </div>

      {/* Image */}
      <div
        className={`w-full h-full min-h-[420px] ${
          reverse ? "md:order-1" : ""
        }`}
      >
        {image ? (
          <img
            src={image}
            alt={title || "Mission image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>
    </div>
  );
}


export function MissionSection({ blocks }: { blocks: Block[] }) {
  const title = getBlock(blocks, "mission.title");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 py-20 space-y-12">
      {title && (
        <h2 className="text-center text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--text-heading)]">
          {title}
        </h2>
      )}

      {/* Soul */}
      <TwoColumnBlock
        title={getBlock(blocks, "mission.soul.title")}
        body={getBlock(blocks, "mission.soul.body")}
        bullets={getItems(blocks, "mission.soul.bullets")}
        image={getBlock(blocks, "mission.soul.image", "url")}
        actionHref="/feeding-the-soul"
      />

      {/* Body */}
      <TwoColumnBlock
        title={getBlock(blocks, "mission.body.title")}
        body={getBlock(blocks, "mission.body.body")}
        bullets={getItems(blocks, "mission.body.bullets")}
        image={getBlock(blocks, "mission.body.image", "url")}
        actionHref="/feeding-the-body"
        reverse
      />
    </section>
  );
}
