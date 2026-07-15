/* eslint-disable */
"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, ArrowRight, Heart } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { footerLinkGroups } from "./marketingPages";
import { motion } from "framer-motion";

const API_BASE = API_ORIGIN;

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/connectloveofficial/", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/connectloveofficial/", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/connect-love-official/", icon: Linkedin },
  { label: "YouTube", href: "https://www.youtube.com/@ConnectLove-Official", icon: Youtube },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch(`${API_BASE}/support/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Keep the public form usable if the local backend is not running.
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer
      style={{ background: "linear-gradient(150deg, #090214 0%, #150529 100%)" }}
      className="border-t border-white/10"
    >
      {/* CTA Band */}
      <div
        className="relative py-24 text-center px-6 overflow-hidden flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(135deg, #c2185b 0%, #880e4f 50%, #4a0e4e 100%)" }}
      >
        {/* Decorative blur overlay */}
        <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-pink-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-xs font-extrabold tracking-widest text-pink-200 uppercase mb-4">Become First</p>
          
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight font-display tracking-tight max-w-2xl">
            Ready to find your soul&apos;s counterpart?
          </h2>
          
          <p className="mt-5 text-base text-rose-100/80 max-w-lg leading-relaxed">
            Join a community of thousands who have found authentic connection. Your journey to a deeper, intentional relationship starts here.
          </p>
          
          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="px-8 py-4 rounded-full bg-white text-rose-700 text-sm font-bold hover:bg-rose-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-950/20 text-center"
            >
              Create Your Account
            </Link>
            <Link
              href="/#features"
              className="px-8 py-4 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Explore Stories
            </Link>
          </div>
          
          <p className="mt-6 text-xs text-rose-200/40">No credit card required. Set up in 60 seconds.</p>
        </div>
      </div>

      {/* Footer links */}
      <div className="mx-auto grid w-[90vw] max-w-7xl gap-12 border-b border-white/5 py-20 lg:grid-cols-5 lg:gap-16">
        
        {/* Brand column */}
        <div className="lg:col-span-2 flex flex-col items-start min-w-[0px]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo className="h-10 w-10 shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold text-white tracking-tight">
              Connect<span className="text-rose-400">Love</span>
            </span>
          </Link>
          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-sm">
            Creating a space for genuine emotional connection. We prioritize safety, authenticity and lasting love over addictive, superficial swiping.
          </p>
          
          {/* Social links */}
          <div className="mt-8 flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid min-w-0 grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-3 lg:gap-12">
          {footerLinkGroups.map(({ category, links }) => (
            <div key={category} className="min-w-0 text-left">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-white/50">
                {category}
              </h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href} className="leading-5">
                    <Link href={link.href} className="inline-block text-sm text-slate-400 transition-colors duration-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter signup & bottom elements */}
      <div className="mx-auto w-[90vw] max-w-7xl py-10 flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-white/5">
        <div>
          <p className="text-sm font-bold text-white">Stay in the loop</p>
          <p className="text-xs text-slate-400 mt-1">Dating tips, success stories, and new features.</p>
        </div>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSubscribed(false);
            }}
            placeholder="Enter your email"
            required
            className="w-full sm:w-64 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
          />
          <button type="submit" className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold hover:brightness-110 hover:shadow-lg hover:shadow-rose-500/20 transition-all shrink-0 cursor-pointer">
            {subscribed ? "Subscribed" : "Subscribe"} 
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Bottom Copyright bar */}
      <div className="px-6 py-6 bg-slate-950/20">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Connect Love. All rights reserved.</p>
          <p className="text-xs text-slate-500 sm:text-right">
            Designed and developed by <span className="font-semibold text-slate-400">Ultimate iTech Pvt. Ltd.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
