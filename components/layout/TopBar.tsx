// frontend/components/layout/TopBar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import type { MenuItem } from "@/lib/api/navigation";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";
import { GooeyNav } from "./GooeyNav";
import { themeColors, themeSurfaces } from "@/styles/theme";

type TopBarProps = {
  items: MenuItem[];
  lang?: string;
};

function isAuthMenuItem(item: MenuItem) {
  const titleKey = (item.title_key || "").toLowerCase();
  const key = String((item as any).key || "").toLowerCase();
  const slug = (item.slug || "").toLowerCase();
  const path = String(item.path || (item as any).url || "").toLowerCase();

  return (
    titleKey.includes("login") ||
    titleKey.includes("signup") ||
    titleKey.includes("register") ||
    titleKey.includes("logout") ||
    key.includes("login") ||
    key.includes("signup") ||
    key.includes("register") ||
    key.includes("logout") ||
    slug === "login" ||
    slug === "signup" ||
    slug === "register" ||
    slug === "logout" ||
    path.includes("/login") ||
    path.includes("/signup") ||
    path.includes("/register") ||
    path.includes("/logout")
  );
}

export function TopBar({ items, lang = "en" }: TopBarProps) {
  const router = useRouter();
  const { user, logoutUser, loading } = useAuth();
  const avatarUrl = user?.avatar_url || null;

  const gooeyItems = useMemo(() => {
    const findItem = (key: string) => items.find((it) => it.title_key === key);

    const aboutItem = findItem("menu.top.about") || findItem("menu.top.about-us") || null;
    const contactItem = findItem("menu.top.contact") || findItem("sidebar.contact") || null;

    const extraKeys = [
      "menu.top.platforms"
    ];

    const extraItems = items
      .filter((item) => extraKeys.includes(item.title_key))
      .filter((item) => !isAuthMenuItem(item))
      .map((item) => ({
        label: t(item.title_key, lang),
        href: item.path || "#"
      }));

    const resolved: { label: string; href: string }[] = [{ label: "Home", href: "/" }];

    if (aboutItem) {
      resolved.push({
        label: t(aboutItem.title_key, lang) || "About US",
        href: aboutItem.path || "/mission-statements"
      });
    } else {
      resolved.push({ label: t("menu.top.about", lang) || "About US", href: "/mission-statements" });
    }

    if (contactItem) {
      resolved.push({
        label: t(contactItem.title_key, lang) || "Contact Us",
        href: contactItem.path || "/contact"
      });
    } else {
      resolved.push({ label: t("menu.top.contact", lang) || "Contact Us", href: "/contact" });
    }

    resolved.push(...extraItems);

    const filtered = resolved
      .filter((it) => !String(it.href || "").includes("/login") && !String(it.href || "").includes("/signup"))
      .reduce<{ label: string; href: string }[]>((acc, cur) => {
        if (!acc.find((a) => a.href === cur.href && a.label === cur.label)) acc.push(cur);
        return acc;
      }, []);

    return filtered;
  }, [items, lang]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
    router.refresh();
  };

  const avatarInitial =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.username?.[0]?.toUpperCase() ||
    "U";

  // Previous: go back in history; Next: go forward in history
  const handlePrevious = () => {
    try {
      // prefer Next.js router back
      router.back();
      // router.back() silently does nothing if no history, so keep fallback
      // eslint-disable-next-line no-empty
    } catch (e) {}
    try {
      window.history.back();
    } catch (e) {}
  };

  const handleNext = () => {
    try {
      window.history.forward();
    } catch (e) {}
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: themeSurfaces.navBackground,
        borderBottom: `1px solid ${themeSurfaces.border}`,
        backdropFilter: "blur(6px)"
      }}
    >
      {/* Previous / Next — isolated, far right */}
<div
  className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-2 px-15"
  style={{ pointerEvents: "auto" }}
