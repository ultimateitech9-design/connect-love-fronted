/* eslint-disable */
"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated } from "@/lib/auth";
import { navLinks } from "./marketingPages";

interface NavbarProps {
 onLoginClick: () => void;
 onSignupClick: () => void;
}

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

 if (!href.startsWith("#")) {
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
      className={`pointer-events-auto fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-500 ease-in-out ${
        scrolled
          ? "bg-white/80 border-rose-100 shadow-lg shadow-rose-500/5 backdrop-blur-xl py-0"
          : "bg-transparent border-transparent shadow-none py-2"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={(event) => handleNavClick(event, "#hero")} className="flex items-center gap-2.5 group">
          <BrandLogo className="h-11 w-11 shadow-lg shadow-rose-500/30 transition-all duration-300 group-hover:shadow-rose-500/60 group-hover:scale-105" priority />
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? "text-slate-900" : "text-white"}`}>
            Connect<span className="text-rose-500">Love</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className={`text-sm font-semibold transition-all duration-300 relative group py-1.5 ${
                scrolled ? "text-slate-600 hover:text-rose-500" : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-rose-500 transition-all duration-300 group-hover:w-full`} />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/user"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 ${
                scrolled ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                id="navbar-login-btn"
                onClick={goToLogin}
                className={`px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  scrolled ? "text-slate-700 hover:text-slate-900" : "text-white/80 hover:text-white"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                id="navbar-signup-btn"
                onClick={goToSignup}
                className="px-6 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className={`absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl transition-all duration-300 md:hidden sm:right-6 ${
            scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
          }`}
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="max-h-[calc(100dvh-5rem)] space-y-2 overflow-y-auto border-t border-slate-100 bg-white px-4 pb-6 pt-4 shadow-xl md:hidden sm:px-6"
          >
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-rose-50/50 hover:text-rose-600 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              {loggedIn ? (
                <Link
                  href="/user"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600 shadow-md shadow-rose-500/25"
                >
                  <User className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={goToLogin}
                    className="w-full rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={goToSignup}
                    className="w-full py-3 text-center text-sm font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-pink-600 shadow-md shadow-rose-500/25"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
