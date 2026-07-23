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
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-20 sm:min-h-[100dvh] sm:pt-24"
      style={{
        background:
          "linear-gradient(135deg, #090214 0%, #150529 35%, #2c0847 70%, #060e26 100%)",
      }}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 max-w-none opacity-85"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }}
        >
          <source
            src="/hero-bg.mp4"
            type="video/mp4"
          />
        </video>
        {/* A directional veil keeps the copy readable without hiding the video. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,2,20,0.84)_0%,rgba(9,2,20,0.66)_38%,rgba(21,5,41,0.24)_68%,rgba(9,2,20,0.12)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090214]/35 via-transparent to-[#090214]/80" />
      </div>

      {/* Floating Sparkles & Hearts */}
      <div className="absolute inset-0 pointer-events-none z-10">
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

      <div className="relative z-20 mx-auto box-border w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex justify-start">
          
          {/* Left-aligned hero content */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex w-full min-w-0 max-w-3xl flex-col items-start text-left lg:max-w-[760px]"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-[#16091f]/55 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-md">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-rose-300">Trusted by 500K+ singles</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem]">
              Find the{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300 bg-clip-text text-transparent text-glow-rose">
                spark
              </span>
              <br />
              that feels
              <br />
              <span className="text-white/95">like home</span>
            </h1>

            <p className="mt-6 w-full max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg lg:text-xl">
              Experience a premium sanctuary for modern connection. We prioritize emotional resonance
              and safety over superficial swiping.
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
              <button
                id="hero-getstarted-btn"
                onClick={onSignupClick}
                className="box-border w-full max-w-full sm:w-auto min-h-12 rounded-full bg-gradient-to-r from-rose-50 via-pink-500 to-rose-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-500/30 transition-all duration-300 hover:scale-105 hover:shadow-rose-500/50 hover:brightness-110 active:scale-95 cursor-pointer"
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

        </div>
      </div>

      {/* A short, opaque finish removes the seam without creating a foggy band. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-b from-transparent to-white dark:to-[#090910]" />

      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 pb-5 pt-24 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-[min(76vw,280px)] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-2xl"
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

              <div className="aspect-[9/16] w-full bg-black">
                <iframe
                  src="https://www.youtube.com/embed/Gtgttp1MCGg?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                  title="Connect Love Story"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
