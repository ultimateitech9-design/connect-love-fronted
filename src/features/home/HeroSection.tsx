/* eslint-disable */
"use client";

import Image from "next/image";
import { Play, Star } from "lucide-react";

interface HeroSectionProps {
  onSignupClick: () => void;
}

export function HeroSection({ onSignupClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden pt-16"
      style={{
        background:
          "linear-gradient(135deg, #0D0B2B 0%, #1A0933 40%, #2D0B3F 70%, #0D1A3A 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-rose-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 rounded-full bg-pink-500/10 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-8 sm:py-10 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 lg:px-8">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-medium text-white/80">Trusted by 500K+ singles</span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
            Find the{" "}
            <span className="bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">
              spark
            </span>
            <br />
            that feels
            <br />
            <span className="text-white/90">like home</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
            Experience a premium sanctuary for modern connection. We prioritise emotional resonance
            and safety over superficial swiping.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              id="hero-getstarted-btn"
              onClick={onSignupClick}
              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-rose-500/40 transition-all hover:scale-105 hover:from-rose-400 hover:to-pink-500 hover:shadow-rose-500/60 active:scale-95"
            >
              Start Your Journey
            </button>
            <button className="group flex items-center gap-2.5 px-6 py-4 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 transition-colors group-hover:bg-white/15">
                <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
              </span>
              Watch our Story
            </button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative h-[460px] w-full max-w-[360px] sm:h-[520px] lg:h-[540px]">
            <div className="absolute inset-0 scale-110 rounded-3xl bg-gradient-to-br from-rose-500/30 to-purple-600/30 blur-2xl" />

            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
              <Image
                src="/hero-couple.png"
                alt="Happy couple connecting on Connect Love"
                fill
                sizes="(max-width: 768px) 90vw, 380px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B2B]/70 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-4 left-4 max-w-[230px] rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:-left-10">
              <p className="text-xs italic leading-relaxed text-white/70">
                "A sanctuary for meaningful connection."
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-[10px] font-bold text-white">
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
            </div>

            <div className="absolute -top-4 right-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl sm:-right-6">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-white">12,438 online now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
