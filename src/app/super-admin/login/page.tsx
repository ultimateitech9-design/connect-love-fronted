'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleLogin = (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 if (!email || !password) {
 setError("Please fill in both fields.");
 return;
 }

 setLoading(true);

 // Simulate login network request
 setTimeout(() => {
 if (email.includes("@") && password.length > 0) {
 router.push("/");
 } else {
 setError("Invalid email or password.");
 setLoading(false);
 }
 }, 1000);
 };

 return (
 <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-[Inter,ui-sans-serif,system-ui]">
 
 {/* Brand Logo */}
 <div className="mb-10 text-center flex flex-col items-center gap-2">
 <div className="h-[3.889vw] w-[3.889vw] rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-2" style={{ background: "var(--gradient-brand)" }}>
 <Lock className="h-[1.667vw] w-[1.667vw]" />
 </div>
 <h1 className="font-extrabold text-4xl leading-none tracking-tight">
 <span className="text-black" style={{ color: "black" }}>Connect</span><span className="text-rose-500">Love</span>
 </h1>
 <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest">
 Super Admin
 </p>
 </div>

 {/* Login Card */}
 <div className="w-full max-w-[29.167vw] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
 <div className="p-8 sm:p-10 space-y-8">
 
 <div className="space-y-1.5 text-center">
 <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
 <p className="text-sm text-muted-foreground">
 Sign in to manage the ConnectLove platform
 </p>
 </div>

 <form onSubmit={handleLogin} className="space-y-6">
 
 {error && (
 <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 text-sm flex items-start gap-3">
 <AlertCircle className="h-[1.389vw] w-[1.389vw] shrink-0 mt-0.5" />
 <p className="leading-tight">{error}</p>
 </div>
 )}

 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
 <Mail className="h-[1.111vw] w-[1.111vw]" />
 </div>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="w-full h-[3.056vw] pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
 placeholder="superadmin@connectlove.com"
 />
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="text-xs font-bold text-foreground uppercase tracking-wider">Password</label>
 <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
 </div>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
 <Lock className="h-[1.111vw] w-[1.111vw]" />
 </div>
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="w-full h-[3.056vw] pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
 placeholder="••••••••"
 />
 </div>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full h-[3.333vw] rounded-xl text-primary-foreground font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70 shadow-lg"
 style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}
 >
 {loading ? (
 <>
 <Loader2 className="h-[1.389vw] w-[1.389vw] animate-spin" />
 Signing in...
 </>
 ) : (
 "Sign In"
 )}
 </button>
 </form>

 </div>
 
 {/* Footer */}
 <div className="bg-muted/40 p-6 border-t border-border text-center">
 <p className="text-xs text-muted-foreground font-medium">
 Protected by ConnectLove Security Systems.
 </p>
 </div>
 </div>
 </div>
 );
}
