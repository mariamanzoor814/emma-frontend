"use client";

import React from "react";
import type { TopLink } from "./types";

type TopUtilityBarProps = {
  leftText?: string;
  authLinks?: { signInHref: string; registerHref: string };
  links?: TopLink[];
};

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({
  leftText = "Hi!",
  authLinks = { signInHref: "#", registerHref: "#" },
  links = [],
}) => {
  return (
    <div className="border-b bg-slate-50 text-[11px] text-gray-700">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <span>{leftText}</span>
          <a
            href={authLinks.signInHref}
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </a>
          <span>or</span>
          <a
            href={authLinks.registerHref}
            className="font-semibold text-blue-600 hover:underline"
          >
            register
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="hover:text-blue-700 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
