// frontend/components/content/DonationContactLoginContent.tsx

import type React from "react";

export type DonationContactLoginContentProps = {
  donation: {
    title: string;
    intro: string;
    alertTitle: string;
    alertBody: string;
    linkUrl: string;
    linkLabel: string;
    otherMethods: string;
  };
  volunteering: {
    title: string;
    body: string;
    contactName: string;
    contactRole: string;
    contactEmail: string;
  };
  corporate: {
    title: string;
    emailLabel: string;
    email: string;
  };
  signup: {
    title: string;
    body: string;
    linkUrl: string;
    linkLabel: string;
  };
};

export function DonationContactLoginContent({
  donation,
  volunteering,
  corporate,
  signup,
}: DonationContactLoginContentProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-10 md:flex-row md:gap-10">
      {/* Left column – Donation */}
      <section className="flex-1 space-y-6">
        <header className="space-y-2 border-l-2 border-emerald-500 pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Support EMMA
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            {donation.title}
          </h1>
        </header>

        {donation.intro && (
          <p className="text-sm md:text-base leading-relaxed text-slate-700">
            {donation.intro}
          </p>
        )}

        {/* Alert */}
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm md:text-base text-amber-900">
          {donation.alertTitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
              {donation.alertTitle}
            </p>
          )}
          {donation.alertBody && (
            <p className="leading-relaxed whitespace-pre-line">
              {donation.alertBody}
            </p>
          )}
        </div>

        {/* Main donation link */}
        <div className="space-y-3">
          <a
            href={donation.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {donation.linkLabel}
          </a>
          {donation.otherMethods && (
            <p className="text-xs md:text-sm leading-relaxed text-slate-600">
              {donation.otherMethods}
            </p>
          )}
        </div>
      </section>

      {/* Right column – Volunteering, Corporate, Signup */}
      <section className="flex-1 space-y-10">
        {/* Volunteering */}
        <div className="space-y-4">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              Get involved
            </p>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
              {volunteering.title}
            </h2>
          </header>

          {volunteering.body && (
            <p className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-line">
              {volunteering.body}
            </p>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-800">
            <p className="font-semibold">Contact:</p>
            <p>
              {volunteering.contactName}
              {volunteering.contactRole ? `, ${volunteering.contactRole}` : null}
            </p>
            {volunteering.contactEmail && (
              <p className="mt-1">
                <a
                  href={`mailto:${volunteering.contactEmail}`}
                  className="text-emerald-700 underline-offset-2 hover:underline"
                >
                  {volunteering.contactEmail}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Corporate office */}
        <div className="space-y-3">
          <header className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              {corporate.title}
            </p>
          </header>
          <p className="text-sm md:text-base text-slate-700">
            {corporate.emailLabel}{" "}
            <a
              href={`mailto:${corporate.email}`}
              className="font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              {corporate.email}
            </a>
          </p>
        </div>

        {/* Sign up / login */}
        <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            {signup.title}
          </p>
          {signup.body && (
            <p className="text-sm md:text-base leading-relaxed text-slate-800">
              {signup.body}
            </p>
          )}
          <a
            href={signup.linkUrl}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            {signup.linkLabel}
          </a>
        </div>
      </section>
    </main>
  );
}
