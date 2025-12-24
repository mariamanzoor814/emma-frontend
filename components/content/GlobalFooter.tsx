// frontend/components/content/GlobalFooter.tsx
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/config";
import { SiteFooter } from "./SiteFooter";

type Block = {
  key: string;
  value: any;
};

type FooterApiResponse = {
  blocks: Block[];
};

type FooterColumn = {
  id: string;
  title: string;
  links: { id: string; label: string; href: string }[];
};

function getBlock(blocks: Block[] = [], key: string, field: string = "text") {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

function getList(blocks: Block[] = [], key: string): any[] {
  const block = blocks.find((b) => b.key === key);
  const items = block?.value?.items;
  if (!Array.isArray(items)) return [];
  return items;
}

export function GlobalFooter() {
  const [blocks, setBlocks] = useState<Block[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFooter() {
      try {
        const res = await authFetch("/api/content/pages/global-footer/");
        if (!res.ok) return;
        const data: FooterApiResponse = await res.json();
        if (isMounted) setBlocks(data.blocks || []);
      } catch (e) {
        console.error("Error loading footer content", e);
      }
    }

    loadFooter();
    return () => {
      isMounted = false;
    };
  }, []);

if (!blocks) {
  return (
    <footer className="border-t mt-auto">
      <div className="h-32" /> {/* reserve space */}
    </footer>
  );
}

  const brandName =
    getBlock(blocks, "footer.brandName") || "Emma Shopping Mall";

  const tagline =
    getBlock(blocks, "footer.tagline") ||
    "A curated marketplace for the Emma community.";

  const ecosystemText =
    getBlock(blocks, "footer.ecosystemText") ||
    "Part of the Emma Foundation ecosystem.";

  const logoBlock = blocks.find((b) => b.key === "footer.logo");
  const logoSrc = logoBlock?.value?.url || "/assets/emma-logo.png";
  const logoAlt = logoBlock?.value?.alt || "Emma logo";

  const rawColumns = getList(blocks, "footer.columns");
  const columns: FooterColumn[] = Array.isArray(rawColumns) ? rawColumns : [];

  return (
    <SiteFooter
      brandName={brandName}
      tagline={tagline}
      logoSrc={logoSrc}
      logoAlt={logoAlt}
      ecosystemText={ecosystemText}
      columns={columns}
    />
  );
}
