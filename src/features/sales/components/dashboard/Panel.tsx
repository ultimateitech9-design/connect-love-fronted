import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, action, children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 ${className}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}