import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import { HeroSection } from "@/components/content/HeroSection";
import { FounderStorySection, type FounderSection } from "@/components/content/FounderStorySection";

const SLUG = "feeding-the-body";

type CmsBlock = { key: string; value: any };

function getBlock(blocks: CmsBlock[], key: string, field = "text"): string {
  const b = blocks.find(x => x.key === key);
  if (!b || !b.value) return "";
  return b.value[field] ?? "";
}

function getList(blocks: CmsBlock[], key: string): any[] {
  const b = blocks.find(x => x.key === key);
  return Array.isArray(b?.value?.items) ? b.value.items : [];
}

export default async function FeedingBodyPage({ searchParams }: { searchParams: { lang?: string } }) {
  const lang = (searchParams?.lang ?? "en").toLowerCase();
  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(SLUG, lang),
  ]);

  // HERO
  const heroTitle = getBlock(page.blocks, "hero.title") || "Feeding the Body";
  const heroSubtitle = getBlock(page.blocks, "hero.subtitle") || "";
  const heroImage = getBlock(page.blocks, "hero.image", "url");
  const heroImageAlt = getBlock(page.blocks, "hero.image", "alt") || heroTitle;

  // Feeding sections (like FounderStorySection)
  const feedingSectionsRaw = getList(page.blocks, "feeding.sections");
  const feedingSections: FounderSection[] = feedingSectionsRaw.map((item: any, idx: number) => ({
    id: item.id || `feeding_${idx + 1}`,
    heading: item.heading || heroTitle,
    body: item.body || "",
    imageUrl: item.imageUrl ? `http://localhost:8000${item.imageUrl}` : "",
    imageAlt: item.imageAlt || item.heading || heroTitle,
  }));

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage ? `http://localhost:8000${heroImage}` : undefined}
        imageAlt={heroImageAlt}
      />

      {feedingSections.length > 0 && <FounderStorySection sections={feedingSections} />}
    </AppShell>
  );
}
