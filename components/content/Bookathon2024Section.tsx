"use client";

import React, { useMemo, useState } from "react";

type Block = { key: string; value: any };

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

function resolveImageUrl(url?: string) {
  if (!url) return "";
  return url.startsWith("/media") ? `${BACKEND_URL}${url}` : url;
}

function getBlock(blocks: Block[] = [], key: string, field = "text") {
  const b = blocks.find((x) => x.key === key);
  return b?.value?.[field] ?? "";
}

function getList<T = any>(blocks: Block[] = [], key: string): T[] {
  const b = blocks.find((x) => x.key === key);
  const items = b?.value?.items;
  return Array.isArray(items) ? items : [];
}

type GalleryImage = {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  date?: string;
  tags?: string[];
};

type BookathonYear = {
  id: string;
  label?: string;
  title?: string;
  subtitle?: string;
  images: GalleryImage[];
};

export default function Bookathon2024Section({ blocks }: { blocks: Block[] }) {
  const globalTitle =
    getBlock(blocks, "bookathon.global.title") || "Bookathon Gallery";
  const globalSubtitle =
    getBlock(blocks, "bookathon.global.subtitle") || "";

  const multiYears = useMemo(() => {
    const raw = getList<any>(blocks, "bookathon.years");
    return raw
      .map((y, idx) => {
        if (!y) return null;
        const id = String(y.id || y.label || idx + 1);

        const images: GalleryImage[] = (Array.isArray(y.images)
          ? y.images
          : []
        )
          .filter((img: any) => img?.url)
          .map((img: any, i: number) => ({
            id: img.id || `${id}-${i}`,
            url: resolveImageUrl(img.url),
            alt: img.alt,
            caption: img.caption,
            date: img.date,
            tags: img.tags,
          }));

        return {
          id,
          label: y.label || `Bookathon ${id}`,
          title: y.title || "",
          subtitle: y.subtitle || "",
          images,
        } as BookathonYear;
      })
      .filter(Boolean) as BookathonYear[];
  }, [blocks]);

  const legacyImages = useMemo(
    () =>
      getList<GalleryImage>(blocks, "bookathon2024.images")
        .filter((x) => x?.url)
        .map((img) => ({
          ...img,
          url: resolveImageUrl(img.url),
        })),
    [blocks]
  );

  const sections: BookathonYear[] =
    multiYears.length > 0
      ? multiYears
      : legacyImages.length > 0
      ? [
          {
            id: "2024",
            label: "Bookathon 2024",
            title: globalTitle,
            subtitle: globalSubtitle,
            images: legacyImages,
          },
        ]
      : [];

  if (sections.length === 0) return null;

  const [lightboxYearId, setLightboxYearId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeYear =
    lightboxYearId !== null
      ? sections.find((y) => y.id === lightboxYearId) || null
      : null;

  const activeImage =
    activeYear && lightboxIndex !== null
      ? activeYear.images[lightboxIndex]
      : null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">

      <div className="space-y-12">
        {sections.map((year) => (
          <section
            key={year.id}
          >
            {/* Header */}
            <div className="mb-6">
              <span className="inline-block rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-wider text-white">
                {year.label}
              </span>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                {year.title}
              </h3>
              {year.subtitle && (
                <p className="mt-1 text-sm text-slate-600">
                  {year.subtitle}
                </p>
              )}
            </div>

            {/* 🔥 Masonry Layout */}
            <div
                className={`grid gap-4 ${
                  year.images.length <= 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : year.images.length <= 4
                    ? "grid-cols-2 sm:grid-cols-3"
                    : year.images.length <= 6
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                }`}
              >

              {year.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setLightboxYearId(year.id);
                    setLightboxIndex(index);
                  }}
                  className="group relative block w-full overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    loading="lazy"
                    className="w-full h-auto rounded-2xl transition-transform duration-500 group-hover:brightness-105
"
                  />

                  {(img.caption || img.date) && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      {img.caption && (
                        <p className="text-xs font-medium text-white">
                          {img.caption}
                        </p>
                      )}
                      {img.date && (
                        <span className="mt-1 block text-[10px] text-white/80">
                          {img.date}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Lightbox */}
      {activeYear && activeImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setLightboxYearId(null);
            setLightboxIndex(null);
          }}
        >
          <img
            src={activeImage.url}
            alt={activeImage.alt || ""}
            className="max-h-[90vh] max-w-4xl rounded-xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
