"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Database, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginManagement } from "@/app/actions/managementAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DataEntryLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"login" | "forgot">("login");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (locked || loading) return;
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setLoading(true);
    setLocked(true);
    window.setTimeout(() => setLocked(false), 2000);

    try {
      const result = await loginManagement(email, password, "data-entry");
      if (!result.success) throw new Error(result.error || "Login failed.");
      router.push("/data-entry");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login.");
      setLoading(false);
    }
  };

  const handleForgotPassword = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setView("login");
      setError("A recovery link has been sent to your email.");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg">
            <Database className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Data Entry Portal</h1>
          <p className="mt-2 text-sm text-slate-500">Secure gateway for record review and entry work.</p>
        </div>

        <AnimatePresence mode="wait">
          {view === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="dataentry@connectlove.com"
                    className="h-11 border-slate-200 bg-white pl-10 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold text-slate-700">Password</Label>
                  <button type="button" onClick={() => setView("forgot")} className="text-xs font-semibold text-rose-600 hover:text-rose-500">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    className="h-11 border-slate-200 bg-white pl-10 pr-10 text-slate-900"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading || locked} className="h-11 w-full rounded-xl bg-slate-950 font-semibold text-white hover:bg-slate-800">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login as Data Entry"}
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleForgotPassword}
              className="space-y-5"
            >
              <div className="text-center">
                <Mail className="mx-auto mb-2 h-10 w-10 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-950">Reset Password</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your email to receive a recovery link.</p>
              </div>
              <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="dataentry@connectlove.com" className="h-11" />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setView("login")} className="h-11 flex-1 rounded-xl">Back</Button>
                <Button type="submit" disabled={loading} className="h-11 flex-1 rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Link"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
