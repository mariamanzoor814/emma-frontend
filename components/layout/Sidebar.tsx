// Sidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import type { MenuItem } from "@/lib/api/navigation";
import { t } from "@/lib/i18n";

import {
  HomeLine,
  Rows01,
  BarChartSquare02,
  Folder,
  Settings01,
  MessageChatCircle,
  ChevronDown
} from "@untitledui/icons";
import { themeColors, themeSurfaces } from "@/styles/theme";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  // Numbered sidebar keys (preferred)
  "sidebar.1": HomeLine,
  "sidebar.1.1": Rows01,
  "sidebar.1.2": Rows01,
  "sidebar.1.3": Rows01,
  "sidebar.1.4": Rows01,

  "sidebar.2": Folder,
  "sidebar.2.1": BarChartSquare02,
  "sidebar.2.2": BarChartSquare02,

  "sidebar.3": Folder,
  "sidebar.3.1": Rows01,
  "sidebar.3.2": BarChartSquare02,
  "sidebar.3.3": Rows01,
  "sidebar.3.4": Rows01,
  "sidebar.3.5": Rows01,

  "sidebar.4": Folder,
  "sidebar.4.1": Rows01,
  "sidebar.4.2": Rows01,
  "sidebar.4.3": Rows01,
  "sidebar.4.4": Rows01,
  "sidebar.4.5": Rows01,
  "sidebar.4.6": Rows01,
  "sidebar.4.7": Rows01,
  "sidebar.4.8": Rows01,
  "sidebar.4.9": Rows01,

  "sidebar.5": Folder,
  "sidebar.5.1": Folder,
  "sidebar.5.2": Rows01,
  "sidebar.5.3": Settings01,
  "sidebar.5.4": Rows01,
  "sidebar.5.5": Rows01,

  "sidebar.6": Folder,
  "sidebar.6.1": MessageChatCircle,
  "sidebar.6.2": MessageChatCircle,
  "sidebar.6.3": MessageChatCircle,
  "sidebar.6.4": MessageChatCircle,
  "sidebar.6.5": Rows01,

  "sidebar.7": Folder,
  "sidebar.7.1": Rows01,
  "sidebar.7.2": Rows01,
  "sidebar.7.3": Rows01,
  "sidebar.7.4": Rows01,

  "sidebar.8": Folder,
  "sidebar.8.1": Rows01,
  "sidebar.8.2": Rows01,
  "sidebar.8.3": Rows01,
  "sidebar.8.4": Rows01,

  // fallbacks / legacy keys (keeps previous code working)
  "sidebar.home_main": HomeLine,
  "sidebar.pistons_poster": Rows01,
  "sidebar.about_founder": Rows01,
  "sidebar.7_commandments": Rows01,
  "sidebar.mission_statements": Rows01,
  "sidebar.donation_contact_login": Rows01,
  "sidebar.feeding_children": BarChartSquare02,
  "sidebar.8_clubs": Folder,
  "sidebar.book_of_truth": Folder,
  "sidebar.entrepreneurs_investors": Rows01,
  "sidebar.clap_investment_club": Rows01,
  "sidebar.truth_machine": Settings01,
  "sidebar.meetup_group": MessageChatCircle,
  "sidebar.local_chapter": MessageChatCircle,
  "sidebar.platforms": Folder,
  "sidebar.real_time_quiz": Rows01,
  "sidebar.platforms.real_time_quiz": Rows01,
  "sidebar.hft": Rows01,
  "sidebar.platforms.hft": Rows01,
  "sidebar.platforms.pee": Folder,
  "sidebar.platforms.truth_machine": Settings01,
  "sidebar.platforms.shopping_mall": Rows01,
  "sidebar.platforms.discourse": MessageChatCircle,
  "sidebar.platforms.service_providers": Rows01,
  "sidebar.mentoring": Folder,
  "sidebar.mentoring.hygieia": BarChartSquare02,
  "sidebar.mentoring.clap": Rows01,
  "sidebar.mentoring.entrepreneur": Rows01,
  "sidebar.mentoring.youtube": MessageChatCircle,
  "sidebar.mentoring.meetup": MessageChatCircle
};


const defaultIcon: IconComponent = Folder;

type SidebarProps = {
  items: MenuItem[];
  topItems?: MenuItem[];
  lang?: string;
};

