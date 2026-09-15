"use client";

import { QueryProvider } from "@/components/QueryProvider";

export function RouteQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
