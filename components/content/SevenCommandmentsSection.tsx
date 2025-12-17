// frontend/components/content/SevenCommandmentsSection.tsx
import React from "react";
import Image from "next/image";

export type Commandment = {
  id: number;
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
};

type Props = {
  title: string;
  subtitle: string;
  challenge: string;
  commandments: Commandment[];
  heroImageUrl?: string;
  heroImageAlt?: string;

  // Hide the blue heading “The 7 Commandments…”
  hideSectionHeading?: boolean;

  // Replace the default heading text
  sectionHeading?: string;

  // 🔹 NEW: Hide “Your Challenge” heading + block
  hideChallengeHeading?: boolean;
};

export default function SevenCommandmentsSection({
  title,
  subtitle,
  challenge,
  commandments,
  heroImageUrl,
  heroImageAlt,
  hideSectionHeading,
  sectionHeading,
  hideChallengeHeading,   // NEW
}: Props) {
  return (
    <main className="bg-white px-6 py-16 md:px-16 lg:px-28">
      <div className="mx-auto max-w-4xl space-y-14">
        
        {/* HEADER */}
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            EMMA Foundation · 21stCS
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="max-w-2xl text-lg leading-relaxed text-gray-600">
              {subtitle}
            </p>
          )}

          {heroImageUrl && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
              <Image
                src={heroImageUrl}
                alt={heroImageAlt || title}
                width={1200}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </header>

        {/* DIVIDER */}
        <div className="h-px w-full bg-gray-200" />

        {/* COMMANDMENTS / ITEMS */}
        <section
          aria-labelledby="seven-commandments-heading"
          className="space-y-10"
        >
          {!hideSectionHeading && (
            <h2
              id="seven-commandments-heading"
              className="text-2xl font-semibold tracking-tight text-gray-900"
            >
              {sectionHeading || "The 7 Commandments of the 21st Century Science"}
            </h2>
          )}

          <ol className="space-y-8">
            {commandments.map((cmd) => (
              <li key={cmd.id} className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <span className="text-2xl font-bold text-gray-300">
                    {cmd.id}.
                  </span>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cmd.title}
                    </h3>

                    <p className="text-[19px] leading-relaxed text-gray-700">
                      {cmd.body}
                    </p>

                    {cmd.imageUrl && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-gray-100">
                        <Image
                          src={cmd.imageUrl}
                          alt={cmd.imageAlt || cmd.title}
                          width={900}
                          height={500}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* DIVIDER */}
        <div className="h-px w-full bg-gray-200" />

        {/* YOUR CHALLENGE — now hideable */}
        {!hideChallengeHeading && challenge && (
          <section aria-labelledby="challenge-heading" className="space-y-3">
            <h2
              id="challenge-heading"
              className="text-xl font-semibold text-gray-900"
            >
              Your Challenge
            </h2>

            <p className="max-w-3xl text-[15px] leading-relaxed text-gray-700">
              {challenge}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
