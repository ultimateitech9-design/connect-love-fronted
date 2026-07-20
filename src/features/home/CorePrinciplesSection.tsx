"use client";

import { motion, type MotionValue, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

type Principle = {
  title: string;
  description: string;
  artwork: string;
};

const principles: Principle[] = [
  {
    title: "Excellence, always",
    description:
      "Good enough is never the finish line. We refine every detail to make every connection feel thoughtful, safe and effortless.",
    artwork: "/images/principles/excellence-diamond.png",
  },
  {
    title: "Truth over assumptions",
    description:
      "We listen, learn and validate. Real behaviour and honest feedback guide us toward experiences people genuinely need.",
    artwork: "/images/principles/truth-spark.png",
  },
  {
    title: "Kindness by design",
    description:
      "Care is built into every interaction. We protect dignity, encourage empathy and put people before engagement metrics.",
    artwork: "/images/principles/kindness-heart.png",
  },
  {
    title: "Built for tomorrow",
    description:
      "We design for how people connect today—and what comes next. Curiosity keeps the experience modern, human and alive.",
    artwork: "/images/principles/modernity-cube.png",
  },
];

function PrincipleDeckCard({
  principle,
  index,
  progress,
}: {
  principle: Principle;
  index: number;
  progress: MotionValue<number>;
}) {
  const isLast = index === principles.length - 1;
  const exitStart = 0.18 + index * 0.22;
  const exitEnd = exitStart + 0.1;
  const previousExitStart = Math.max(0, exitStart - 0.22);
  const previousExitEnd = Math.max(0, exitEnd - 0.22);
  const restingOffset = index * 13;
  const restingScale = 1 - index * 0.025;
  const restingRotate = index % 2 ? 1.6 : -1.6;

  const y = useTransform(
    progress,
    index === 0
      ? [0, exitStart, exitEnd]
      : isLast
        ? [0, previousExitStart, previousExitEnd, 1]
        : [0, previousExitStart, previousExitEnd, exitStart, exitEnd],
    index === 0
      ? [0, 0, "-115vh"]
      : isLast
        ? [restingOffset, restingOffset, 0, 0]
        : [restingOffset, restingOffset, 0, 0, "-115vh"],
  );
  const rotate = useTransform(
    progress,
    index === 0
      ? [0, exitStart, exitEnd]
      : isLast
        ? [0, previousExitStart, previousExitEnd, 1]
        : [0, previousExitStart, previousExitEnd, exitStart, exitEnd],
    index === 0
      ? [0, 0, -13]
      : isLast
        ? [restingRotate, restingRotate, 0, 0]
        : [restingRotate, restingRotate, 0, 0, index % 2 ? 13 : -13],
  );
  const x = useTransform(
    progress,
    isLast ? [0, 1] : [0, exitStart, exitEnd],
    isLast ? [0, 0] : [0, 0, index % 2 ? -90 : 90],
  );
  const scale = useTransform(
    progress,
    index === 0 ? [0, 1] : [0, previousExitStart, previousExitEnd, 1],
    index === 0 ? [1, 1] : [restingScale, restingScale, 1, 1],
  );

  return (
    <motion.article
      style={{ x, y, scale, rotate, zIndex: principles.length - index }}
      className="absolute w-[min(78vw,292px)] overflow-hidden rounded-[28px] border border-white/15 bg-[#181818] p-2.5 text-white shadow-[0_30px_70px_rgba(0,0,0,0.32)] sm:w-[320px]"
    >
      <div className="relative aspect-[1.35] overflow-hidden rounded-[22px] border border-white/10 bg-[#111] shadow-inner">
        <Image
          src={principle.artwork}
          alt=""
          fill
          sizes="(max-width: 640px) 78vw, 320px"
          className="object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
        <h3 className="font-display text-2xl font-bold italic leading-none sm:text-3xl">{principle.title}</h3>
        <p className="mt-3 text-xs leading-5 text-white/72 sm:text-sm">{principle.description}</p>
      </div>
    </motion.article>
  );
}

export function CorePrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const deckOpacity = useTransform(scrollYProgress, [0, 0.04, 0.1], [0, 0, 1]);
  const deckScale = useTransform(scrollYProgress, [0, 0.04, 0.1], [0.88, 0.88, 1]);

  return (
    <section
      ref={sectionRef}
      id="principles"
      className="relative h-[460svh] bg-[#f7f3eb] text-[#0b0908] dark:bg-[#090910] dark:text-white"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden px-4">
          <div className="select-none whitespace-nowrap font-display text-[clamp(4rem,12vw,10rem)] font-black leading-none tracking-[-0.07em] text-[#0b0908] dark:text-white">
            Core <span className="italic">principles</span>
          </div>
        </div>

        <motion.div
          style={{ opacity: deckOpacity, scale: deckScale }}
          className="relative flex h-[470px] w-full items-center justify-center sm:h-[500px]"
        >
          {principles.map((principle, index) => (
            <PrincipleDeckCard key={principle.title} principle={principle} index={index} progress={scrollYProgress} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
