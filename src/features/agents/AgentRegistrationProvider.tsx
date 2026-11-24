'use client';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export type AgentRegistrationDraft = { name: string; email: string; password: string; sentAt: number };
const RegistrationContext = createContext<{
  draft: AgentRegistrationDraft | null;
  setDraft: (draft: AgentRegistrationDraft) => void;
} | null>(null);

export function AgentRegistrationProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AgentRegistrationDraft | null>(null);
  const pathname = usePathname();
  // Signup credentials live only in memory between these two pages.
  useEffect(() => { if (!pathname.startsWith('/coordinator/register')) setDraft(null); }, [pathname]);
  const value = useMemo(() => ({ draft, setDraft }), [draft]);
  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useAgentRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('AgentRegistrationProvider is required.');
  return context;
}
