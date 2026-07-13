import { directFetch } from "@/lib/api";

export type MatchFilter = "active" | "sent" | "received" | "blocked";

export const matchesApi = {
  list: (filter: MatchFilter) => directFetch<any[]>(`/matches?filter=${filter}`),
  respond: (matchId: string, action: "accept" | "decline") =>
    directFetch("/matches/respond", { method: "POST", body: JSON.stringify({ matchId, action }) }),
  block: (matchId: string) => directFetch(`/matches/block/${matchId}`, { method: "PATCH" }),
  unblock: (matchId: string) => directFetch(`/matches/unblock/${matchId}`, { method: "PATCH" }),
};

