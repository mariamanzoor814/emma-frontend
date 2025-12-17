// frontend/app/[slug]/page.tsx
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";
import { AppShell } from "@/components/layout/AppShell";

type PageProps = {
  params: { slug: string | string[] };
  searchParams?: { lang?: string };
};

function getBlockValue(
  blocks: { key: string; value: any }[],
  key: string,
  field: string = "text"
): string {
  const block = blocks.find((b) => b.key === key);
  if (!block || !block.value) return "";
  return block.value[field] ?? "";
}

export default async function ContentPage(props: PageProps) {
  // 1️⃣ Await params if it is a Promise
  const params = await props.params;
  const slugStr = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;

  const lang = (props.searchParams?.lang ?? "en").toLowerCase();

  // 2️⃣ Fetch menus and page
  const [topMenu, mainMenu, pageData] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage(slugStr, lang).catch(() => null),
  ]);

  const title = pageData
    ? getBlockValue(pageData.blocks, "page.title")
    : slugStr.replace(/-/g, " ");

  const body = pageData
    ? getBlockValue(pageData.blocks, "page.body")
    : "This page is under construction or coming soon.";

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>
      </div>
    </AppShell>
  );
}
