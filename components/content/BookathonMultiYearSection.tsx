"use client";

import React, { useMemo, useState } from "react";

type Block = { key: string; value: any };

function getList<T = any>(blocks: Block[] = [], key: string): T[] {
  const b = blocks.find((x) => x.key === key);
  return Array.isArray(b?.value?.items) ? b.value.items : [];
}

export default function BookathonMultiYearSection({
  blocks,
}: {
  blocks: Block[];
}) {
  const years = getList<any>(blocks, "bookathon.years");

  if (!years.length) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16 space-y-16">
      {years.map((year) => {
        const images = year.images || [];

        return (
          <div key={year.id} className="space-y-6">
            {/* Year Heading */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                {year.title}
              </h2>
              {year.subtitle && (
                <p className="max-w-3xl text-base text-slate-600 whitespace-pre-line">
                  {year.subtitle}
                </p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                {images.length} photos · Year {year.id}
              </p>
            </div>

            {/* Image Grid */}
            <div
              className="
                grid gap-4
                [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
              "
            >
              {images.map((img: any, index: number) => (
                <div
                  key={img.id || index}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {(img.caption || img.date) && (
                    <div className="flex justify-between items-center p-3">
                      <div className="text-sm font-medium text-slate-800 line-clamp-2">
                        {img.caption}
                      </div>
                      {img.date && (
                        <div className="text-xs text-slate-500">{img.date}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
