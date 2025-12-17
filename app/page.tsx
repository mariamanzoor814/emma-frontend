// frontend/app/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import { MissionSection } from "@/components/content/MissionSection";
import { ReadPonderSection } from "@/components/content/ReadPonderSection";
import { SerendipitySection } from "@/components/content/SerendipitySection";
import { SoulBodySection } from "@/components/content/SoulBodySection";
import { BitterSadTruthSection } from "@/components/content/BitterSadTruthSection";
import YourParticipation from "@/components/content/YourParticipation";
import { HeroSection } from "@/components/content/HeroSection";
import {
  FounderStorySection,
  type FounderSection,
} from "@/components/content/FounderStorySection";
import SevenCommandmentsSection, {
  type Commandment,
} from "@/components/content/SevenCommandmentsSection";

const HOME_PAGE_SLUG = "home";

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

type CmsBlock = { key: string; value: any };

function getBlock(
  blocks: CmsBlock[],
  key: string,
  field: string = "text"
): string {
  const b = blocks.find((x) => x.key === key);
  if (!b || !b.value) return "";
  return b.value[field] ?? "";
}

function getList(blocks: CmsBlock[], key: string): any[] {
  const b = blocks.find((x) => x.key === key);
  const items = b?.value?.items;
  return Array.isArray(items) ? items : [];
}

type CommandmentSectionData = {
  title: string;
  subtitle: string;
  challenge: string;
  items: Commandment[];
};

// Small helper so we don't repeat the same mapping logic 4 times
function getCommandmentSection(
  blocks: CmsBlock[],
  prefix: string,
  defaultTitle?: string
): CommandmentSectionData | null {
  const title =
    getBlock(blocks, `${prefix}.title`) || defaultTitle || "";
  const subtitle = getBlock(blocks, `${prefix}.subtitle`);
  const challenge = getBlock(blocks, `${prefix}.challenge`);
  const raw = getList(blocks, `${prefix}.items`);

  if (!raw.length && !title && !subtitle && !challenge) {
    return null;
  }

  const items: Commandment[] = raw.map((item: any, idx: number) => ({
    id: Number(item.id ?? idx + 1),
    title: item.title || "",
    body: item.body || "",
    imageUrl: item.imageUrl || "",
    imageAlt: item.imageAlt || item.title || "",
  }));

  return { title, subtitle, challenge, items };
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lang = (sp?.lang ?? "en").toLowerCase();

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(HOME_PAGE_SLUG, lang),
  ]);

  const title = getBlock(page.blocks, "hero.title");
  const subtitle = getBlock(page.blocks, "hero.subtitle");
  const cta = getBlock(page.blocks, "hero.cta_label");
  const image = getBlock(page.blocks, "hero.image", "url");
  const imageAlt = getBlock(page.blocks, "hero.image", "alt");

  // FEEDING SECTION (FounderStorySection)
  const feedingTitle =
    getBlock(page.blocks, "feeding.title") ||
    "Feeding the body and the soul";

  const feedingSectionsRaw = getList(page.blocks, "feeding.sections");

  const feedingSections: FounderSection[] = feedingSectionsRaw.map(
    (item: any, idx: number) => ({
      id: item.id || `feeding_${idx + 1}`,
      heading: item.heading || feedingTitle,
      body: item.body || "",
      imageUrl: item.imageUrl || "",
      imageAlt: item.imageAlt || item.heading || feedingTitle,
    })
  );

  // QUALIFICATIONS
  const qualificationsSection = getCommandmentSection(
    page.blocks,
    "qualifications",
    "Qualification required to be member of EMMA"
  );

  // BITTER TRUTH – EDUCATION
  const eduBitterSection = getCommandmentSection(
    page.blocks,
    "edu_bitter",
    "Bitter Truth – Global Educational System and Experts"
  );

  // HEALTHCARE
  const healthcareSection = getCommandmentSection(
    page.blocks,
    "healthcare",
    "Healthcare System"
  );

  // FOR INDIVIDUALS AND UNIVERSITIES
  const uniSection = getCommandmentSection(
    page.blocks,
    "uni",
    "For Individuals and Universities"
  );

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      {/* HERO SECTION */}
      <HeroSection
        title={title}
        subtitle={subtitle}
        cta={cta}
        image={image}
        imageAlt={imageAlt}
      />

      {/* MISSION SECTION */}
      <MissionSection blocks={page.blocks} />
      <SerendipitySection blocks={page.blocks} />

      {/* READ & PONDER SECTION */}
      <ReadPonderSection blocks={page.blocks} />
      <SoulBodySection blocks={page.blocks} />
      <BitterSadTruthSection blocks={page.blocks} />
      <YourParticipation blocks={page.blocks} />

      {/* Feeding the body & the soul – long text (FounderStorySection) */}
      {feedingSections.length > 0 && (
        <FounderStorySection sections={feedingSections} />
      )}

      {/* Qualifications */}
      {qualificationsSection && qualificationsSection.items.length > 0 && (
        <SevenCommandmentsSection
          title={qualificationsSection.title}
          subtitle={qualificationsSection.subtitle}
          challenge={qualificationsSection.challenge}
          commandments={qualificationsSection.items}
          hideSectionHeading={true}
          hideChallengeHeading={true}
        />
      )}

      {/* Bitter Truth – Global Educational System and Experts */}
      {eduBitterSection && eduBitterSection.items.length > 0 && (
        <SevenCommandmentsSection
          title={eduBitterSection.title}
          subtitle={eduBitterSection.subtitle}
          challenge={eduBitterSection.challenge}
          commandments={eduBitterSection.items}
          hideSectionHeading={true}
          hideChallengeHeading={true}
        />
      )}

      {/* Healthcare System */}
      {healthcareSection && healthcareSection.items.length > 0 && (
        <SevenCommandmentsSection
          title={healthcareSection.title}
          subtitle={healthcareSection.subtitle}
          challenge={healthcareSection.challenge}
          commandments={healthcareSection.items}
          hideSectionHeading={true}
          hideChallengeHeading={true}
        />
      )}

      {/* For Individuals and Universities */}
      {uniSection && uniSection.items.length > 0 && (
        <SevenCommandmentsSection
          title={uniSection.title}
          subtitle={uniSection.subtitle}
          challenge={uniSection.challenge}
          commandments={uniSection.items}
          hideSectionHeading={true}
          hideChallengeHeading={true}
        />
      )}
    </AppShell>
  );
}
