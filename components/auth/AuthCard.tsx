// frontend/components/auth/AuthCard.tsx
"use client";

import { ReactNode } from "react";
import Image from "next/image";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
 // <-- NEW DEFAULT
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        {/* BG Gradient */}
        <div className="pointer-events-none absolute inset-x-0 -top-48 h-96 opacity-60">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#a855f7_0,_transparent_60%)]" />
        </div>

        <div className="relative rounded-3xl bg-white px-7 py-10 shadow-xl">
          
          {/* TOP SECTION */}
          <div className="flex flex-col items-center text-center gap-4 mb-7">

            {/* Render only if showLogo = true */}
            

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm text-slate-500 max-w-xs">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <div className="mt-6 text-xs text-slate-500 text-center">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
