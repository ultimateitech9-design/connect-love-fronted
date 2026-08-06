import { directFetch } from "@/lib/api";

export type DiscoveryFilters = {
  interestedIn?: "female" | "male" | "non-binary" | "prefer-not" | "everyone";
  search?: string;
  ageMin?: number;
  ageMax?: number;
  goals?: string[];
  maxDistance?: number;
  page?: number;
  limit?: number;
};

export function getDiscoveryProfiles(filters: DiscoveryFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) params.set(key, String(value));
  });
  const query = params.toString();
  return directFetch<any[]>(`/discovery${query ? `?${query}` : ""}`, { signal });
}

export function swipeProfile(receiverId: string, action: "like" | "pass" | "superlike") {
  return directFetch<any>("/matches/swipe", {
    method: "POST",
    body: JSON.stringify({ receiverId, action }),
  });
}

export function undoSwipeProfile(receiverId: string) {
  return directFetch<{ deleted: boolean }>(`/matches/swipe/${receiverId}`, { method: "DELETE" });
}

export function getDiscoveryProfileDetails(userId: string, signal?: AbortSignal) {
  return directFetch<any>(`/users/${userId}/details`, { signal });
}
