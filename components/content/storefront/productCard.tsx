import React from "react";
import type { Product } from "./types";

type ProductCardProps = {
  product: Product;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Normalize price / oldPrice to numbers
  const price =
    typeof product.price === "string"
      ? parseFloat(product.price)
      : product.price ?? 0;

  const oldPriceRaw =
    typeof product.oldPrice === "string"
      ? parseFloat(product.oldPrice)
      : product.oldPrice ?? undefined;

  const hasOld = typeof oldPriceRaw === "number" && oldPriceRaw > price;

  return (
    <div className="flex min-w-[160px] max-w-[200px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="mb-3 flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-28 w-28 object-contain"
        />
      </div>

      <div className="flex-1 space-y-1">
        <p className="line-clamp-2 text-xs text-gray-800">{product.title}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {product.currency}
            {price.toFixed(2)}
          </span>

          {hasOld && (
            <span className="text-[11px] text-gray-400 line-through">
              {product.currency}
              {oldPriceRaw!.toFixed(2)}
            </span>
          )}
        </div>

        {product.badgeText && (
          <span className="inline-flex mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            {product.badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
