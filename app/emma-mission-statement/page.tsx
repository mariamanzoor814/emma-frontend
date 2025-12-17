// frontend/app/emma-mission-statement/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { MissionStatementContent } from "@/components/content/MissionStatementContent";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

const PAGE_SLUG = "emma-mission-statement";

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

export default async function EmmaMissionStatementPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const lang = (sp?.lang ?? "en").toLowerCase();

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  const blocks: Block[] = page?.blocks ?? [];

  const heroTitle =
    getBlock(blocks, "hero.title") || "EMMA Foundation Mission Statement";
  const heroSubtitle =
    getBlock(blocks, "hero.subtitle") ||
    "How we lift the brightest minds and the most driven hearts.";
  const heroImage = getBlock(blocks, "hero.image", "url");
  const heroImageAlt = getBlock(blocks, "hero.image", "alt");

  const intro =
    getBlock(blocks, "mission.intro") ||
    "The roadmap to strengthen mind, character, and impact.";

  const statements = getList(blocks, "mission.statements") as {
    title: string;
    body: string;
  }[];

  const steps = getList(blocks, "mission.steps") as {
    title: string;
    body: string;
  }[];

  const principles = getList(blocks, "mission.principles") as {
    title: string;
    body: string;
  }[];

  const quotes = getList(blocks, "mission.quotes") as string[];

  const lessons = getList(blocks, "mission.lessons") as {
    title: string;
    body: string;
  }[];

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <MissionStatementContent
        hero={{
          title: heroTitle,
          subtitle: heroSubtitle,
          image: heroImage,
          imageAlt: heroImageAlt,
        }}
        intro={intro}
        statements={statements}
        steps={steps}
        principles={principles}
        quotes={quotes}
        lessons={lessons}
      />
    </AppShell>
  );
}
