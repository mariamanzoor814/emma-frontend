"use client";

import React from "react";
import type { ProductSection } from "./types";
import { ProductCard } from "./productCard";

type ProductSectionRowProps = {
  section: ProductSection;
  seeAllHref?: string;
};

export const ProductSectionRow: React.FC<ProductSectionRowProps> = ({
  section,
  seeAllHref,
}) => {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {section.title}
          </h3>
          {section.subtitle && (
            <p className="text-xs text-gray-600">{section.subtitle}</p>
          )}
        </div>
        {seeAllHref && (
          <a
            href={seeAllHref}
            className="text-xs font-medium text-blue-700 hover:underline"
          >
            See all
          </a>
        )}
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {section.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
