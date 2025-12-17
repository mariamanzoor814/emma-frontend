// frontend/app/contact/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { HeroSection } from "@/components/content/HeroSection";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import { ContactSection } from "@/components/content/ContactSection";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const PAGE_SLUG = "contact";

// ---------------- types ----------------
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

// ---------------- helpers ----------------
function getBlock(blocks: Block[] = [], key: string, field = "text") {
  const block = blocks.find((b) => b.key === key);
  if (!block?.value) return "";
  return block.value[field] ?? "";
}

// ---------------- page ----------------
export default async function ContactPage({ searchParams }: PageProps) {
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

  // ---------------- hero ----------------
  const heroTitle = getBlock(blocks, "hero.title") || "Contact Us";
  const heroSubtitle =
    getBlock(blocks, "hero.subtitle") ||
    "Need an expert? Leave your details and we will get back to you.";

  const heroImageRaw = getBlock(blocks, "hero.image", "url");
  const heroImage = heroImageRaw?.startsWith("/media")
    ? `${BACKEND_URL}${heroImageRaw}`
    : heroImageRaw;
  const heroImageAlt = getBlock(blocks, "hero.image", "alt");

  // ---------------- contact blocks ----------------
  const visitTitle = getBlock(blocks, "contact.visit.title");
  const visitText = getBlock(blocks, "contact.visit.text");
  const visitValue = getBlock(blocks, "contact.visit.value");

  const phoneTitle = getBlock(blocks, "contact.phone.title");
  const phoneText = getBlock(blocks, "contact.phone.text");
  const phoneValue = getBlock(blocks, "contact.phone.value");

  const emailTitle = getBlock(blocks, "contact.email.title");
  const emailText = getBlock(blocks, "contact.email.text");
  const emailValue = getBlock(blocks, "contact.email.value");

  const mapEmbedUrl = getBlock(blocks, "contact.map", "url");

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

      <ContactSection
        visit={{ title: visitTitle, text: visitText, value: visitValue }}
        phone={{ title: phoneTitle, text: phoneText, value: phoneValue }}
        email={{ title: emailTitle, text: emailText, value: emailValue }}
        mapEmbedUrl={mapEmbedUrl}
      />
    </AppShell>
  );
}
