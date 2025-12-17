// frontend/app/book-of-truth/chapter-2/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/content/HeroSection";
import { BookChapterContent } from "@/components/content/BookChapterContent";
import { ChapterNavigation } from "@/components/content/ChapterNavigation";

import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

const CHAPTER_SLUGS = [
  "book-of-truth-chapter-1",
  "book-of-truth-chapter-2",
];

const CURRENT_SLUG = "book-of-truth-chapter-2";

type RawSearchParams = { lang?: string };
type PageProps = { searchParams: Promise<RawSearchParams> };
type Block = { key: string; value: any };

function getBlock(blocks: Block[], key: string, field: string = "text") {
  const block = blocks.find((b) => b.key === key);
  return block?.value?.[field] ?? "";
}

export default async function Chapter2Page({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lang =
    (Array.isArray(sp.lang) ? sp.lang[0] : sp.lang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(CURRENT_SLUG, lang),
  ]);

  const blocks = page?.blocks ?? [];

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <HeroSection
        title={getBlock(blocks, "hero.title")}
        subtitle={getBlock(blocks, "hero.subtitle")}
        image={getBlock(blocks, "hero.image", "url")}
        imageAlt={getBlock(blocks, "hero.image", "alt")}
      />

      <BookChapterContent blocks={blocks} chapterKey="chapter2" />

      <ChapterNavigation currentSlug={CURRENT_SLUG} slugs={CHAPTER_SLUGS} />
    </AppShell>
  );
}
