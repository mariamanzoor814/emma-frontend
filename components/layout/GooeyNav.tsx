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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const [indicator, setIndicator] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    visible: boolean;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  });

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

  const measureIndicator = () => {
    const el = buttonRefs.current[activeIndex];
    const container = containerRef.current;
    if (!el || !container) {
      setIndicator((s) => ({ ...s, visible: false }));
      return;
    }
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const paddingX = 12;
    let left = Math.max(4, elRect.left - containerRect.left - paddingX);
    let width = Math.min(containerRect.width - 8, elRect.width + paddingX * 2);
    const top = elRect.top - containerRect.top + elRect.height / 2;
    const height = Math.min(Math.max(elRect.height + 10, 36), 48);

    setIndicator({ left, top, width, height, visible: true });
  };

  useEffect(() => {
    measureIndicator();
    const timer = window.setTimeout(measureIndicator, 100);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items]);

  useEffect(() => {
    const onResize = () => measureIndicator();
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | null = null;
    try {
      if (containerRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => measureIndicator());
        ro.observe(containerRef.current);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro && containerRef.current) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div className="relative w-full">
      <div
        className="relative overflow-visible rounded-full shadow-sm"
        style={{
          border: `1px solid ${themeSurfaces.border}`,
          backgroundColor: themeSurfaces.navBackground,
          padding: "6px",
        }}
      >
        <div className="relative flex justify-center px-1">
          <div
            ref={containerRef}
            className="relative flex flex-wrap items-center justify-center gap-2 text-sm font-semibold w-full max-w-[880px] mx-auto"
            style={{ color: themeColors.textPrimary }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-full transition-all duration-200 ease-out"
              style={{
                left: indicator.left,
                top: indicator.top,
                width: indicator.width,
                height: indicator.height,
                backgroundColor: themeSurfaces.hover,
                opacity: indicator.visible ? 1 : 0,
                transform: "translateY(-50%)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              }}
            />

            <div className="relative flex items-center gap-2 px-1">
              {items.map((item, index) => (
                <Link
  key={`${item.href}-${item.label}`}
  href={item.href || "#"}
  ref={(el) => {
    buttonRefs.current[index] = el as unknown as HTMLElement | null;
  }}
  onFocus={() => setActiveIndex(index)}
  className="relative z-10 inline-block rounded-full px-4 py-2 transition-colors duration-150 ease-in-out whitespace-nowrap overflow-hidden truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
  style={{
    color: themeColors.textPrimary,
    background: "transparent",
    textAlign: "center",
    lineHeight: 1.1,
    textDecoration: "none",
    WebkitTapHighlightColor: "transparent" // remove mobile tap highlight
  }}
>
  {item.label}
</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}