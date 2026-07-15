"use client";

import { ShieldAlert, ShieldCheck, TrendingUp, Headphones, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";

function ManagementNavbar() {
  return (
    <header className="w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl flex h-14 items-center px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo className="h-8 w-8 shadow-lg shadow-rose-500/10 transition-transform duration-300 group-hover:scale-105" priority />
          <span className="text-base font-bold tracking-tight text-slate-900">
            Connect<span className="text-rose-500">Love</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function ManagementFooter() {
  return (
    <footer className="w-full border-t border-slate-100 bg-white/50 backdrop-blur-md py-4">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 text-center sm:flex-row sm:text-left">
        <p className="text-[10px] font-medium text-slate-400">
          &copy; {new Date().getFullYear()} Connect Love. All rights reserved.
        </p>
        <p className="text-[10px] font-medium text-slate-400 sm:text-right">
          Designed and developed by <span className="font-semibold text-slate-600">Ultimate iTech Pvt. Ltd.</span>
        </p>
      </div>
    </footer>
  );
}

const ROLES = [
  {
    title: "Admin",
    icon: ShieldCheck,
    href: "/management/admin",
    buttonText: "Login as Admin",
  },
  {
    title: "Super Admin",
    icon: ShieldAlert,
    href: "/management/super-admin",
    buttonText: "Login as Super Admin",
    isPrimary: true,
  },
  {
    title: "Sales",
    icon: TrendingUp,
    href: "/management/sales",
    buttonText: "Sales Dashboard",
  },
  {
    title: "Support",
    icon: Headphones,
    href: "/management/support",
    buttonText: "Support Dashboard",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

export default function ManagementPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-900">
      <ManagementNavbar />

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 lg:py-8">
        {/* Modern radial glow and grid pattern background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/30 via-slate-50 to-white" />
        <div 
          className="absolute inset-0 -z-10 opacity-30" 
          style={{
            backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)"
          }}
        />
        
        <div className="flex w-full max-w-[calc(100vw-2rem)] flex-col items-center sm:max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 mb-3 shadow-sm shadow-rose-100/20"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 mr-2 animate-pulse" />
            Management Portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-3 max-w-full text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            <span className="block sm:inline">App Background</span>{" "}
            <span className="block bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent sm:inline">Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6 max-w-[calc(100vw-2rem)] text-center text-xs leading-relaxed text-slate-500 sm:max-w-xl sm:text-sm"
          >
            Select your role to access the management dashboard and control application settings, users, and matches.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
          >
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                 <motion.div
                  key={role.title}
                  variants={itemVariants}
                  className="group relative flex w-full flex-col items-start overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200/80 hover:shadow-[0_20px_50px_rgba(244,63,94,0.04)]"
                >
                  {/* Subtle Top-Right Accent for Super Admin */}
                  {role.isPrimary && (
                    <span className="absolute top-3 right-3 bg-rose-50 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                      Primary Access
                    </span>
                  )}

                  {/* Row with Icon and Title */}
                  <div className="flex items-center gap-3 mb-4 w-full">
                    <div className="h-9 w-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 transition-all duration-300 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {role.title}
                    </h3>
                  </div>

                  <Link href={role.href} className="w-full mt-auto">
                    <Button className="w-full bg-slate-50 group-hover:bg-slate-900 text-slate-700 group-hover:text-white rounded-lg py-3.5 shadow-sm transition-all duration-300 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-100 group-hover:border-slate-900 cursor-pointer">
                      <span>{role.buttonText}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>

      <ManagementFooter />
    </div>
  );
}
