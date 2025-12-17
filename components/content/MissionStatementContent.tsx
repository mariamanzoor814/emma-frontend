"use client";

import Image from "next/image";
import { motion, type MotionProps, type Variants } from "framer-motion";

type Statement = { title: string; body: string };

type MissionStatementContentProps = {
  hero: {
    title: string;
    subtitle: string;
    image?: string;
    imageAlt?: string;
  };
  intro: string;
  statements: Statement[];
  steps: Statement[];
  principles: Statement[];
  quotes: string[];
  lessons: Statement[];
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const fadeUp: MotionProps = {
  variants: fadeVariants,
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.2 },
};

function StatementCard({ item }: { item: Statement }) {
  return (
    <motion.div
      {...fadeUp}
      className="space-y-1 border-l-2 border-emerald-400/70 pl-4 md:pl-5"
    >
      <p className="text-base md:text-lg font-semibold text-slate-900">
        {item.title}
      </p>
      <p className="text-sm md:text-base leading-relaxed text-slate-700 whitespace-pre-line">
        {item.body}
      </p>
    </motion.div>
  );
}

export function MissionStatementContent({
  hero,
  intro,
  statements,
  steps,
  principles,
  quotes,
  lessons,
}: MissionStatementContentProps) {
  const heroImage = hero.image || "/assets/hero.jpg";
  const heroImageAlt = hero.imageAlt || hero.title || "EMMA Foundation";

  return (
    <div className="min-h-screen bg-[color:var(--page-bg,#f9fafb)] text-slate-900">
      {/* Hero – classy + light, still a bit sassy */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:py-20">
          <motion.div
            {...fadeUp}
            className="flex-1 space-y-5 md:space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Mission • EMMA
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              {hero.title}
            </h1>

            {hero.subtitle && (
              <p className="max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
                {hero.subtitle}
              </p>
            )}

            {intro && (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                {intro}
              </p>
            )}
          </motion.div>

          <motion.div
            {...fadeUp}
            className="relative flex-1"
          >
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-emerald-200/40 via-cyan-200/30 to-transparent blur-xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-50">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                width={720}
                height={480}
                className="h-full w-full object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-900 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live your 8 pistons
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statements – editorial, not cardy */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            01 • Foundations
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Goals and mission statements
          </h2>
          <p className="max-w-3xl text-sm md:text-base text-slate-600">
            A clear mission becomes the compass for every decision EMMA makes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {statements.map((item, idx) => (
            <StatementCard key={idx} item={item} />
          ))}
        </div>
      </section>

      {/* Steps – clean vertical timeline */}
      <section className="bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              02 • The path
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              How EMMA puts the mission into action
            </h2>
            <p className="max-w-3xl text-sm md:text-base text-slate-600">
              Step by step, the mission turns into habits, culture, and real-world impact.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-slate-200 md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-8">
              {steps.map((step, idx) => {
                const leftSide = idx % 2 === 0;
                return (
                  <motion.div
                    key={idx}
                    {...fadeUp}
                    className="relative md:flex md:items-start md:gap-6"
                  >
                    {/* dot on the line */}
                    <div className="absolute left-4 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 md:left-1/2" />

                    <div
                      className={`mt-6 md:mt-0 md:w-1/2 ${
                        leftSide ? "md:pr-10" : "md:order-2 md:pl-10"
                      }`}
                    >
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] shadow-sm">
                          {idx + 1}
                        </span>
                        {step.title}
                      </div>
                      <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-700">
                        {step.body}
                      </p>
                    </div>

                    <div className="hidden md:block md:w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Principles – minimal columns with accent line */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            03 • Volunteers & ripple effects
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Principles that amplify impact
          </h2>
          <p className="max-w-3xl text-sm md:text-base text-slate-600">
            When volunteers live these principles, every small act multiplies across society.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((item, idx) => (
            <motion.div
              key={idx}
              {...fadeUp}
              className="space-y-2 border-l-2 border-amber-400/70 pl-4 md:pl-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                {item.title}
              </p>
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quotes – one classy reading block */}
      <section className="bg-slate-50/70 py-12 md:py-14">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            {...fadeUp}
            className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 px-6 py-7 md:px-8 md:py-9"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl md:text-4xl text-emerald-500">“</span>
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-semibold text-slate-900">
                  Lessons from history and scripture
                </p>
                <p className="text-sm md:text-base text-slate-600">
                  These references remind us that wisdom is not new — EMMA simply translates it into a modern framework.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-4">
              {quotes.map((quote, idx) => (
                <p
                  key={idx}
                  className="text-sm md:text-base leading-relaxed text-slate-700 italic"
                >
                  {quote}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lessons – final takeaways, simple and strong */}
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            04 • Final takeaways
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            What EMMA asks of every member
          </h2>
          <p className="max-w-3xl text-sm md:text-base text-slate-600">
            The mission only works if each member carries a piece of it into their daily life.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {lessons.map((item, idx) => (
            <StatementCard key={idx} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
