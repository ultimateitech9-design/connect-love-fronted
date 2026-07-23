/* eslint-disable */
"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { isAuthenticated } from "@/lib/auth";
import { navLinks } from "./marketingPages";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { getStoredTheme, type AppTheme } from "@/features/theme/theme";

interface NavbarProps {
 onLoginClick?: () => void;
 onSignupClick?: () => void;
}

export function Navbar({ onLoginClick, onSignupClick }: NavbarProps) {
 const [mobileOpen, setMobileOpen] = useState(false);
 const [loggedIn, setLoggedIn] = useState(false);
 const [activeTheme, setActiveTheme] = useState<AppTheme>("light");
 const navbarRef = useRef<HTMLElement>(null);

 useEffect(() => {
 setLoggedIn(isAuthenticated());
 setActiveTheme(getStoredTheme());
 const syncTheme = (event: Event) => {
 setActiveTheme((event as CustomEvent<AppTheme>).detail || getStoredTheme());
 };
 window.addEventListener("connect-love-theme-change", syncTheme);
 return () => window.removeEventListener("connect-love-theme-change", syncTheme);
 }, []);

 useEffect(() => {
 const lockHeaderTheme = () => {
 const theme = getStoredTheme();
 setActiveTheme((current) => current === theme ? current : theme);
 navbarRef.current?.style.setProperty(
 "background-color",
 theme === "dark" ? "#090910" : "#ffffff",
 "important",
 );
 };

 lockHeaderTheme();
 window.addEventListener("scroll", lockHeaderTheme, { passive: true, capture: true });
 return () => window.removeEventListener("scroll", lockHeaderTheme, { capture: true });
 }, []);

 useEffect(() => {
 if (!mobileOpen) return;

 const previousOverflow = document.body.style.overflow;
 const closeOnEscape = (event: KeyboardEvent) => {
 if (event.key === "Escape") setMobileOpen(false);
 };

 document.body.style.overflow = "hidden";
 window.addEventListener("keydown", closeOnEscape);

 return () => {
 document.body.style.overflow = previousOverflow;
 window.removeEventListener("keydown", closeOnEscape);
 };
 }, [mobileOpen]);

 const goToLogin = () => {
 setMobileOpen(false);
 if (onLoginClick) onLoginClick();
 else window.location.href = "/login";
 };

 const goToSignup = () => {
 setMobileOpen(false);
 if (onSignupClick) onSignupClick();
 else window.location.href = "/register";
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
      ref={navbarRef}
      data-theme={activeTheme}
      style={{ backgroundColor: activeTheme === "dark" ? "#090910" : "#ffffff" }}
      className="site-navbar pointer-events-auto fixed left-0 right-0 top-0 z-[100] border-b border-[#e5e7eb] py-0 shadow-sm dark:border-slate-700 dark:shadow-black/20"
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" onClick={(event) => handleNavClick(event, "#hero")} className="flex items-center gap-2.5 group">
          <BrandLogo className="h-11 w-11 shadow-lg shadow-rose-500/30 transition-all duration-300 group-hover:shadow-rose-500/60 group-hover:scale-105" priority />
          <span className="site-navbar-logo text-xl font-bold tracking-tight text-slate-900 dark:text-white">
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
              className="group relative py-1.5 text-sm font-medium text-[#111827] transition-colors hover:text-rose-600 dark:text-[#f8fafc] dark:hover:text-rose-400"
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-rose-500 transition-all duration-300 group-hover:w-full`} />
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className="dark:bg-slate-900" />
          {loggedIn ? (
            <Link
              href="/user"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                id="navbar-login-btn"
                onClick={goToLogin}
                className="px-5 py-2 text-sm font-medium text-[#111827] transition-colors hover:text-rose-600 dark:text-[#f8fafc] dark:hover:text-rose-400"
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
        <ThemeToggle className="absolute right-16 dark:bg-slate-900 md:hidden sm:right-20" />
        <button
          type="button"
          className={`absolute right-4 top-1/2 z-[120] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl transition-all duration-300 md:hidden sm:right-6 ${
            mobileOpen
              ? "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
              : "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile slide-over menu */}
      <div
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[105] bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={`fixed right-0 top-0 z-[110] flex h-dvh w-[min(84vw,22rem)] flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-300 ease-out dark:border-white/10 dark:bg-slate-950 dark:text-white md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
          <div className="flex h-20 shrink-0 items-center border-b border-slate-100 px-5 pr-20 dark:border-white/10">
            <span className="text-base font-bold tracking-tight">
              Menu<span className="text-rose-500">.</span>
            </span>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-[#111827] transition-all hover:bg-rose-50 hover:text-rose-600 dark:text-[#f8fafc] dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 dark:border-white/10">
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
                    className="w-full rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
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
      </aside>
    </header>
  );
}
