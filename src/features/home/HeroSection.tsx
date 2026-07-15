/* eslint-disable */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Star, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSectionProps {
  onSignupClick: () => void;
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden pt-24 pb-12 flex items-center"
      style={{
        background:
          "linear-gradient(135deg, #090214 0%, #150529 35%, #2c0847 70%, #060e26 100%)",
      }}
    >
      {/* Background Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-[15%] top-[15%] h-96 w-96 rounded-full bg-rose-600/15 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 40, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[20%] right-[15%] h-96 w-96 rounded-full bg-purple-600/15 blur-[130px]"
        />
        <div className="absolute left-[45%] top-[40%] h-80 w-80 rounded-full bg-pink-500/10 blur-[100px]" />
      </div>

      {/* Floating Sparkles & Hearts */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Floating Heart 1 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: [0, -25, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[8%] top-[25%] text-rose-500/30"
        >
          <Heart className="h-8 w-8 fill-rose-500/10" />
        </motion.div>

        {/* Floating Heart 2 */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-[8%] top-[20%] text-pink-400/30"
        >
          <Heart className="h-6 w-6 fill-pink-400/10" />
        </motion.div>

        {/* Floating Heart 3 */}
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute left-[38%] bottom-[15%] text-purple-400/30"
        >
          <Heart className="h-5 w-5 fill-purple-400/10" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[100vw] px-4 py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-w-0 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-2 backdrop-blur-md">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-rose-300">Trusted by 500K+ singles</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl font-display">
              Find the{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 bg-clip-text text-transparent text-glow-rose">
                spark
              </span>
              <br />
              that feels
              <br />
              <span className="text-white/95">like home</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300/80 md:text-lg">
              Experience a premium sanctuary for modern connection. We prioritize emotional resonance
              and safety over superficial swiping.
            </p>

            <div className="mt-8 flex flex-col w-full sm:w-auto sm:flex-row gap-4 items-center justify-center lg:justify-start">
              <button
                id="hero-getstarted-btn"
                onClick={onSignupClick}
                className="w-full sm:w-auto min-h-12 rounded-full bg-gradient-to-r from-rose-50 via-pink-500 to-rose-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-500/30 transition-all duration-300 hover:scale-105 hover:shadow-rose-500/50 hover:brightness-110 active:scale-95 cursor-pointer"
              >
                Start Your Journey
              </button>
              <button
                onClick={() => setShowVideo(true)}
                className="group flex min-h-12 items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold text-white/90 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-all duration-300 group-hover:bg-white/15 group-hover:scale-110 group-hover:border-white/30">
                  <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                </span>
                Watch our Story
              </button>
            </div>
          </motion.div>

          {/* Right Visual Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative h-[min(115vw,460px)] w-full max-w-[340px] sm:h-[500px] lg:h-[520px]">
              
              {/* Decorative breathing blur background */}
              <div className="absolute inset-0 scale-105 rounded-[36px] bg-gradient-to-br from-rose-500/20 via-pink-600/10 to-purple-600/20 blur-xl animate-pulse-ring" />

              {/* Main Image Card */}
              <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 shadow-2xl bg-slate-900/40">
                <Image
                  src="/hero-couple.png"
                  alt="Happy couple connecting on Connect Love"
                  fill
                  sizes="(max-width: 768px) 90vw, 380px"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
                {/* Smooth Dark Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090214]/90 via-transparent to-transparent" />
              </div>

              {/* Floating Quote badge */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-4 left-4 max-w-[240px] rounded-2xl border border-white/10 bg-glass-dark p-4 shadow-xl backdrop-blur-xl sm:-left-8"
              >
                <p className="text-[11px] italic leading-relaxed text-rose-100/80">
                  "A sanctuary for meaningful connection."
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-505 text-[10px] font-bold text-white shadow-sm">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Aisha &amp; James</p>
                    <div className="mt-0.5 flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Active counter badge */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -top-4 right-2 rounded-full border border-white/10 bg-glass-dark px-4 py-2.5 shadow-xl backdrop-blur-xl sm:-right-4"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span className="text-xs font-semibold text-white tracking-wide">12,438 online now</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Decorative Bottom Wave Overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setShowVideo(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/60 text-white/80 hover:bg-slate-950/90 hover:text-white transition-colors backdrop-blur-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black">
                <iframe
                  src="https://www.youtube.com/embed/4K4wElOJjVI?autoplay=1"
                  title="Connect Love Story"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
