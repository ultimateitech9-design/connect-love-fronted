"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Heart, LockKeyhole, Play, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Navbar } from "@/features/home/Navbar";
import { Footer } from "@/features/home/Footer";

const benefits = [
  { icon: UsersRound, title: "Divorced Singles Only", text: "Meet people with shared life experience" },
  { icon: Heart, title: "Serious Relationships", text: "Connect with people ready to commit again" },
  { icon: ShieldCheck, title: "Safe & Private", text: "Control who can view and contact you" },
];

export default function DivorcedPage() {
  return (
    <div className="marketing-home min-h-screen bg-[#fffaf7] text-[#40142d]">
      <Navbar
        onLoginClick={() => { window.location.href = "/login"; }}
        onSignupClick={() => { window.location.href = "/register?journey=divorced"; }}
      />

      <main className="overflow-hidden">

      <section id="home" className="relative isolate min-h-[570px] border-b border-[#ecdcd4]">
        <Image src="/divorced-hero-couple.png" alt="Mature Indian couple beginning a new relationship" fill priority className="object-cover object-[62%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fffaf7] via-[#fffaf7]/95 38%, via-[#fffaf7]/45 58%, to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fffaf7] to-transparent" />
        {["left-[46%] top-28", "left-[50%] top-64", "left-[43%] top-80"].map((position, index) => (
          <Sparkles key={position} className={`absolute ${position} hidden h-5 w-5 text-[#d49a39] md:block`} style={{ animation: `pulse ${1.8 + index * 0.35}s ease-in-out infinite` }} />
        ))}
        <motion.div initial={{ opacity: 0, x: -35 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 mx-auto max-w-[1480px] px-6 py-20 lg:px-14 lg:py-24">
          <div className="max-w-[650px]">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e5c8bd] bg-white/75 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b2454] backdrop-blur-sm"><Sparkles className="h-4 w-4 text-[#ce9235]" /> A thoughtful new chapter</p>
            <h1 className="font-display text-5xl font-medium leading-[0.98] tracking-tight text-[#3d102a] sm:text-6xl lg:text-7xl">Dating After Divorce<br />Starts Here</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#65575b] sm:text-xl">Connect with divorced singles who understand your journey and are ready for a meaningful new relationship.</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/register?journey=divorced" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#72163f] to-[#922052] px-7 py-4 font-bold text-white shadow-xl shadow-[#71183f]/20 transition hover:-translate-y-1">Meet Divorced Singles <ArrowRight className="h-4 w-4" /></Link>
              <a href="#stories" className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[#7d214c] bg-white/70 px-7 py-4 font-bold text-[#64183d] backdrop-blur-sm transition hover:bg-white"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#8d315b]"><Play className="h-3.5 w-3.5 fill-current" /></span> Read Success Stories</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#65575b]">
              <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#b67521]" /> Divorce-friendly community</span>
              <span className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[#b67521]" /> Verified profiles</span>
              <span className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-[#b67521]" /> Complete privacy</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-20 mx-auto -mt-12 max-w-[1380px] px-5 pb-10 lg:px-10">
        <motion.div id="stories" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[28px] border border-[#eadbd3] bg-white/95 p-6 shadow-[0_20px_60px_rgba(92,34,57,0.10)] sm:p-8">
          <h2 className="font-display text-3xl text-[#571632]">A Fresh Start, With Someone Who Understands <Sparkles className="inline h-5 w-5 text-[#c78c32]" /></h2>
          <div className="mt-4 h-0.5 w-32 bg-[#d49a39]" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {benefits.map((benefit, index) => <motion.article key={benefit.title} whileHover={{ y: -7 }} transition={{ type: "spring", stiffness: 260 }} className="relative rounded-2xl border border-[#eee0d9] bg-gradient-to-b from-white to-[#fff9f5] p-5 text-center shadow-sm">
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-[#d39b3c]" />
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#eccfc9] bg-[#faeeeb] text-[#811f50]"><benefit.icon className="h-7 w-7" /></span>
              <h3 className="mt-4 font-display text-xl font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6d6063]">{benefit.text}</p>
            </motion.article>)}
          </div>
        </motion.div>

      </section>

      <section id="safety" className="mx-auto max-w-[1380px] px-5 pb-16">
        <motion.blockquote initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[28px] border border-[#efd5cb] bg-gradient-to-r from-[#fff5ef] via-white to-[#fff5ef] px-8 py-8 text-center font-display text-2xl italic text-[#5b1836] shadow-sm sm:text-3xl">
          <span className="mr-4 text-5xl leading-none text-[#ce9134]">“</span>Your past is part of your story—not the end of it.<Sparkles className="ml-3 inline h-5 w-5 animate-pulse text-[#ce9134]" />
        </motion.blockquote>
      </section>

      </main>

      <Footer />
    </div>
  );
}
