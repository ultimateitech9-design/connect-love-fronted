"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { loginManagement } from "@/app/actions/managementAuth";

export default function SalesLoginPage() {
  const router = useRouter();
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Forgot Password State
  const [view, setView] = useState<"login" | "forgot">("login");

  // Debounce lock
  const [locked, setLocked] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Brute force protection / debounce
    if (locked || loading) return;
    
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    setLocked(true);
    
    // Release debounce lock after 2 seconds
    setTimeout(() => setLocked(false), 2000);

    try {
      const result = await loginManagement(email, password, "sales");

      if (!result.success) {
        throw new Error(result.error || "An error occurred during login. Please try again.");
      }

      // If successful, redirect
      router.push("/sales");
    } catch (err: any) {
      setError(err.message || "Failed to login. Check your connection.");
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Password recovery placeholder
    setTimeout(() => {
      setLoading(false);
      setView("login");
      setError("A recovery link has been sent to your email."); // Using error state as a generic message state for simplicity
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-slate-50 px-4 py-6 selection:bg-amber-500/30">
      
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      {/* Main Glass Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "min(22rem, calc(100vw - 4rem))" }}
        className="relative z-10 w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl backdrop-blur-2xl sm:w-full sm:max-w-md sm:p-8"
      >
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-100 pointer-events-none" />
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Portal</h1>
          <p className="text-sm text-slate-500 mt-2">Secure gateway to the sales dashboard.</p>
        </div>

        {/* Dynamic Views */}
        <AnimatePresence mode="wait">
          
          {/* LOGIN VIEW */}
          {view === "login" && (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {error && (
                <div className="p-3 text-sm font-medium rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@connectlove.com"
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-slate-700 font-semibold">Password</Label>
                  <button type="button" onClick={() => setView("forgot")} className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20 h-11"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || locked}
                className="w-full h-12 mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-0 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all font-semibold rounded-xl"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login to Sales"}
              </Button>
            </motion.form>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === "forgot" && (
            <motion.form 
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleForgotPassword}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Mail className="h-12 w-12 text-amber-500 mx-auto opacity-80" />
                <h2 className="text-lg font-semibold text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500">Enter your email to receive a recovery link.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@connectlove.com"
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20 h-11"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setView("login")}
                  className="flex-1 h-12 bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm rounded-xl"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !email}
                  className="flex-1 h-12 bg-amber-500 hover:bg-amber-400 text-white border-0 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all font-semibold rounded-xl"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Link"}
                </Button>
              </div>
            </motion.form>
          )}

        </AnimatePresence>
      </motion.div>
      
      {/* Footer Branding */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 hidden w-full items-center justify-center sm:flex">
        <span className="flex items-center gap-1.5 text-slate-600 text-sm font-medium bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-slate-200 shadow-sm">
          <img src="/connect-love-logo.png" alt="" className="h-4 w-4 rounded" /> ConnectLove Secure Sales
        </span>
      </div>
    </div>
  );
}
