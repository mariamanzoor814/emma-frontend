// frontend/components/content/FounderStorySection.tsx
"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import ReactMarkdown from "react-markdown";

export type FounderSection = {
  id: string;
  heading: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
};

type Props = {
  sections: FounderSection[];
  images?: any[];
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function FounderStorySection({ sections, images = [] }: Props) {
  if (!sections || sections.length === 0) return null;

  const getImageFromList = (idx: number) => {
    if (!Array.isArray(images) || images.length === 0) return {};
    const item = images[idx];
    if (!item) return {};
    if (typeof item === "string") return { url: item, alt: "" };
    return { url: item.url ?? "", alt: item.alt ?? "" };
  };

  const founderFromList = getImageFromList(0);
  const lastFromList = getImageFromList(images.length - 1);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 md:px-6 py-16 md:py-24">
      <div className="space-y-16">
        {sections.map((section, idx) => {
          const isIntro = idx === 0;
          const isNoFreeWill =
            section.id === "no_free_will" ||
            section.heading?.startsWith("What changed my life for better?");

          let sectionImageUrl = section.imageUrl || "";
          let sectionImageAlt = section.imageAlt || section.heading || "";

          if (!sectionImageUrl && isIntro && founderFromList.url) {
            sectionImageUrl = founderFromList.url;
            sectionImageAlt = founderFromList.alt || "Founder";
          }

          if (!sectionImageUrl && isNoFreeWill && lastFromList.url) {
            sectionImageUrl = lastFromList.url;
            sectionImageAlt =
              lastFromList.alt || "What changed my life for better";
          }

          // -----------------------
          //  FIRST (INTRO) SECTION
          // -----------------------
          if (isIntro) {
            const hasImage = !!sectionImageUrl;

            return (
              <motion.article
                key={section.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                className={`grid gap-10 items-start ${
                  hasImage ? "md:grid-cols-2" : ""
                }`}
              >
                <div className="space-y-6 border-l border-slate-200 pl-4 md:pl-6">
                  
                  {/* 🔥 Larger + centered FIRST HEADING */}
                  {section.heading && (
                    <h2
                      className="
                        text-4xl md:text-5xl 
                        font-bold 
                        tracking-tight 
                        text-slate-900 
                        text-center 
                        md:text-left
                      "
                    >
                      {section.heading}
                    </h2>
                  )}

                  {section.body && (
                    <div className="space-y-4 text-base md:text-lg leading-relaxed text-[color:var(--text-muted)]">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {section.body}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {hasImage && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.35 }}
                    className="flex justify-center md:justify-end"
                  >
                    <div className="overflow-hidden rounded-2xl max-w-xs md:max-w-sm max-h-72 md:max-h-80 lg:max-h-96">
                      <img
                        src={sectionImageUrl}
                        alt={sectionImageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.article>
            );
          }

          // -----------------------
          //  OTHER SECTIONS
          // -----------------------
          return (
            <motion.article
              key={section.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.35 }}
              className="space-y-4 border-l border-slate-200 pl-4 md:pl-6"
            >
              {section.heading && (
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
                  {section.heading}
                </h2>
              )}

              {sectionImageUrl && (
                <div className="overflow-hidden rounded-2xl my-4">
                  <img
                    src={sectionImageUrl}
                    alt={sectionImageAlt}
                    className="w-full h-auto max-h-[850px] object-cover"
                  />
                </div>
              )}

              {section.body && (
                <div className="space-y-4 text-base md:text-lg leading-relaxed text-slate-800
">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" />
                      ),
                    }}
                  >
                    {section.body}
                  </ReactMarkdown>
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
