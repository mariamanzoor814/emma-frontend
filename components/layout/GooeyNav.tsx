"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { themeColors, themeSurfaces } from "@/styles/theme";

type GooeyNavItem = {
  label: string;
  href: string;
};

type GooeyNavProps = {
  items: GooeyNavItem[];
  initialActiveIndex?: number;
};

export function GooeyNav({
  items,
  initialActiveIndex = 0,
}: GooeyNavProps) {
  const pathname = usePathname();

  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  useEffect(() => {
    if (!pathname) return;
    const matchIndex = items.findIndex((item) => {
      if (!item.href || item.href === "#") return false;
      if (item.href === "/") return pathname === "/";
      return pathname.startsWith(item.href);
    });
    if (matchIndex >= 0) {
      setActiveIndex(matchIndex);
    }
  }, [pathname, items]);

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-hidden rounded-full shadow-lg backdrop-blur"
        style={{
          border: `1px solid ${themeSurfaces.border}`,
          backgroundColor: themeSurfaces.navBackground
        }}
      >
        <div className="relative flex justify-center px-2 py-2 sm:px-3">
          <div
            className="relative flex flex-wrap items-center justify-center gap-1 text-sm font-semibold sm:text-xm"
            style={{ color: themeColors.textPrimary }}
          >
            {items.map((item, index) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href || "#"}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className="relative z-10 rounded-full px-4 py-2 transition-opacity"
                style={{
                  color: themeColors.textPrimary,
                  opacity: activeIndex === index ? 1 : 0.82
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
