import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
 return (
 <div className="rounded-2xl bg-card border border-border p-5 hover:shadow-[var(--shadow-rose)] transition-shadow">
 <div className="text-sm text-muted-foreground">{label}</div>
 <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
 <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
 positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
 }`}>
 {positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
 {delta}
 </div>
 </div>
 );
}

export function StatusBadge({ status }: { status: string }) {
 const map: Record<string, string> = {
 Successful: "bg-success/15 text-success",
 Approved: "bg-success/15 text-success",
 Active: "bg-success/15 text-success",
 Paid: "bg-success/15 text-success",
 Pending: "bg-warning/20 text-warning-foreground",
 Expiring: "bg-warning/20 text-warning-foreground",
 Unpaid: "bg-warning/20 text-warning-foreground",
 Failed: "bg-destructive/15 text-destructive",
 Rejected: "bg-destructive/15 text-destructive",
 Overdue: "bg-destructive/15 text-destructive",
 };
 return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}
