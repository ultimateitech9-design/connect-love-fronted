"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function VerificationPage() {
 const [pending, setPending] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const token = getToken();
 if (!token) {
 setLoading(false);
 return;
 }
 fetch(`${API}/admin/verification`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : [])
 .then((data) => setPending(Array.isArray(data) ? data : []))
 .finally(() => setLoading(false));
 }, []);

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Profile verification</h1>
 <p className="text-sm text-muted-foreground">Approve government-ID submissions to issue the verified badge.</p>
 </header>
 <div className="grid gap-4 md:grid-cols-2">
 {loading && <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading verification queue from database...</div>}
 {!loading && pending.length === 0 && <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No verification requests found.</div>}
 {pending.map((u) => (
 <div key={u.id} className="rounded-2xl border border-border bg-card p-5">
 <div className="flex items-center justify-between">
 <div>
 <p className="font-medium">{u.user?.name || "Unknown user"}</p>
 <p className="text-xs text-muted-foreground">{u.user?.email || u.idType}</p>
 </div>
 <ShieldAlert className="h-[1.389vw] w-[1.389vw] text-amber-500" />
 </div>
 <div className="mt-4 grid grid-cols-2 gap-2">
 <div className="aspect-[3/2] rounded-lg bg-muted" />
 <div className="aspect-[3/2] rounded-lg bg-muted" />
 </div>
 <div className="mt-4 flex gap-2">
 <Button className="flex-1 bg-primary"><BadgeCheck className="mr-2 h-[1.111vw] w-[1.111vw]" />Approve</Button>
 <Button className="flex-1" variant="outline">Reject</Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
