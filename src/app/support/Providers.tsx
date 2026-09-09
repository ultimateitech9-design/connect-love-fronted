"use client";

// The route-level QueryProvider owns one shared cache for every dashboard.
// A second provider here would isolate Support data from global refreshes.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}