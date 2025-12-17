// frontend/components/ui/Button.tsx
"use client";

import React from "react";
import clsx from "clsx";
import Link from "next/link";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { children, className, ...rest } = props;

  const classes = clsx(
    "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm md:text-base font-semibold shadow-lg",
    "bg-indigo-600 text-white hover:bg-indigo-700 transition-transform duration-200 hover:-translate-y-0.5",
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