export function Sidebar({ items, topItems, lang = "en" }: SidebarProps) {
  const pathname = usePathname();

  // Desktop collapse state (for md+)
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);

  // Mobile fullscreen menu open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Remove the "Platforms" parent group from sidebar
  const filteredItems = useMemo(
    () => items.filter((item) => item.title_key !== "sidebar.platforms"),
    [items]
  );

  const activeParentId = useMemo(() => {
    let active: number | null = null;
    filteredItems.forEach((item) => {
      if (item.path && pathname === item.path) active = item.id;
      item.children?.forEach((child) => {
        if (child.path && pathname === child.path) active = item.id;
      });
    });
    return active;
  }, [filteredItems, pathname]);

  // auto-open the active group
  useEffect(() => {
    if (activeParentId != null) {
      setOpenGroups((prev) => ({ ...prev, [activeParentId]: true }));
    }
  }, [activeParentId]);

  const toggleGroup = (id: number) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleCollapse = () => {
    setCollapsed((c) => !c);
    setToast((prev) =>
      prev && !collapsed ? null : collapsed ? "Sidebar expanded" : "Sidebar collapsed"
    );
  };

  const handleToggleMobile = () => {
    setMobileOpen((open) => !open);
  };

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const isActivePath = (path?: string | null) =>
    !!path && pathname === path;

  const desktopTextColor = themeColors.textMuted;

  // ---------- MOBILE NAV (FULL SCREEN) ----------
  const renderMobileNav = () => (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* Top items section */}
      {topItems && topItems.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500">
            {t("sidebar.section.top", lang)}
          </div>
          <ul className="space-y-1">
            {topItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path || "#"}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    pathname === item.path
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="truncate">
                    {t(item.title_key, lang)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main section */}
      <div className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500">
        {t("sidebar.section.main", lang)}
      </div>
      <ul className="space-y-1">
        {filteredItems.map((item) => {
          const Icon = iconMap[item.title_key] ?? defaultIcon;
          const hasChildren = !!item.children && item.children.length > 0;
          const groupOpen = openGroups[item.id] || false;
          const parentActive = activeParentId === item.id;
          const directActive = isActivePath(item.path);
          const isGroupHeading = hasChildren && !item.path;

          return (
            <li key={item.id}>
              <div className="flex items-center gap-1">
                {isGroupHeading ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={clsx(
                      "flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full",
                      parentActive
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4 shrink-0", parentActive ? "text-slate-900" : "text-slate-500")} />
                    <span className="truncate">
                      {t(item.title_key, lang)}
                    </span>
                    <ChevronDown
                      className={clsx(
                        "ml-auto h-3 w-3 transition-transform text-slate-400",
                        groupOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                ) : (
                  <>
                    <Link
                      href={item.path || "#"}
                      className={clsx(
                        "flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                        parentActive || directActive
                         ? "bg-slate-100 text-slate-900 font-medium"
                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className={clsx("h-4 w-4 shrink-0", (parentActive || directActive) ? "text-slate-900" : "text-slate-500")} />
                      <span className="truncate">
                        {t(item.title_key, lang)}
                      </span>
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className="mr-2 flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <ChevronDown
                          className={clsx(
                            "h-3 w-3 transition-transform",
                            groupOpen ? "rotate-180" : "rotate-0"
                          )}
                        />
                      </button>
                    )}
                  </>
                )}
              </div>

              {hasChildren && (
                <div
                  className={clsx(
                    "ml-6 border-l border-slate-200 pl-3 space-y-1 overflow-hidden transition-all duration-200",
                    groupOpen ? "max-h-96 py-1" : "max-h-0 py-0"
                  )}
                >
                  {item.children!.map((child) => {
                    const childActive = isActivePath(child.path);
                    return (
                      <Link
                        key={child.id}
                        href={child.path || "#"}
                        className={clsx(
                          "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
                          childActive
                            ? "bg-slate-100 text-slate-900 font-medium"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span
                          className={clsx(
                            "h-1.5 w-1.5 rounded-full shrink-0",
                            childActive ? "bg-slate-900" : "bg-slate-300"
                          )}
                        />
                        <span className="truncate">
                          {t(child.title_key, lang)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (md and up) */}
      <aside
  className={clsx(
    "hidden md:flex flex-col fixed left-0 z-30 transition-all duration-200 shadow-sm",
    collapsed ? "w-16" : "w-64"
  )}
  style={{
    top: "84px", // TOPBAR HEIGHT
    height: "calc(100vh - 84px)", // 🔥 THIS IS THE KEY
    backgroundColor: themeSurfaces.cardBackground,
    borderRight: `1px solid ${themeSurfaces.border}`,
    color: desktopTextColor
  }}
>
        {/* Toggle bar with hamburger / X icon (no text) */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          className={clsx(
            "h-10 w-full flex items-center justify-center px-3 text-xs font-medium",
            "hover:opacity-90"
          )}
          style={{
            color: desktopTextColor,
            borderBottom: `1px solid ${themeSurfaces.border}`
          }}
        >
          <span className="relative block h-4 w-5">
            {collapsed ? (
              <>
                {/* Hamburger */}
                <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-current" />
                <span className="absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current" />
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current" />
              </>
            ) : (
              <>
                {/* X */}
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </>
            )}
          </span>
          <span className="sr-only">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </button>

        {/* MAIN label */}
        {!collapsed && (
          <div
            className="px-4 pt-4 pb-2 text-[11px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: desktopTextColor }}
          >
            {t("sidebar.section.main", lang)}
          </div>
        )}

        <nav
          className={clsx(
            "flex-1 overflow-y-auto pb-20",
            collapsed ? "px-1 pt-2" : "px-2 pt-2"
          )}
        >
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = iconMap[item.title_key] ?? defaultIcon;
              const hasChildren = !!item.children && item.children.length > 0;
              const groupOpen = openGroups[item.id] || false;
              const parentActive = activeParentId === item.id;
              const directActive = isActivePath(item.path);

              const isGroupHeading = hasChildren && !item.path;

              return (
                <li key={item.id}>
                  {/* parent row */}
                  <div className="flex items-center gap-1">
                    {isGroupHeading ? (
                      // GROUP HEADING
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className={clsx(
                          "flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full",
                          parentActive
                            ? "opacity-100"
                            : "hover:opacity-90",
                          collapsed && "justify-center px-0"
                        )}
                        style={{
                          backgroundColor: parentActive
                            ? themeSurfaces.hover
                            : "transparent",
                          color: desktopTextColor
                        }}
                      >
                        {Icon && (
                          <Icon
                            className={clsx(
                              "h-4 w-4 shrink-0",
                              parentActive ? "text-[#1f2f59]" : "text-[#1f2f59]/70"
                            )}
                          />
                        )}
                        {!collapsed && (
                          <>
                            <span className="truncate">
                              {t(item.title_key, lang)}
                            </span>
                            <ChevronDown
                              className={clsx(
                                "ml-auto h-3 w-3 transition-transform",
                                groupOpen ? "rotate-180" : "rotate-0"
                              )}
                              style={{ color: desktopTextColor }}
                            />
                          </>
                        )}
                      </button>
                    ) : (
                      // NORMAL LINK
                      <>
                        <Link
                          href={item.path || "#"}
                          className={clsx(
                            "flex-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                            parentActive || directActive
                              ? "opacity-100"
                              : "hover:opacity-90",
                            collapsed && "justify-center px-0"
                          )}
                          style={{
                            backgroundColor:
                              parentActive || directActive
                                ? themeSurfaces.hover
                                : "transparent",
                            color: desktopTextColor
                          }}
                        >
                          {Icon && (
                            <Icon
                              className={clsx(
                                "h-4 w-4 shrink-0",
                                parentActive || directActive
                                  ? "text-[#1f2f59]"
                                  : "text-[#1f2f59]/70"
                              )}
                            />
                          )}
                          {!collapsed && (
                            <span className="truncate">
                              {t(item.title_key, lang)}
                            </span>
                          )}
                        </Link>

                        {hasChildren && !collapsed && (
                          <button
                            type="button"
                            onClick={() => toggleGroup(item.id)}
                            className="mr-2 h-6 w-6 flex items-center justify-center rounded-md hover:opacity-90"
                            style={{ color: desktopTextColor }}
                          >
                            <ChevronDown
                              className={clsx(
                                "h-3 w-3 transition-transform",
                                groupOpen ? "rotate-180" : "rotate-0"
                              )}
                              style={{ color: desktopTextColor }}
                            />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* children dropdown */}
                  {hasChildren && !collapsed && (
                    <div
                      className={clsx(
                        "ml-6 border-l pl-3 space-y-1 overflow-hidden transition-all duration-200",
                        groupOpen ? "max-h-96 py-1" : "max-h-0 py-0"
                      )}
                      style={{ borderColor: themeSurfaces.border }}
                    >
                      {item.children!.map((child) => {
                        const childActive = isActivePath(child.path);
                        return (
                          <Link
                            key={child.id}
                            href={child.path || "#"}
                            className={clsx(
                              "flex items-center gap-2 rounded-md px-2 py-1 text-xs",
                              childActive
                                ? "opacity-100"
                                : "hover:opacity-90"
                            )}
                            style={{
                              backgroundColor: childActive
                                ? themeSurfaces.hover
                                : "transparent",
                              color: desktopTextColor
                            }}
                          >
                            <span
                              className={clsx(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                childActive ? "bg-[#1f2f59]" : "bg-[#1f2f59]/40"
                              )}
                            />
                            <span className="truncate">
                              {t(child.title_key, lang)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* MOBILE HAMBURGER BUTTON (always visible on small screens) */}
      <button
  type="button"
  onClick={handleToggleMobile}
  className="fixed top-20 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg bg-white/90 text-slate-800 md:hidden"
>

        {mobileOpen ? (
          // X icon
          <span className="relative block h-4 w-4">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
          </span>
        ) : (
          // Hamburger
          <span className="relative block h-3 w-4">
            <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-current" />
            <span className="absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current" />
            <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current" />
          </span>
        )}
      </button>

      {/* MOBILE FULLSCREEN SIDEBAR OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white md:hidden">
          {/* Header row */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold tracking-[0.16em] uppercase text-slate-800">
              Menu
            </span>
            <button
              type="button"
              onClick={handleToggleMobile}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <span className="relative block h-4 w-4">
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
            </button>
          </div>

          {renderMobileNav()}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-4 bottom-16 z-50 rounded-lg text-xs px-3 py-2 shadow-lg"
          style={{
            backgroundColor: themeSurfaces.border,
            color: themeColors.textPrimary
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
