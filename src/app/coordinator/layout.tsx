import type { Metadata } from 'next';
import './agent.css';
import { AgentRegistrationProvider } from '@/features/agents/AgentRegistrationProvider';

export const metadata: Metadata = { title: 'Coordinator Workspace', robots: { index: false, follow: false } };
export default function AgentLayout({ children }: { children: React.ReactNode }) { return <AgentRegistrationProvider><div className="agent-space">{children}</div></AgentRegistrationProvider>; }
