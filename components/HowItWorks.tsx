"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * HowItWorks — 3‑step timeline section
 *
 * Steps:
 * 1) ✍️ Create Your Profile — Tell us your background and goals
 * 2) 🧠 Generate with AI — Resume or interview practice in seconds
 * 3) 🚀 Refine & Apply — Get feedback, polish, and go win that offer
 *
 * Animations:
 * - Staggered entrance for steps.
 * - A subtle animated connector line with a traveling dot (Framer Motion).
 * - Optional spring easing to match the brand’s motion style.
 * - Honors prefers-reduced-motion (static line/dot).
 */
export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  // Shared animation presets
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 26 },
    },
  };

  const container = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: { staggerChildren: 0.12 },
      },
    }),
    [],
  );

  // Dot animation distances depending on orientation (handled via CSS breakpoints).
  // We'll animate along X for md+ (horizontal) and along Y for mobile (vertical) using both with media queries.
  const loopTransition = {
    duration: 4.5,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror" as const,
  };

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent ">
            How{" "}
            <span className="bg-gradient-to-r from-[#00b7fa] to-[#01cfea] bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="mt-3 text-default-500 max-w-2xl mx-auto">
            Go from setup to standout in three simple steps.
          </p>
        </header>

        {/* Timeline wrapper: vertical on mobile, horizontal on md+ */}
        <motion.ol
          className="relative grid gap-10 md:gap-8 md:grid-cols-3"
          initial={reduceMotion ? undefined : "hidden"}
          variants={container}
          viewport={{ once: true, amount: 0.4 }}
          whileInView={reduceMotion ? undefined : "show"}
        >
          {/* Connecting line layer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex md:block"
          >
            {/* Vertical line for mobile */}
            <div className="relative flex-1 md:hidden">
              <div className="absolute left-[30px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
              {/* Traveling dot (mobile vertical) */}
              <motion.span
                animate={reduceMotion ? undefined : { top: [32, 320] }}
                className="absolute left-[26px] size-2.5 rounded-full bg-primary/80 shadow-[0_0_12px_theme(colors.primary/60)]"
                style={{ top: 32 }}
                transition={loopTransition}
              />
            </div>
            {/* Horizontal line for md+ */}
            <div className="hidden md:block absolute left-20 right-20 top-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent">
              {/* Traveling dot (desktop horizontal) */}
              <motion.span
                animate={
                  reduceMotion ? undefined : { left: [0, "calc(100% - 10px)"] }
                }
                className="absolute -top-[5px] left-0 size-2.5 rounded-full bg-primary/80 shadow-[0_0_12px_theme(colors.primary/60)]"
                transition={loopTransition}
              />
            </div>
          </div>

          {/* Step 1 */}
          <motion.li className="relative mt-4" variants={item}>
            <StepCard
              icon={
                <span aria-hidden className="text-3xl sm:text-4xl">
                  ✍️
                </span>
              }
              index={1}
              subtitle="Tell us your background and goals"
              title="Create Your Profile"
            />
          </motion.li>

          {/* Step 2 */}
          <motion.li className="relative" variants={item}>
            <StepCard
              icon={
                <span aria-hidden className="text-3xl sm:text-4xl">
                  🧠
                </span>
              }
              index={2}
              subtitle="Resume or interview practice in seconds"
              title="Generate with AI"
            />
          </motion.li>

          {/* Step 3 */}
          <motion.li className="relative" variants={item}>
            <StepCard
              icon={
                <span aria-hidden className="text-3xl sm:text-4xl">
                  🚀
                </span>
              }
              index={3}
              subtitle="Get feedback, polish, and go win that offer"
              title="Refine & Apply"
            />
          </motion.li>
            {/* Step 4 */}
            <motion.li className="relative" variants={item}>
                <StepCard
                    icon={
                        <span aria-hidden className="text-3xl sm:text-4xl">
                  🚀
                </span>
                    }
                    index={4}
                    subtitle="Get feedback, polish, and go win that offer"
                    title="Refine & Apply"
                />
            </motion.li>
        </motion.ol>
      </div>
    </section>
  );
}

function StepCard({
  icon,
  title,
  subtitle,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  index: number;
}) {
  return (
    <div className="group relative h-full">
      <div className="flex items-start gap-4">
        {/* Icon & index badge */}
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-default-100/60 dark:bg-default-50/10 ring-1 ring-default-200/40">
            {icon}
          </div>
          <span className="absolute -bottom-2 -right-2 rounded-full bg-primary/15 text-primary text-xs font-semibold px-2 py-1 ring-1 ring-primary/20">
            {index}
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="min-w-0">
          <h3 className="font-semibold text-base sm:text-lg leading-tight">
            {title}
          </h3>
          <p className="mt-1 text-sm text-default-500">{subtitle}</p>
        </div>
      </div>

      {/* Card chrome */}
      <div className="mt-4 rounded-xl border border-default-200/50 dark:border-default-100/10 bg-content1/50 p-4 backdrop-blur-sm">
        <p className="text-sm text-default-500">
          {index === 1 &&
            "Import your details or start from scratch — your goals guide the AI."}
          {index === 2 &&
            "Spin up tailored resumes or jump into realistic interview practice instantly."}
          {index === 3 &&
            "Apply with confidence: iterate fast with smart feedback and tips."}
        </p>
      </div>
    </div>
  );
}
