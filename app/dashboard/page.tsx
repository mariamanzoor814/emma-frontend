// frontend/app/dashboard/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { getMenu } from "@/lib/api/navigation";
import { getPage } from "@/lib/api/content";

export const revalidate = 0;

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lang = (sp?.lang ?? "en").toLowerCase();

  const [topMenu, mainMenu, footerPage] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
    getPage("global-footer", lang), // fetch footer content
  ]);

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      {/* Make the main container a flex column with min-height */}
      <div className="flex flex-col min-h-[80vh] p-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard!</h1>
          <p className="text-gray-700 text-lg">
            You are successfully logged in via Google.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-200 text-gray-600 text-sm">
          {footerPage?.blocks?.map((block: any) => (
            <div key={block.key}>{block.value?.text}</div>
          ))}
        </footer>
      </div>
    </AppShell>
  );
}
