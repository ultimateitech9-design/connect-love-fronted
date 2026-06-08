import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/features/support/components/ui/card";
import { cn } from "@/features/support/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  tone?: "primary" | "success" | "warning" | "destructive" | "info";
}

const toneMap = {
  primary: "text-primary bg-primary/10",
  success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
  warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/15",
  destructive: "text-destructive bg-destructive/10",
  info: "text-[color:var(--info)] bg-[color:var(--info)]/10",
} as const;

export function StatCard({ label, value, icon: Icon, delta, tone = "primary" }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {delta && <p className="text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
