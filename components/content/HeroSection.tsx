// frontend/components/content/HeroSection.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { motion, type Variants } from "framer-motion";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  cta?: string;
  image?: string;
  imageAlt?: string;
  applyOverlayBlur?: boolean;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const titleVar: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const subtitleVar: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const ctaWrapVar: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ctaBtnVar: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  hover: {
    y: -2,
    scale: 1.03,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  tap: { scale: 0.98 },
};

const bgZoomVar: Variants = {
  hidden: { scale: 1.08 },
  show: {
    scale: 1,
    transition: { duration: 1.6, ease: "easeOut" },
  },
};

export function HeroSection({
  title,
  subtitle,
  cta,
  image,
  imageAlt,
  applyOverlayBlur = true,
}: HeroSectionProps) {
  const imageSrc = image?.trim() || "/assets/hero.jpg";
  const altText = imageAlt?.trim() || "EMMA Foundation";
  const overlayClass = applyOverlayBlur ? "bg-black/40" : "bg-black/30";

  return (
    <section className="relative min-h-[520px] md:min-h-[680px] overflow-hidden glass-hero">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        variants={bgZoomVar}
        initial="hidden"
        animate="show"
      >
        <Image
          src={imageSrc}
          alt={altText}
          fill
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 ${overlayClass}`} />
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 flex min-h-[520px] md:min-h-[680px] items-center justify-center px-4">
        <motion.div
          className="max-w-4xl w-full text-center text-white space-y-4 drop-shadow-lg"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={titleVar}
            className="text-3xl md:text-5xl font-extrabold leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={subtitleVar}
            className="text-sm md:text-lg text-slate-100"
          >
            {subtitle}
          </motion.p>

          {cta?.trim() && (
            <motion.div variants={ctaWrapVar} className="pt-2">
              <motion.div variants={ctaBtnVar} whileHover="hover" whileTap="tap">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-black"
                  href="/login"
                >
                  {cta}✨
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
