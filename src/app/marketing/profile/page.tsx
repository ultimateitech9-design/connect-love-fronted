"use client";

import { useEffect, useState } from "react";
import { User, Mail, Lock, Shield, Save } from "lucide-react";
import { getManagementToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export default function ProfilePage() {
 const [formData, setFormData] = useState({
 name: "Sagar Gautam Jha",
 email: "admin@loveconnect.com",
 password: "••••••••",
 role: "Marketing Manager",
 });
 const [message, setMessage] = useState("");

 useEffect(() => {
 const token = getManagementToken();
 if (!token) return;
 fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : null)
 .then((user) => user && setFormData({ name: user.name || "", email: user.email || "", password: "", role: user.role || "marketing" }));
 }, []);

 const saveProfile = async (event: React.FormEvent) => {
 event.preventDefault();
 const response = await fetch(`${API}/users/me`, {
 method: "PATCH",
 headers: { Authorization: `Bearer ${getManagementToken()}`, "Content-Type": "application/json" },
 body: JSON.stringify({ name: formData.name }),
 });
 setMessage(response.ok ? "Profile saved." : "Could not save profile.");
 };

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setFormData({ ...formData, [e.target.name]: e.target.value });
 };

 return (
 <div className="min-h-screen bg-background text-foreground space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-border/30">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
 <p className="text-muted-foreground mt-1 text-sm">Manage your account settings and preferences.</p>
 </div>
 </div>

 <div className=" bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
 <form className="space-y-6" onSubmit={saveProfile}>
 <div className="flex items-center gap-4 mb-8">
 <div className="h-[80px] w-[80px] rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border-2 border-primary/30">
 M
 </div>
 <div>
 <h2 className="text-xl font-semibold text-white">{formData.name}</h2>
 <p className="text-sm text-muted-foreground">Marketing Manager</p>
 </div>
 </div>

 <div className="grid gap-4">
 <div className="grid gap-2">
 <label className="text-sm font-medium text-white flex items-center gap-2">
 <User className="h-[16px] w-[16px] text-muted-foreground" /> Full Name
 </label>
 <input
 type="text"
 name="name"
 value={formData.name}
 onChange={handleChange}
 className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
 placeholder="Enter your name"
 />
 </div>

 <div className="grid gap-2">
 <label className="text-sm font-medium text-white flex items-center gap-2">
 <Mail className="h-[16px] w-[16px] text-muted-foreground" /> Email Address
 </label>
 <input
 type="email"
 name="email"
 value={formData.email}
 readOnly
 className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
 placeholder="Enter your email"
 />
 </div>

 <div className="grid gap-2">
 <label className="text-sm font-medium text-white flex items-center gap-2">
 <Lock className="h-[16px] w-[16px] text-muted-foreground" /> Password
 </label>
 <input
 type="password"
 name="password"
 value={formData.password}
 readOnly
 className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
 placeholder="Enter new password"
 />
 </div>

 <div className="grid gap-2">
 <label className="text-sm font-medium text-white flex items-center gap-2">
 <Shield className="h-[16px] w-[16px] text-muted-foreground" /> Role
 </label>
 <select
 name="role"
 value={formData.role}
 disabled
 className="w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
 >
 <option value="Admin">Admin</option>
 <option value="Marketing Manager">Marketing Manager</option>
 <option value="Viewer">Viewer</option>
 </select>
 </div>
 </div>

 <div className="pt-4 flex justify-end">
 <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all">
 <Save className="h-[16px] w-[16px]" /> Save Changes
 </button>
 </div>
 {message && <p className="text-sm text-primary">{message}</p>}
 </form>
 </div>
 </div>
 );
}
