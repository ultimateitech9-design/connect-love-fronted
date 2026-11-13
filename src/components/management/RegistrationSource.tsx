export type RegistrationOrigin = { registrationSource?: string; createdByAgentId?: string | null; createdByAgent?: { id: string; name: string; email: string } | null };
export function RegistrationSource({ user, detailed = false }: { user: RegistrationOrigin; detailed?: boolean }) {
  const agent = user.createdByAgent;
  if (!user.createdByAgentId) return <span className="text-[11px] text-muted-foreground">Direct / platform registration</span>;
  return <div className="min-w-0"><span className="inline-flex max-w-full truncate rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700" title={agent ? `${agent.name} (${agent.email})` : user.createdByAgentId}>Agent: {agent?.name || 'Agent account'}</span>{detailed && <div className="mt-2 space-y-1 break-all text-xs text-muted-foreground"><p>{agent?.email || 'Agent details unavailable'}</p><p>Agent ID: {user.createdByAgentId}</p></div>}</div>;
}
