// frontend/app/feeding-the-children/page.tsx

import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import Image from "next/image";
import Bookathon2024Section from "@/components/content/Bookathon2024Section";
import BookathonMultiYearSection from "@/components/content/BookathonMultiYearSection";

const PAGE_SLUG = "feeding-the-children";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getBlock(
  blocks: { key: string; value: any }[],
  key: string,
  field: string = "text"
): string {
  const b = blocks.find((x) => x.key === key);
  if (!b || !b.value) return "";
  return b.value[field] ?? "";
}

export default async function HomePage(props: PageProps) {
  // ✅ unwrap the Promise first
  const resolvedParams = (await props.searchParams) ?? {};

  const rawLang = resolvedParams.lang;
  const lang =
    (Array.isArray(rawLang) ? rawLang[0] : rawLang)?.toLowerCase() || "en";

  const [topMenu, mainMenu, page] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(PAGE_SLUG, lang),
  ]);

  const title = getBlock(page.blocks, "hero.title");
  const subtitle = getBlock(page.blocks, "hero.subtitle");
  const cta = getBlock(page.blocks, "hero.cta_label");
  const heroImage =
    getBlock(page.blocks, "hero.image", "url") || "/assets/hero.jpg";
  const heroAlt =
    getBlock(page.blocks, "hero.image", "alt") || "EMMA Foundation";

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      {/* Hero section */}
      <section className="relative min-h-[420px] md:min-h-[520px] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[420px] md:min-h-[520px] items-center justify-center px-6 md:px-16">
          <div className="max-w-3xl text-center text-white animate-fade-up">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-sm md:text-lg mb-6 text-gray-100">
              {subtitle}
            </p>
            <button className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm md:text-base font-semibold shadow-lg hover:bg-indigo-700 transition-transform duration-200 hover:-translate-y-0.5">
              {cta}
            </button>
          </div>
        </div>
      </section>

      {/* Bookathon gallery section inside Feeding the Children */}
      <Bookathon2024Section blocks={page.blocks} />
    </AppShell>
  );
}
