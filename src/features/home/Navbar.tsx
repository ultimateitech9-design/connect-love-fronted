/* eslint-disable */
"use client";

import { useState, useEffect, type MouseEvent } from "react";
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
 const handleScroll = () => setScrolled(window.scrollY > 20 || window.location.hash.length > 0);
 handleScroll();
 window.addEventListener("scroll", handleScroll);
 window.addEventListener("hashchange", handleScroll);
 setLoggedIn(isAuthenticated());
 return () => {
 window.removeEventListener("scroll", handleScroll);
 window.removeEventListener("hashchange", handleScroll);
 };
 }, []);

 const goToLogin = () => {
 setMobileOpen(false);
 onLoginClick?.();
 };

 const goToSignup = () => {
 setMobileOpen(false);
 onSignupClick?.();
 };

 const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
 setMobileOpen(false);
 if (typeof window === "undefined") return;

 if (window.location.pathname !== "/") {
 return;
 }

 event.preventDefault();

 if (href === "#hero") {
 window.history.pushState(null, "", "/");
 window.scrollTo({ top: 0, behavior: "smooth" });
 return;
 }

 const el = document.querySelector(href);
 if (!el) return;
 const top = el.getBoundingClientRect().top + window.scrollY - 88;
 window.history.pushState(null, "", href);
 window.scrollTo({ top, behavior: "smooth" });
 };

 return (
 <header
 className={`pointer-events-auto fixed top-0 left-0 right-0 z-[100] border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 ${
 scrolled ? "" : ""
 }`}
 >
 <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
 {/* Logo */}
 <Link href="/" onClick={(event) => handleNavClick(event, "#hero")} className="flex items-center gap-2.5 group">
 <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30 group-hover:shadow-rose-500/50 transition-shadow">
 <Heart className="h-5 w-5 text-white fill-white" strokeWidth={0} />
 </div>
 <span className="text-xl font-bold tracking-tight text-slate-900">
 Connect<span className="text-rose-500">Love</span>
 </span>
 </Link>

 {/* Desktop nav */}
 <nav className="hidden md:flex items-center gap-8">
 {navLinks.map((link) => (
 <Link
 href={`/${link.href}`}
 key={link.href}
 onClick={(event) => handleNavClick(event, link.href)}
 className="text-sm font-medium text-slate-600 transition-colors relative group hover:text-rose-500"
 >
 {link.label}
 <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-rose-400 transition-all group-hover:w-full" />
 </Link>
 ))}
 </nav>

 {/* Desktop actions */}
 <div className="hidden md:flex items-center gap-3">
 {loggedIn ? (
 <Link
 href="/user"
 className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
 >
 <User className="h-5 w-5 text-slate-700" />
 </Link>
 ) : (
 <>
 <Link
 href="/login"
 id="navbar-login-btn"
 onClick={goToLogin}
 className="px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
 >
 Sign In
 </Link>
 <Link
 href="/register"
 id="navbar-signup-btn"
 onClick={goToSignup}
 className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 active:scale-95"
 >
 Get Started
 </Link>
 </>
 )}
 </div>

 {/* Mobile menu button */}
 <button
 type="button"
 className="p-1 text-slate-900 md:hidden"
 onClick={() => setMobileOpen(!mobileOpen)}
 aria-label="Toggle menu"
 >
 {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
 <Link
 href={`/${link.href}`}
 key={link.href}
 onClick={(event) => handleNavClick(event, link.href)}
 className="block w-full text-left text-white/80 hover:text-white py-2 text-sm font-medium"
 >
 {link.label}
 </Link>
 ))}
 <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
 {loggedIn ? (
 <Link
 href="/user"
 onClick={() => setMobileOpen(false)}
 className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600"
 >
 <User className="h-4 w-4" />
 Go to Dashboard
 </Link>
 ) : (
 <>
 <Link href="/login" onClick={goToLogin} className="w-full py-2.5 text-center text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors">Sign In</Link>
 <Link href="/register" onClick={goToSignup} className="w-full py-2.5 text-center text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600">Get Started</Link>
 </>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </header>
 );
}
