// frontend/app/p3-intellect-athena/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import {
  FounderStorySection,
  type FounderSection,
} from "@/components/content/FounderStorySection";

const PAGE_SLUG = "p3-intellect-athena";

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

type Block = {
  key: string;
  value: any;
};

function getBlock(
  blocks: Block[] = [],
  key: string,
  field: string = "text"
): string {
  const b = blocks.find((x) => x.key === key);
  if (!b || !b.value) return "";
  return b.value[field] ?? "";
}

function getList(blocks: Block[] = [], key: string) {
  const b = blocks.find((x) => x.key === key);
  if (!b || !b.value) return [];
  const items = b.value.items;
  if (!Array.isArray(items)) return [];
  return items;
}

export default async function P3IntellectAthenaPage(props: PageProps) {
  const resolvedParams = (await props.searchParams) ?? {};
  const rawLang = resolvedParams.lang;
  const lang =
    (Array.isArray(rawLang) ? rawLang[0] : rawLang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  // Sections for FounderStorySection – all content comes from JSON / admin
  const rawSections = getList(page.blocks, "p3.sections");

  const sections: FounderSection[] = rawSections.map(
    (item: any, index: number) => ({
      id: item.id ?? String(index + 1),
      heading: item.heading ?? "",
      body: item.body ?? "",
      imageUrl: item.imageUrl ?? "",
      imageAlt: item.imageAlt ?? item.heading ?? "",
    })
  );

  // Optional legacy / extra images array if you ever want it
  const images = getList(page.blocks, "p3.images");

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <FounderStorySection sections={sections} images={images} />
    </AppShell>
  );
}
