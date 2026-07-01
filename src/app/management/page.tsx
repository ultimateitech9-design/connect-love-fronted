"use client";

import { ShieldAlert, ShieldCheck, Megaphone, CreditCard, TrendingUp, Headphones, ArrowRight } from "lucide-react";
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
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          © 2026 Connect Love. All rights reserved.
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
    title: "Marketing",
    icon: Megaphone,
    href: "/management/marketing",
    buttonText: "Marketing Dashboard",
  },
  {
    title: "Finance",
    icon: CreditCard,
    href: "/management/finance",
    buttonText: "Finance Dashboard",
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
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-50/50 text-slate-900 antialiased selection:bg-rose-100 selection:text-rose-900 lg:overflow-hidden">
      <ManagementNavbar />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-6 lg:py-8 px-4 sm:px-6">
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
        
        <div className="max-w-6xl w-full flex flex-col items-center">
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
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-900 mb-3 text-center"
          >
            App Background <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-500 max-w-xl mb-6 text-center leading-relaxed"
          >
            Select your role to access the management dashboard and control application settings, users, and matches.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 w-full"
          >
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                 <motion.div
                  key={role.title}
                  variants={itemVariants}
                  className="group relative bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-start transition-all duration-300 hover:border-slate-200/80 hover:shadow-[0_20px_50px_rgba(244,63,94,0.04)] hover:-translate-y-1 w-full"
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