>
  <button
    onClick={handlePrevious}
    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition hover:opacity-80"
    style={{
      color: themeColors.textPrimary,
      border: `1px solid ${themeSurfaces.border}`,
      backgroundColor: "transparent"
    }}
  >
    Previous
  </button>

  <button
    onClick={handleNext}
    className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition hover:opacity-80"
    style={{
      color: themeColors.textPrimary,
      border: `1px solid ${themeSurfaces.border}`,
      backgroundColor: "transparent"
    }}
  >
    Next
  </button>
</div>


      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-2 py-2
                md:gap-4 md:px-4 md:py-3
                lg:gap-6 lg:px-6 lg:py-4">

        <div className="flex min-w-[240px] flex-1 items-center gap-3 md:flex-none">
          <div className="flex flex-col items-end leading-tight text-right">
            <span
              className="text-2xs font-semibold tracking-[0.12em] uppercase"
              style={{ color: themeColors.textPrimary }}
            >
              {t("layout.brand.line1", lang)}
            </span>
            <span className="text-2sm font-semibold" style={{ color: themeColors.textPrimary }}>
              {t("layout.brand.line2", lang)}
            </span>
          </div>

          <div className="h-14 w-14 overflow-hidden rounded-full" style={{ backgroundColor: themeSurfaces.hover }}>
            <Image
              src="/assets/emma-logo.png"
              alt="EMMA Foundation"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span
              className="text-2xs font-bold tracking-[0.1em] uppercase"
              style={{ color: themeColors.textPrimary }}
            >
              Path to "The 1% & Better"
            </span>
          </div>
        </div>

        <div className="order-3 hidden w-full min-w-0
                md:order-2 md:block md:flex-1
                md:px-2 lg:px-0">

          <div className="w-full overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <GooeyNav items={gooeyItems} initialActiveIndex={0} />
          </div>
        </div>

        <div className="order-2 ml-auto flex items-center gap-1
                md:order-3 md:ml-0 md:gap-2
                lg:gap-3 flex-shrink-0">          
          <LanguageSwitcher currentLang={lang} />

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs md:gap-3 md:text-sm">
            <Link
              href="/donation-contact-login"
              className="whitespace-nowrap rounded-md px-3 py-2 font-semibold text-white md:px-4"
              style={{ backgroundColor: themeSurfaces.accent, border: `1px solid ${themeSurfaces.border}` }}
            >
              {t("menu.top.donation", lang)}
            </Link>

            {loading && <div className="text-xs text-gray-500">...</div>}

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-semibold
                              md:px-3 md:py-2 md:text-sm
                              lg:px-4"
                  style={{
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeSurfaces.border}`,
                    backgroundColor: "transparent"
                  }}
                >
                  {t("menu.top.login", lang)}
                </Link>

                <Link
                  href="/signup"
                  className="whitespace-nowrap rounded-md px-3 py-2 font-semibold text-white md:px-4"
                  style={{
                    backgroundColor: themeSurfaces.accent,
                    border: `1px solid ${themeSurfaces.border}`
                  }}
                >
                  {t("menu.top.signup", lang)}
                </Link>
              </>
            )}

            {!loading && user && (
              <button
                onClick={handleLogout}
                className="whitespace-nowrap rounded-md px-3 py-2 font-semibold text-white md:px-4"
                style={{
                  backgroundColor: themeSurfaces.accent,
                  border: `1px solid ${themeSurfaces.border}`
                }}
              >
                {t("menu.top.logout", lang)}
              </button>
            )}
          </div>

          {!loading && user && (
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="group relative h-11 w-11 overflow-hidden rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                borderColor: themeSurfaces.border,
                backgroundColor: themeSurfaces.hover
              }}
              title="Go to profile"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm font-semibold"
                  style={{ color: themeColors.textPrimary }}
                >
                  {avatarInitial}
                </div>
              )}
              <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] opacity-0 transition duration-200 group-hover:opacity-100" />
            </button>
          )}
        </div>      
      </div>
      
    </header>
    
  );
}
