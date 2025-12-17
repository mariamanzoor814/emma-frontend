// frontend/app/about-founder/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/content/HeroSection";
import {
  FounderStorySection,
  type FounderSection,
} from "@/components/content/FounderStorySection";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";


const PAGE_SLUG = "about-founder";

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  // In your setup, Next passes searchParams as a Promise
  searchParams: Promise<RawSearchParams>;
};

type Block = {
  key: string;
  value: any;
};

function getBlock(blocks: Block[] = [], key: string, field: string = "text") {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

function getList(blocks: Block[] = [], key: string) {
  const block = blocks.find((b) => b.key === key);
  const items = block?.value?.items;
  if (!Array.isArray(items)) return [];
  return items;
}

export default async function AboutFounderPage({ searchParams }: PageProps) {
  // ✅ unwrap the Promise to avoid the Next.js error
  const sp = (await searchParams) ?? {};
  const rawLang = sp.lang;
  const lang =
    (Array.isArray(rawLang) ? rawLang[0] : rawLang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  const blocks = page?.blocks ?? [];

  const heroTitle =
    getBlock(blocks, "hero.title") || "About the Founder - EMMA";
  const heroSubtitle =
    getBlock(blocks, "hero.subtitle") ||
    "Munzer Haque shares his journey, philosophy, and the creation of EMMA.";
    const heroImageRaw = getBlock(blocks, "hero.image", "url");
    const heroImage = heroImageRaw?.startsWith("/media")
      ? `${BACKEND_URL}${heroImageRaw}`
      : heroImageRaw;
      const heroImageAlt = getBlock(blocks, "hero.image", "alt");

  // 🔹 Legacy: list-based images from JSON block "founder.images"
  // e.g. [{ "url": "...", "alt": "..." }, ...] or simple string array
  const storyImages = getList(blocks, "founder.images") as any[];

  // Helper: safely extract URL/alt if storyImages is [{url, alt}, ...] or simple strings
  const getImageFromList = (idx: number): { url?: string; alt?: string } => {
  if (!Array.isArray(storyImages) || storyImages.length === 0) return {};
  const item = storyImages[idx];
  if (!item) return {};

  let url = typeof item === "string" ? item : item.url ?? "";
  if (url.startsWith("/media")) url = `${BACKEND_URL}${url}`;

  return {
    url,
    alt: typeof item === "string" ? "" : item.alt ?? "",
  };
};


  // Helper: construct one section from:
  // "<base>.heading" + "<base>.body" + optional "<base>.image"
  const makeSection = (id: string, base: string, index: number): FounderSection => {
  // per-section image (preferred)
  const imageUrlRaw = getBlock(blocks, `${base}.image`, "url");
  const imageUrlFromBlock = imageUrlRaw?.startsWith("/media")
    ? `${BACKEND_URL}${imageUrlRaw}`
    : imageUrlRaw;
    const imageAltFromBlock = getBlock(blocks, `${base}.image`, "alt");

  // fallback: legacy list 'founder.images' handled elsewhere (images array)
  return {
    id,
    heading: getBlock(blocks, `${base}.heading`),
    body: getBlock(blocks, `${base}.body`),
    imageUrl: imageUrlFromBlock || "",
    imageAlt: imageAltFromBlock || ""
  };
};

  const bases = [
    "founder.intro",
    "founder.childhood",
    "founder.no_free_will",
    "founder.praying",
    "founder.origin_8_pistons",
    "founder.migrating_us",
    "founder.education",
    "founder.professional",
    "founder.travel",
    "founder.health",
    "founder.family",
    "founder.raising_children",
    "founder.regret",
    "founder.emma",
    "founder.feed_body_soul",
    "founder.projecting_shoes",
    "founder.selfishness_charity",
    "founder.observing_cultures",
  ];

  const sections: FounderSection[] = bases
    .map((base, idx) => {
      const id = base.split(".").slice(-1)[0]; // e.g. "founder.intro" -> "intro"
      return makeSection(id, base, idx);
    })
    .filter((s) => s.heading || s.body); // skip empty ones

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        cta=""
        image={heroImage}
        imageAlt={heroImageAlt}
        applyOverlayBlur={false}
      />

      {/* 🔥 Pass both: structured sections + legacy storyImages list */}
      <FounderStorySection sections={sections} images={storyImages} />
    </AppShell>
  );
}
