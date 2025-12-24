// frontend/components/content/GlobalFooter.tsx

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

function getBlock(blocks: Block[] = [], key: string, field = "text") {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

function getList(blocks: Block[] = [], key: string): any[] {
  const block = blocks.find((b) => b.key === key);
  const items = block?.value?.items;
  return Array.isArray(items) ? items : [];
}

/**
 * SERVER FETCH (IMPORTANT)
 * - direct backend call
 * - cookies automatically included
 * - no hydration mismatch
 */
async function fetchFooterBlocks(): Promise<Block[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/content/pages/global-footer/`,
    {
      cache: "no-store", // OR "force-cache" if footer rarely changes
      credentials: "include"
    }
  );

  if (!res.ok) {
    console.error("Failed to load footer");
    return [];
  }

  const data: FooterApiResponse = await res.json();
  return data.blocks || [];
}

export async function GlobalFooter() {
  const blocks = await fetchFooterBlocks();

  if (!blocks.length) {
    return (
      <footer className="border-t">
        <div className="h-32" />
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
  const columns: FooterColumn[] = rawColumns;

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
