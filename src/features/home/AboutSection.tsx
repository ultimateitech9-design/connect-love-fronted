/* eslint-disable */
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";

export function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  } as const;

  return (
    <section
      id="about"
      className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-white via-rose-50/20 to-white"
      ref={ref}
    >
      {/* Decorative side accent blur */}
      <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-rose-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute left-0 bottom-1/4 h-72 w-72 rounded-full bg-purple-200/20 blur-[90px] pointer-events-none" />

      <div className="mx-auto w-[90vw] max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="grid gap-16 lg:grid-cols-2 lg:items-center"
        >
          {/* Left Block */}
          <motion.div variants={itemVariants} className="min-w-0">
            <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
              Our Philosophy
            </span>
            <h2 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl font-display">
              A New Era of{" "}
              <em className="not-italic bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent text-glow-rose">
                Intimacy
              </em>
            </h2>
            <p className="mt-6 text-base text-slate-500 leading-relaxed max-w-xl">
              We&apos;ve reimagined connection for the modern age, reducing the fatigue of endless
              swiping with intentional design and authentic interactivity.
            </p>

            <div className="mt-10 space-y-6">
              {[
                {
                  icon: Heart,
                  color: "from-rose-100 to-pink-100 text-rose-500 bg-rose-50",
                  title: "Emotional Integrity",
                  desc: "Our technology explores and nurtures shared values and long-term goals over fleeting visual attraction.",
                },
                {
                  icon: Sparkles,
                  color: "from-violet-100 to-purple-100 text-violet-500 bg-violet-50",
                  title: "Intuitive AI",
                  desc: "AI that learns your communication style and enriches the gap between initial 'hi' and serious connection.",
                },
                {
                  icon: ShieldCheck,
                  color: "from-emerald-100 to-teal-100 text-emerald-500 bg-emerald-50",
                  title: "Verified Community",
                  desc: "Every member is verified through multi-stage AI authentication to protect your privacy while ensuring you meet real people.",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-rose-50/30"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-base">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Block — Stats and Testimonial Card */}
          <motion.div variants={itemVariants} className="relative">
            
            {/* Stats Card Container */}
            <div className="relative rounded-3xl border border-rose-100 bg-white/70 p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(244,63,94,0.08)] backdrop-blur-md">
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { value: "500K+", label: "Active Members" },
                  { value: "94%", label: "Match Satisfaction" },
                  { value: "12K+", label: "Couples Formed" },
                  { value: "4.9★", label: "App Store Rating" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-rose-50/50 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-md hover:border-rose-100"
                  >
                    <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent font-display">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Decorative Quote */}
              <div className="mt-6 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
                {/* Micro heart indicator in background */}
                <Heart className="absolute right-[-10px] bottom-[-10px] h-24 w-24 fill-white/5 text-transparent rotate-12" />
                
                <p className="text-sm italic leading-relaxed text-rose-550/95 font-medium relative z-10">
                  "We joined a 500,000-strong community. No stress, no shouting — just two people seeing each other."
                </p>
                <div className="mt-4 flex items-center gap-3 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    T
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Thomas &amp; Priya</p>
                    <p className="text-[10px] text-rose-100/70">Matched 8 months ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing bubble accents */}
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 opacity-20 blur-xl pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
