"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

type Props = {
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  reverse?: boolean; // if true: image left, text right
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function TextImageSection({
  title,
  body,
  image,
  imageAlt,
  reverse = false,
}: Props) {
  if (!title && !body && !image) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-2 md:px-4 py-12 md:py-16">
      <div className={`grid gap-10 md:grid-cols-2 items-center ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}>
        {/* TEXT */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="space-y-4"
        >
          {title && (
            <h2 className="text-3xl md:text-4xl font-extrabold text-[color:var(--text-heading)]">
              {title}
            </h2>
          )}
          {body && (
            <p className="text-[color:var(--text-muted)] text-base md:text-lg leading-relaxed whitespace-pre-line">
              {body}
            </p>
          )}
        </motion.div>

        {/* IMAGE */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="glass-card rounded-2xl overflow-hidden shadow-md"
        >
          {image ? (
            <img
              src={image}
              alt={imageAlt || title || "About image"}
              className="w-full h-[280px] md:h-[360px] object-cover"
            />
          ) : (
            <div className="w-full h-[280px] md:h-[360px] bg-slate-200" />
          )}
        </motion.div>
      </div>
    </section>
  );
}
