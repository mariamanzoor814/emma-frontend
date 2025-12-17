"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

type CmsBlock = { key: string; value: any };

type FeedingItem = {
  id: number;
  heading: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
};

type Props = {
  blocks: CmsBlock[];
  backendUrl?: string; // optional base URL for media
};

function getBlock(blocks: CmsBlock[], key: string, field = "text"): string {
  const b = blocks.find((x) => x.key === key);
  if (!b || !b.value) return "";
  return b.value[field] ?? "";
}

function getList(blocks: CmsBlock[], key: string): any[] {
  const b = blocks.find((x) => x.key === key);
  return Array.isArray(b?.value?.items) ? b.value.items : [];
}

// ---------------- Motion ----------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------- Component ----------------

export function SoulBodySection({ blocks, backendUrl = "" }: Props) {
  const sectionTitle =
    getBlock(blocks, "feeding.title") || "Feeding the Body and the Soul";

  const bodyTitle =
    getBlock(blocks, "feeding.bodyTitle") || "Feeding the Body";

  const soulTitle =
    getBlock(blocks, "feeding.soulTitle") || "Feeding the Soul";

  const rawItems = getList(blocks, "feeding.sections");
  if (!rawItems.length) return null;

  const items: FeedingItem[] = rawItems.map((item, idx) => ({
    id: Number(item.id ?? idx + 1),
    heading: item.heading || "",
    body: (item.body as string | undefined)?.replace(
      /Click on <Next> below/gi,
      ""
    ) || "",
    imageUrl: item.imageUrl ? `${backendUrl}${item.imageUrl}` : undefined,
    imageAlt: item.imageAlt || item.heading || "",
  }));

  const midpoint = Math.ceil(items.length / 2);
  const bodyItems = items.slice(0, midpoint);
  const soulItems = items.slice(midpoint);

  const renderItem = (item: FeedingItem) => (
    <motion.li
      key={item.id}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="flex flex-col md:flex-row gap-6 items-start"
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full md:w-48 h-auto rounded-lg object-cover"
        />
      )}
      <div>
        {item.heading && (
          <p className="mb-3 text-xl font-semibold text-gray-900">
            {item.heading}
          </p>
        )}
        {item.body && (
          <p className="text-lg leading-relaxed text-gray-700">{item.body}</p>
        )}
      </div>
    </motion.li>
  );

  return (
    <section className="bg-white px-6 py-24 md:px-16 lg:px-28">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <header className="mb-24 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            {sectionTitle}
          </h2>
        </header>

        {/* Feeding the Body */}
        <div className="mb-28">
          <h3 className="mb-10 text-3xl font-semibold text-gray-900 md:text-4xl">
            {bodyTitle}
          </h3>
          <ul className="space-y-12">{bodyItems.map(renderItem)}</ul>
        </div>

        {/* Feeding the Soul */}
        <div>
          <h3 className="mb-10 text-3xl font-semibold text-gray-900 md:text-4xl">
            {soulTitle}
          </h3>
          <ul className="space-y-12">{soulItems.map(renderItem)}</ul>
        </div>
      </div>
    </section>
  );
}
