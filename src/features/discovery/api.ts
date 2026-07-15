import { directFetch } from "@/lib/api";

export type DiscoveryFilters = {
  interestedIn?: "female" | "male" | "non-binary" | "everyone";
  search?: string;
  ageMin?: number;
  ageMax?: number;
  goals?: string[];
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
