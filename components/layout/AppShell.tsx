// frontend/components/layout/AppShell.tsx
import { ReactNode } from "react";
import type { MenuItem } from "@/lib/api/navigation";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { themeColors, themeSurfaces } from "@/styles/theme";
import { GlobalFooter } from "./GlobalFooter"; // ⬅️ add this


type AppShellProps = {
  children: ReactNode;
  topMenu: MenuItem[];
  mainMenu: MenuItem[];
  lang?: string;
};

export function AppShell({
  children,
  topMenu,
  mainMenu,
  lang = "en"
}: AppShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: themeSurfaces.appBackground,
        color: themeColors.midnight
      }}
    >
      <TopBar items={topMenu} lang={lang} />
      
        <Sidebar items={mainMenu} topItems={topMenu} lang={lang} />
        <div className="flex flex-1 ">
        <main
          className="flex-1"
          style={{ backgroundColor: themeSurfaces.appBackground }}
        >
          {children}
        </main>
      </div>
      <GlobalFooter /> {/* normal footer, pushed to bottom if content is short */}
    </div>
  );
}
