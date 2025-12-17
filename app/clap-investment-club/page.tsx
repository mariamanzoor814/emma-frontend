import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/content/HeroSection";
import { BookChapterContent } from "@/components/content/BookChapterContent";

import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

const CURRENT_SLUG = "clap-investment-club";

type RawSearchParams = { lang?: string };
type PageProps = { searchParams: Promise<RawSearchParams> };
type Block = { key: string; value: any };

function getBlock(blocks: Block[], key: string, field: string = "text") {
  const block = blocks.find((b) => b.key === key);
  return block?.value?.[field] ?? "";
}

export default async function ClapInvestmentClubPage({
  searchParams,
}: PageProps) {
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

      {/* reuse the same pattern as chapters, just with chapterKey="clap" */}
      <BookChapterContent blocks={blocks} chapterKey="clap" />
    </AppShell>
  );
}
