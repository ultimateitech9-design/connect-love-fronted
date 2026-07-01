"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";

export default function VerificationPage() {
 const [pending, setPending] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
 api.verification()
 .then((data) => setPending(data.queue || []))
 .catch(() => setError("Verification data load nahi hua. Admin session ya backend check karein."))
 .finally(() => setLoading(false));
 }, []);

 const updateVerification = async (id: string, status: "approved" | "rejected") => {
 try {
 await api.updateVerification(id, status);
 setPending((rows) => rows.filter((row) => row.id !== id));
 } catch {
 alert("Verification update failed.");
 }
 };

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Profile verification</h1>
 <p className="text-sm text-muted-foreground">Approve government-ID submissions to issue the verified badge.</p>
 </header>
 <div className="grid gap-4 md:grid-cols-2">
 {loading && <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading verification queue from database...</div>}
 {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>}
 {!loading && !error && pending.length === 0 && <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No verification requests found.</div>}
 {pending.map((u) => (
 <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">{u.name || u.user?.name || "Unknown user"}</p>
 <p className="text-xs text-muted-foreground">{u.email || u.user?.email || u.idType}</p>
 <p className="mt-1 text-xs font-semibold text-rose-500">{u.idType} · {u.status}</p>
 </div>
 <ShieldAlert className="h-[20px] w-[20px] text-amber-500" />
 </div>
 <div className="mt-4 grid grid-cols-2 gap-2">
 <PreviewImage src={u.photo} label="Profile photo" />
 <PreviewImage src={u.documents?.[0]} label="KYC frame" />
 </div>
 <div className="mt-4 flex gap-2">
 <Button className="flex-1 bg-primary" onClick={() => updateVerification(u.id, "approved")}><BadgeCheck className="mr-2 h-[16px] w-[16px]" />Approve</Button>
 <Button className="flex-1" variant="outline" onClick={() => updateVerification(u.id, "rejected")}>Reject</Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

function PreviewImage({ src, label }: { src?: string | null; label: string }) {
 return (
 <div className="aspect-[3/2] overflow-hidden rounded-lg bg-muted">
 {src ? (
 <img src={src} alt={label} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
 {label} not available
 </div>
 )}
 </div>
 );
}
