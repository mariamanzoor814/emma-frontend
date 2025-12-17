// frontend/app/real-time-quiz/page.tsx
import { AppShell } from "@/components/layout/AppShell";
import { RealTimeQuizLanding } from "@/components/content/pq/RealTimeQuizLanding";
import { getMenu } from "@/lib/api/navigation";

export default async function RealTimeQuizPage() {
  const [topMenu, mainMenu] = await Promise.all([
    getMenu("top"),
    getMenu("main"),
  ]);

  return (
    <AppShell topMenu={topMenu} mainMenu={mainMenu}>
      <RealTimeQuizLanding />
    </AppShell>
  );
}
