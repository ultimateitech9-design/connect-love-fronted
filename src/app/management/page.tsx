"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Heart, Megaphone, CreditCard, TrendingUp, Headphones } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function ManagementNavbar() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm z-50">
      <div className="mx-auto flex h-16 items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo className="h-10 w-10 shadow-lg shadow-rose-500/30" priority />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Connect<span className="text-rose-500">Love</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function ManagementFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-6">
      <div className="mx-auto px-6 text-center">
        <p className="text-sm text-slate-500">
          © 2026 Connect Love. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function ManagementPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ManagementNavbar />

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-12 pb-16">
        {/* Background gradient matching homepage hero style */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100/40 via-slate-50 to-white" />
        
        <div className="container px-4 md:px-6 flex flex-col items-center text-center ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600 mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-rose-500 mr-2 animate-pulse"></span>
            Management Portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl text-slate-900 mb-6"
          >
            App Background <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Management</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 mb-10 "
          >
            Select your role to access the management dashboard and control application settings, users, and matches.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full "
          >
            {/* Admin Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Admin</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Manage user profiles, review reports, and handle basic support tickets.
              </p>
              <Link href="/management/admin" className="w-full mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 shadow-lg shadow-blue-600/20">
                  Login as Admin
                </Button>
              </Link>
            </div>

            {/* Super Admin Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Super Admin</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Full system access. Manage admins, global settings, and database configurations.
              </p>
              <Link href="/management/super-admin" className="w-full mt-auto">
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white rounded-xl py-6 shadow-lg shadow-rose-500/20 border-0">
                  Login as Super Admin
                </Button>
              </Link>
            </div>

            {/* Marketing Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center mb-4">
                <Megaphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Marketing</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Manage campaigns, track user acquisition, and monitor marketing reports.
              </p>
              <Link href="/management/marketing" className="w-full mt-auto">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-6 shadow-lg shadow-violet-600/20">
                  Marketing Dashboard
                </Button>
              </Link>
            </div>

            {/* Finance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Finance</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Review subscriptions, track transactions, and manage billing records.
              </p>
              <Link href="/management/finance" className="w-full mt-auto">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 shadow-lg shadow-emerald-600/20">
                  Finance Dashboard
                </Button>
              </Link>
            </div>

            {/* Sales Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sales</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Track conversions, analyze trends, and manage retention plans.
              </p>
              <Link href="/management/sales" className="w-full mt-auto">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-6 shadow-lg shadow-amber-500/20 border-0">
                  Sales Dashboard
                </Button>
              </Link>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-16 w-16 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center mb-4">
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Support</h3>
              <p className="text-sm text-slate-500 mb-6 text-center">
                Handle customer tickets, monitor safety reports, and manage high-priority issues.
              </p>
              <Link href="/management/support" className="w-full mt-auto">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl py-6 shadow-lg shadow-cyan-500/20 border-0">
                  Support Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <ManagementFooter />
    </div>
  );
}
