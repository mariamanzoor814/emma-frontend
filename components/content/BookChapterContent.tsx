"use client";

import React from "react";
import {
  FounderStorySection,
  type FounderSection,
} from "@/components/content/FounderStorySection";

type Block = { key: string; value: any };
type Props = { blocks: Block[]; chapterKey: string };

function getBlock(blocks: Block[], key: string, field: string = "text") {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

function getList(blocks: Block[], key: string) {
  const block = blocks.find((b) => b.key === key);
  const items = block?.value?.items;
  if (!Array.isArray(items)) return [];
  return items;
}

export function BookChapterContent({ blocks, chapterKey }: Props) {
  const images = getList(blocks, `${chapterKey}.images`);

  const makeSection = (id: string, base: string): FounderSection => ({
    id,
    heading: getBlock(blocks, `${base}.heading`),
    body: getBlock(blocks, `${base}.body`),
    imageUrl: getBlock(blocks, `${base}.image`, "url"),
    imageAlt: getBlock(blocks, `${base}.image`, "alt"),
  });

  const bases = blocks
    .filter(
      (b) =>
        b.key.startsWith(`${chapterKey}.`) &&
        b.key.endsWith(".heading")
    )
    .map((b) => b.key.replace(".heading", ""));

  const sections = bases
    .map((base) => makeSection(base.split(".")[1], base))
    .filter((s) => s.heading || s.body);

  return (
    <FounderStorySection
      sections={sections}
      {...(images.length ? { images } : {})}
    />
  );
}
