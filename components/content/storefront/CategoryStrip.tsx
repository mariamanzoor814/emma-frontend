"use client";

import React from "react";
import type { MainCategory } from "./types";

type CategoryStripProps = {
  categories: MainCategory[];
};

export const CategoryStrip: React.FC<CategoryStripProps> = ({
  categories,
}) => {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-2 text-xs sm:text-sm">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={cat.href ?? "#"}
            className="whitespace-nowrap text-gray-700 hover:text-blue-700"
          >
            {cat.label}
          </a>
        ))}
      </div>
    </nav>
  );
};
