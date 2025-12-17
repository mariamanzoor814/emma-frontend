// frontend/app/7-commandments-21stcs/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import SevenCommandmentsSection, {
  type Commandment,
} from "@/components/content/SevenCommandmentsSection";

const PAGE_SLUG = "seven_commendments";

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

export default async function SevenCommandmentsPage(props: PageProps) {
  const resolvedParams = (await props.searchParams) ?? {};
  const rawLang = resolvedParams.lang;
  const lang =
    (Array.isArray(rawLang) ? rawLang[0] : rawLang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  const pageTitle = getBlock(page.blocks, "page.title");
  const pageSubtitle = getBlock(page.blocks, "page.subtitle");
  const challengeText = getBlock(page.blocks, "challenge.text");

  // Optional header image (admin can add a ContentBlock with key "seven.hero_image")
  const heroImageUrl = getBlock(page.blocks, "seven.hero_image", "url");
  const heroImageAlt = getBlock(page.blocks, "seven.hero_image", "alt");

  const rawCommandments = getList(page.blocks, "commandments");

  const commandments: Commandment[] = rawCommandments.map(
    (item: any, index: number) => {
      const id = item.id ?? index + 1;

      // Optional per-commandment images (keys like "commandment.1.image", "commandment.2.image", etc.)
      const imageUrl = getBlock(
        page.blocks,
        `commandment.${id}.image`,
        "url"
      );
      const imageAlt = getBlock(
        page.blocks,
        `commandment.${id}.image`,
        "alt"
      );

      return {
        id,
        title: item.title ?? "",
        body: item.body ?? "",
        imageUrl,
        imageAlt,
      };
    }
  );

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <SevenCommandmentsSection
        title={pageTitle}
        subtitle={pageSubtitle}
        challenge={challengeText}
        commandments={commandments}
        heroImageUrl={heroImageUrl}
        heroImageAlt={heroImageAlt}
      />
    </AppShell>
  );
}
