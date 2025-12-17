"use client";

import React from "react";
import { motion } from "framer-motion";

type Block = { key: string; value: any };
type Props = { blocks?: Block[] };

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
  return { url: b?.value?.url ?? "", alt: b?.value?.alt ?? "" };
}

// helper to split multi-line intro into lines
const splitLines = (txt: string) =>
  txt
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export default function YourParticipation({ blocks = [] }: Props) {
  const title = getBlock(blocks, "participation.title");
  const intro = getBlock(blocks, "participation.intro");

  const philosophyPoints = getList<{ title: string; text: string }>(
    blocks,
    "participation.points"
  );

  const waysTitle = getBlock(blocks, "participation.ways_title");
  const ways = getList<{ number: string; title: string; text: string }>(
    blocks,
    "participation.ways"
  );

  const footer = getBlock(blocks, "participation.footer");
  const participationImage = getImage(blocks, "participation.image");

  const introLines = splitLines(intro);

  return (
    <section className="mx-auto w-full max-w-7xl  px-4 md:px-6 py-16 space-y-10">
      <div className=" space-y-3">
        {/* Section Title (blue-ish like doc heading) */}
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900"
        >
        <h2 className="text-center text-4xl md:text-5xl font-extrabold text-[color:var(--text-heading)]">
          {title || "Section 5: Your Participation"}
          </h2>
        </motion.h2>
            
        {/* Intro block in dark green (doc-like) */}
        {!!intro && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="mt-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5"
          >
            <div className="space-y-1 text-[15.5px] leading-7 text-green-900 font-medium">
              {introLines.map((line, i) => (
                <p key={i} className="whitespace-pre-line">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Philosophy (roman numerals style) */}
        {philosophyPoints.length > 0 && (
          <div className="mt-6">
            <ol className="space-y-4 text-[15px] leading-7 text-slate-800">
              {philosophyPoints.map((p, i) => (
                <li key={i} className="flex gap-3">
                  <div className="min-w-[22px] font-semibold text-slate-900">
                    {["i.", "ii.", "iii.", "iv.", "v."][i] || `${i + 1}.`}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <p className="mt-1 whitespace-pre-line">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Ways title (red + bold like your doc) */}
        {!!waysTitle && (
          <h3 className="mt-8 text-base md:text-lg font-extrabold text-red-700">
            {waysTitle}
          </h3>
        )}

        {/* Participation ways in a doc-flow list */}
        <div className="mt-3">
          <ol className="space-y-6">
            {ways.map((w, idx) => {
              const isAfterSix = idx === 6; // insert image before item 7

              return (
                <React.Fragment key={`${w.number}-${idx}`}>
                  {/* Insert real image between 6 & 7 */}
                  {isAfterSix && participationImage.url && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="my-6 flex justify-center"
                    >
                      <img
                        src={participationImage.url}
                        alt={participationImage.alt}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  )}

                  <li className="flex gap-3">
                    <div className="min-w-[26px] font-bold text-slate-900">
                      {w.number})
                    </div>

                    <div className="flex-1">
                      {/* Title line bold + slight underline feeling */}
                      <p className="font-bold text-slate-900 underline decoration-slate-300 underline-offset-4">
                        {w.title}
                      </p>

                      {/* Body */}
                      <p className="mt-2 text-[15px] leading-7 text-slate-800 whitespace-pre-line">
                        {w.text}
                      </p>
                    </div>
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </div>

        {/* Footer (green/blue emphasis line like doc end note) */}
        {!!footer && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mt-8 rounded-lg border-l-4 border-emerald-600 bg-emerald-50 p-4 text-[15px] font-semibold text-slate-900"
          >
            {footer}
          </motion.p>
        )}
      </div>
    </section>
  );
}
