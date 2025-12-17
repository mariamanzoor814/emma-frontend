"use client";

import React from "react";
import type { HeroSlide } from "./types";

type HeroBannerProps = {
  slide: HeroSlide;
};

export const HeroBanner: React.FC<HeroBannerProps> = ({ slide }) => {
  const bg = slide.backgroundColor || "#d4e43b"; // similar to screenshot

  return (
    <section className="mx-auto mt-4 max-w-7xl px-4">
      <div
        className="flex flex-col justify-between rounded-3xl px-8 py-8 md:flex-row md:items-center md:gap-10"
        style={{ backgroundColor: bg }}
      >
        {/* Left text */}
        <div className="max-w-md space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-sm text-slate-800">{slide.subtitle}</p>
          )}
          {slide.buttonLabel && (
            <button className="mt-2 inline-flex rounded-full bg-slate-900 px-6 py-2 text-xs font-semibold text-white hover:bg-black">
              {slide.buttonLabel}
            </button>
          )}
        </div>

        {/* Right items like Sofas / Dining sets / Beds */}
        <div className="mt-6 flex flex-1 flex-wrap justify-center gap-8 md:mt-0 md:justify-end">
          {slide.items?.map((item) => (
            <div key={item.id} className="text-center text-sm text-slate-900">
              <div className="mb-2 flex h-28 w-28 items-center justify-center rounded-full bg-lime-200/40">
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="max-h-24 max-w-[80%] object-contain"
                />
              </div>
              <button className="text-xs font-medium hover:underline">
                {item.label} &gt;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* little dots under hero */}
      <div className="mt-3 flex justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      </div>
    </section>
  );
};
