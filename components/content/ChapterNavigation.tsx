"use client";

import Link from "next/link";

type Props = {
  currentSlug: string;
  slugs: string[];
};

export function ChapterNavigation({ currentSlug, slugs }: Props) {
  const index = slugs.indexOf(currentSlug);

  const prev = index > 0 ? slugs[index - 1] : null;
  const next = index < slugs.length - 1 ? slugs[index + 1] : null;

  return (
    <div className="flex items-center justify-between mt-20 pt-10 border-t border-slate-300/50">
      {prev ? (
        <Link
          href={`/${prev}`}
          className="text-slate-700 font-medium hover:text-slate-900"
        >
          ← Previous Chapter
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={`/${next}`}
          className="text-slate-700 font-medium hover:text-slate-900"
        >
          Next Chapter →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
