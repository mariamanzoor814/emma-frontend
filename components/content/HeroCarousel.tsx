"use client";

import React, { useEffect, useState } from "react";
import type { HeroSlide } from "./types";

type HeroCarouselProps = {
  slides: HeroSlide[];
  autoPlayIntervalMs?: number;
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  autoPlayIntervalMs = 7000,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayIntervalMs);
    return () => clearInterval(id);
  }, [slides.length, autoPlayIntervalMs]);

  if (!slides.length) return null;
  const slide = slides[index];
  const bg = slide.backgroundColor || "#d4e43b";

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setIndex((prev) => (prev + 1) % slides.length);

  return (
    <section className="mx-auto mt-4 max-w-7xl px-4">
      <div
  className="relative flex min-h-[380px] flex-col justify-between rounded-3xl px-8 py-12 md:min-h-[320px] md:flex-row md:items-center md:gap-10"
  style={{ backgroundColor: bg }}
>

        {/* Slide content */}
        <div className="max-w-md space-y-4 px-8 md:px-16 lg:px-20">

          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-sm text-slate-800">{slide.subtitle}</p>
          )}
          {slide.buttonLabel && (
           <button className="mt-4 inline-flex rounded-full bg-slate-900 px-10 py-4 text-sm font-semibold text-white hover:bg-black">

              {slide.buttonLabel}
            </button>
          )}
        </div>

        {/* Right items */}
        <div className="mt-6 flex flex-1 flex-wrap justify-center gap-10 px-8 md:mt-0 md:justify-end md:px-16 lg:px-15">

          {slide.items?.map((item) => (
            <div key={item.id} className="text-center text-sm text-slate-900">
              <div className="mb-2 flex h-36 w-36 items-center justify-center rounded-full bg-lime-200/40 md:h-40 md:w-40">

                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="max-h-24 max-w-[87%] object-contain"
                />
              </div>
              <button className="text-xs font-medium hover:underline">
                {item.label} &gt;
              </button>
            </div>
          ))}
        </div>

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 hidden h-14 w-14 text-xl -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-sm shadow-sm hover:bg-white md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 hidden  h-14 w-14 text-xl -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-sm shadow-sm hover:bg-white md:flex"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* dots */}
      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? "bg-slate-900" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
