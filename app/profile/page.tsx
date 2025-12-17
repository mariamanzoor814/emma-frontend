import { AppShell } from "@/components/layout/AppShell";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { getMenu } from "@/lib/api/navigation";

type RawSearchParams = {
  lang?: string;
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function ProfilePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lang = (sp?.lang ?? "en").toLowerCase();

  const [topMenu, mainMenu] = await Promise.all([
    getMenu("top"),
    getMenu("main")
  ]);

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu} lang={lang}>
      <ProfileSettings />
    </AppShell>
  );
}
