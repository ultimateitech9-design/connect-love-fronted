export type CallSummary = { totalCalls: number; audioCalls: number; videoCalls: number; audioSeconds: number; videoSeconds: number };
export type UserActivity = {
  friendCount: number; friends: { id: string; name: string; city?: string; connectedAt: string }[]; friendsLimit: number;
  summary: CallSummary; contacts: (CallSummary & { id: string; name: string; lastCallAt: string })[]; contactsLimit: number;
  calls: { id: string; peerId: string; peerName: string; callType: string; status: string; direction: string; createdAt: string; startedAt: string | null; endedAt: string | null; durationSeconds: number }[];
  page: number; pages: number; limit: number; totalCalls: number;
};
export function callDuration(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  const h = Math.floor(value / 3600), m = Math.floor((value % 3600) / 60), s = value % 60;
  return h ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}
