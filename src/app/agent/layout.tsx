import type { Metadata } from 'next';
import './agent.css';

export const metadata: Metadata = { title: 'Agent Workspace', robots: { index: false, follow: false } };
export default function AgentLayout({ children }: { children: React.ReactNode }) { return <div className="agent-space">{children}</div>; }
