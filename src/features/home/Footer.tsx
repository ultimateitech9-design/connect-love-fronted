/* eslint-disable */
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Instagram, Facebook, Linkedin, HeartHandshake, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { footerLinkGroups } from "./marketingPages";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const socialLinks = [
 { label: "Instagram", href: "https://www.instagram.com/connectloveofficial/", icon: Instagram },
 { label: "Facebook", href: "https://www.facebook.com/connectloveofficial/", icon: Facebook },
 { label: "LinkedIn", href: "https://www.linkedin.com/company/connect-love-official/", icon: Linkedin },
 { label: "Join ConnectLove", href: "/register", icon: HeartHandshake },
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
 style={{ background: "linear-gradient(150deg, #0D0B2B 0%, #1F0B35 100%)" }}
 className="border-t border-white/10"
 >
 {/* CTA Band */}
 <div
 className="py-20 text-center px-6"
 style={{ background: "linear-gradient(135deg, #C2185B 0%, #880E4F 50%, #6A1B9A 100%)" }}
 >
 <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-4">Become First</p>
 <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mx-auto">
 Ready to find your soul&apos;s counterpart?
 </h2>
 <p className="mt-4 text-white/70 mx-auto text-base">
 Join a community of thousands who have found authentic connection. Your journey to a deeper, intentional relationship starts here.
 </p>
 <div className="mt-8 flex flex-wrap justify-center gap-4">
 <Link href="/register" className="px-8 py-3.5 rounded-full bg-white text-rose-700 text-sm font-bold hover:bg-rose-50 transition-all hover:scale-105 shadow-xl">
 Create Your Account
 </Link>
 <Link href="/#features" className="px-8 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-all">
 Explore Stories
 </Link>
 </div>
 <p className="mt-6 text-xs text-white/40">No credit card required. Set up in 60 seconds.</p>
 </div>

 {/* Footer links */}
 <div className="mx-auto w-[90vw] py-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
 {/* Brand column */}
 <div className="lg:col-span-2">
 <Link href="/" className="flex items-center gap-2.5">
 <BrandLogo className="h-9 w-9 shadow-lg" />
 <span className="text-xl font-bold text-white">
 Connect<span className="text-rose-400">Love</span>
 </span>
 </Link>
 <p className="mt-4 text-sm text-white/45 leading-relaxed ">
 Creating a space for genuine emotional connection. We prioritise safety, authenticity and lasting love over addictive, superficial swiping.
 </p>
 {/* Social links */}
 <div className="mt-6 flex items-center gap-3">
 {socialLinks.map(({ label, href, icon: Icon }) => (
 <Link
 key={href}
 href={href}
 target={href.startsWith("http") ? "_blank" : undefined}
 rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
 aria-label={label}
 className="flex h-[36px] w-[36px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
 >
 <Icon className="h-[16px] w-[16px]" />
 </Link>
 ))}
 </div>
 </div>

 {/* Link columns */}
 {footerLinkGroups.map(({ category, links }) => (
 <div key={category}>
 <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">{category}</h4>
 <ul className="space-y-3">
 {links.map((link) => (
 <li key={link.href}>
 <Link href={link.href} className="text-sm text-white/40 hover:text-white transition-colors">
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>

 {/* Newsletter */}
 <div className="border-t border-white/10 mx-auto w-[90vw] py-8 flex flex-col md:flex-row items-center justify-between gap-6">
 <div>
 <p className="text-sm font-semibold text-white/80">Stay in the loop</p>
 <p className="text-xs text-white/40 mt-0.5">Dating tips, success stories, and new features.</p>
 </div>
 <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
 <input
 type="email"
 value={email}
 onChange={(event) => {
 setEmail(event.target.value);
 setSubscribed(false);
 }}
 placeholder="Enter your email"
 required
 className="flex-1 md:w-[17.778vw] rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-rose-400 transition-colors"
 />
 <button type="submit" className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold hover:from-rose-400 hover:to-pink-500 transition-all shrink-0">
 {subscribed ? "Subscribed" : "Subscribe"} <ArrowRight className="h-[14px] w-[14px]" />
 </button>
 </form>
 </div>

 {/* Bottom bar */}
 <div className="border-t border-white/10 px-6 py-5 text-center">
 <p className="text-xs text-white/25">© {new Date().getFullYear()} Connect Love. All rights reserved.</p>
 </div>
 </footer>
 );
}
