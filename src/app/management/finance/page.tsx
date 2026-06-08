"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert, Heart, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { loginManagement } from "@/app/actions/managementAuth";

export default function FinanceLoginPage() {
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
 const result = await loginManagement(email, password, "finance");

 if (!result.success) {
 throw new Error(result.error || "An error occurred during login. Please try again.");
 }

 // If successful, redirect
 router.push("/finance");
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
 <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden relative selection:bg-rose-500/30">
 
 {/* Background glowing orbs */}
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/20 blur-[120px] pointer-events-none" />
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

 {/* Main Glass Modal */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 className="w-full p-8 rounded-3xl bg-white/90 border border-slate-200 backdrop-blur-2xl shadow-xl relative z-10"
 >
 <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-100 pointer-events-none" />
 
 {/* Header */}
 <div className="flex flex-col items-center mb-8 text-center">
 <div className="h-[4.444vw] w-[4.444vw] bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
 <CreditCard className="h-[2.222vw] w-[2.222vw] text-white" />
 </div>
 <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Portal</h1>
 <p className="text-sm text-slate-500 mt-2">Secure gateway to the management dashboard.</p>
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
 <div className="p-3 text-sm font-medium rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
 <ShieldAlert className="h-[1.111vw] w-[1.111vw] shrink-0" />
 {error}
 </div>
 )}

 <div className="space-y-2">
 <Label className="text-slate-700 font-semibold">Email address</Label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.389vw] w-[1.389vw] text-slate-400" />
 <Input 
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@connectlove.com"
 className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-rose-500/20 h-[3.056vw]"
 />
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label className="text-slate-700 font-semibold">Password</Label>
 <button type="button" onClick={() => setView("forgot")} className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors">
 Forgot password?
 </button>
 </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.389vw] w-[1.389vw] text-slate-400" />
 <Input 
 type={showPassword ? "text" : "password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-rose-500/20 h-[3.056vw]"
 />
 <button 
 type="button" 
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
 >
 {showPassword ? <EyeOff className="h-[1.111vw] w-[1.111vw]" /> : <Eye className="h-[1.111vw] w-[1.111vw]" />}
 </button>
 </div>
 </div>

 <Button 
 type="submit" 
 disabled={loading || locked}
 className="w-full h-[3.333vw] mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white border-0 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all font-semibold rounded-xl"
 >
 {loading ? <Loader2 className="h-[1.389vw] w-[1.389vw] animate-spin" /> : "Login as Finance"}
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
 <Mail className="h-[3.333vw] w-[3.333vw] text-rose-500 mx-auto opacity-80" />
 <h2 className="text-lg font-semibold text-slate-900">Reset Password</h2>
 <p className="text-sm text-slate-500">Enter your admin email to receive a recovery link.</p>
 </div>

 <div className="space-y-2">
 <Label className="text-slate-700 font-semibold">Email address</Label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-[1.389vw] w-[1.389vw] text-slate-400" />
 <Input 
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="admin@connectlove.com"
 className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-rose-500/20 h-[3.056vw]"
 />
 </div>
 </div>

 <div className="flex gap-3">
 <Button 
 type="button" 
 variant="outline"
 onClick={() => setView("login")}
 className="flex-1 h-[3.333vw] bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm rounded-xl"
 >
 Back
 </Button>
 <Button 
 type="submit" 
 disabled={loading || !email}
 className="flex-1 h-[3.333vw] bg-rose-500 hover:bg-rose-400 text-white border-0 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all font-semibold rounded-xl"
 >
 {loading ? <Loader2 className="h-[1.389vw] w-[1.389vw] animate-spin" /> : "Send Link"}
 </Button>
 </div>
 </motion.form>
 )}

 </AnimatePresence>
 </motion.div>
 
 {/* Footer Branding */}
 <div className="absolute bottom-6 flex items-center justify-center w-full z-10 pointer-events-none">
 <span className="flex items-center gap-1.5 text-slate-600 text-sm font-medium bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-slate-200 shadow-sm">
 <Heart className="h-[0.833vw] w-[0.833vw] text-rose-500 fill-rose-500" /> ConnectLove Secure Admin
 </span>
 </div>
 </div>
 );
}
