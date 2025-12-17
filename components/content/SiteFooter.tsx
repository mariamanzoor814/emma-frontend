import React from "react";
import Image from "next/image";
import Link from "next/link";
import { themeColors, themeSurfaces } from "@/styles/theme";

type FooterLink = { id: string; label: string; href: string };
type FooterColumn = { id: string; title: string; links: FooterLink[] };

type SiteFooterProps = {
  brandName: string;
  tagline: string;
  logoSrc: string;
  logoAlt?: string;
  columns: FooterColumn[];
  ecosystemText: string;
};

export const SiteFooter: React.FC<SiteFooterProps> = ({
  brandName,
  tagline,
  logoSrc,
  logoAlt = "Logo",
  columns,
  ecosystemText,
}) => {
  return (
    <footer
      className="mt-16 border-t"
      style={{
        backgroundColor: themeColors.midnight,
        borderColor: themeSurfaces.border,
        color: "#f9fafb",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        {/* Top section */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand / logo + copy */}
          <div className="max-w-sm space-y-4 text-center md:text-left md:space-y-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 md:justify-start"
            >
              {/* Responsive logo size */}
              <div
                className="relative h-12 w-12 overflow-hidden rounded-full border bg-white/10 shadow-sm md:h-16 md:w-16"
                style={{ borderColor: "rgba(255,255,255,0.4)", borderWidth: 1 }}
              >
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  fill
                  className="object-contain"
                />
              </div>

              <span className="text-base font-semibold tracking-tight text-white md:text-lg">
                {brandName}
              </span>
            </Link>

            <p className="text-[13px] leading-relaxed text-white/85 md:text-sm">
              {tagline}
            </p>
          </div>

          {/* Columns */}
          <div className="grid w-full flex-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col.id} className="space-y-3 text-center sm:text-left">
                <h4 className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-white/80 transition-colors hover:text-white hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px w-full bg-white/20" />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-[11px] text-white/80 sm:text-xs md:flex-row md:items-center">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Secure checkout</span>
            </span>
            <span className="hidden h-3 w-px bg-white/35 md:inline-block" />
            <span className="text-white/80 text-center md:text-left">
              {ecosystemText}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
