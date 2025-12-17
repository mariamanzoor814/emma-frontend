"use client";

import React from "react";
import type { CircleCategory } from "./types";

type CircleCategoryRowProps = {
  title: string;
  subtitle?: string;
  items: CircleCategory[];
};

export const CircleCategoryRow: React.FC<CircleCategoryRowProps> = ({
  title,
  subtitle,
  items,
}) => {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-600">{subtitle}</p>
        )}
      </header>

      <div className="flex gap-6 overflow-x-auto pb-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href ?? "#"}
            className="flex w-28 flex-col items-center text-center text-xs text-gray-800"
          >
            <div className="mb-2 h-28 w-28 rounded-full bg-gray-100">
              <img
                src={item.imageUrl}
                alt={item.label}
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};
