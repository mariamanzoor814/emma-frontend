"use client";

import React from "react";

type PromoBandProps = {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
};

export const PromoBand: React.FC<PromoBandProps> = ({
  title,
  subtitle,
  buttonLabel,
}) => {
  return (
    <section className="mx-auto mt-6 max-w-7xl px-4">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-900 px-8 py-6 text-white md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs md:text-sm text-slate-200">
              {subtitle}
            </p>
          )}
        </div>
        {buttonLabel && (
          <button className="rounded-full bg-white px-6 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100">
            {buttonLabel}
          </button>
        )}
      </div>
    </section>
  );
};
