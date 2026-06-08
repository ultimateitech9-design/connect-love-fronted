/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated } from "@/lib/auth";

interface NavbarProps {
 onLoginClick: () => void;
 onSignupClick: () => void;
}

const navLinks = [
 { href: "#about", label: "About" },
 { href: "#features", label: "Features" },
 { href: "#safety", label: "Safety" },
 { href: "#support", label: "Support" },
];

export function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [loggedIn, setLoggedIn] = useState(false);

 useEffect(() => {
 const handleScroll = () => setScrolled(window.scrollY > 20);
 window.addEventListener("scroll", handleScroll);
 setLoggedIn(isAuthenticated());
 return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const handleNavClick = (href: string) => {
 setMobileOpen(false);
 const el = document.querySelector(href);
 if (el) el.scrollIntoView({ behavior: "smooth" });
 };

 return (
 <header
 className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
 scrolled
 ? "bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm"
 : "bg-transparent"
 }`}
 >
 <div className="mx-auto flex h-[5vw] w-[90vw] items-center justify-between py-4">
 {/* Logo */}
 <Link href="/" className="flex items-center gap-2.5 group">
 <div className="relative flex h-[2.5vw] w-[2.5vw] items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 transition-shadow">
 <Heart className="h-[1.25vw] w-[1.25vw] text-white fill-white" strokeWidth={0} />
 </div>
 <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
 Connect<span className="text-rose-500">Love</span>
 </span>
 </Link>

 {/* Desktop nav */}
 <nav className="hidden md:flex items-center gap-8">
 {navLinks.map((link) => (
 <button
 key={link.href}
 onClick={() => handleNavClick(link.href)}
 className={`text-sm font-medium transition-colors relative group ${scrolled ? "text-slate-600 hover:text-rose-500" : "text-white/80 hover:text-white"}`}
 >
 {link.label}
 <span className="absolute -bottom-1 left-0 h-[0.139vw] w-[0vw] rounded-full bg-rose-400 transition-all group-hover:w-full" />
 </button>
 ))}
 </nav>

 {/* Desktop actions */}
 <div className="hidden md:flex items-center gap-3">
 {loggedIn ? (
 <Link
 href="/user"
 className={`flex h-[2.778vw] w-[2.778vw] items-center justify-center rounded-full transition-colors ${scrolled ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20"}`}
 >
 <User className={`h-[1.389vw] w-[1.389vw] ${scrolled ? "text-slate-700" : "text-white"}`} />
 </Link>
 ) : (
 <>
 <button
 id="navbar-login-btn"
 onClick={onLoginClick}
 className={`px-5 py-2 text-sm font-medium transition-colors ${scrolled ? "text-slate-700 hover:text-slate-900" : "text-white/90 hover:text-white"}`}
 >
 Sign In
 </button>
 <button
 id="navbar-signup-btn"
 onClick={onSignupClick}
 className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 active:scale-95"
 >
 Get Started
 </button>
 </>
 )}
 </div>

 {/* Mobile menu button */}
 <button
 className={`md:hidden p-1 ${scrolled ? "text-slate-900" : "text-white"}`}
 onClick={() => setMobileOpen(!mobileOpen)}
 aria-label="Toggle menu"
 >
 {mobileOpen ? <X className="h-[1.667vw] w-[1.667vw]" /> : <Menu className="h-[1.667vw] w-[1.667vw]" />}
 </button>
 </div>

 {/* Mobile menu */}
 <AnimatePresence>
 {mobileOpen && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="md:hidden bg-[#0D0B2B]/95 backdrop-blur-xl border-t border-white/10 px-6 pb-6 pt-4 space-y-4"
 >
 {navLinks.map((link) => (
 <button
 key={link.href}
 onClick={() => handleNavClick(link.href)}
 className="block w-full text-left text-white/80 hover:text-white py-2 text-sm font-medium"
 >
 {link.label}
 </button>
 ))}
 <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
 {loggedIn ? (
 <Link
 href="/user"
 onClick={() => setMobileOpen(false)}
 className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600"
 >
 <User className="h-[1.111vw] w-[1.111vw]" />
 Go to Dashboard
 </Link>
 ) : (
 <>
 <button onClick={() => { onLoginClick(); setMobileOpen(false); }} className="w-full py-2.5 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors">Sign In</button>
 <button onClick={() => { onSignupClick(); setMobileOpen(false); }} className="w-full py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600">Get Started</button>
 </>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </header>
 );
}
