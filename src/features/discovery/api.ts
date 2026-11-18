import { directFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

type SearchPage = { items: any[]; hasMore: boolean; nextCursor: string | null };
const searchCache = new Map<string, { at: number; data: SearchPage }>();
export function clearDiscoverySearchCache() { searchCache.clear(); }

export type DiscoveryFilters = {
  interests?: string[];
  verifiedOnly?: boolean;
  cursor?: string;
  queue?: boolean;
  interestedIn?: "female" | "male" | "non-binary" | "prefer-not" | "everyone";
  search?: string;
  ageMin?: number;
  ageMax?: number;
  goals?: string[];
  maxDistance?: number;
  page?: number;
  limit?: number;
  excludeIds?: string[];
};

export function getDiscoveryProfiles(filters: DiscoveryFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0)) params.set(key, String(value));
  });
  const query = params.toString();
  return directFetch<any>(`/discovery${query ? `?${query}` : ""}`, { signal });
}

export function swipeProfile(receiverId: string, action: "like" | "pass" | "superlike") {
  return directFetch<any>("/matches/swipe", {
    method: "POST",
    body: JSON.stringify({ receiverId, action }),
  }).then(result => { clearDiscoverySearchCache(); return result; });
}

export async function searchDiscoveryProfiles(filters: DiscoveryFilters, signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const search = String(filters.search || '').trim().replace(/\s+/g, ' ');
  if (!search) return { items: [], hasMore: false, nextCursor: null };
  const params = new URLSearchParams();
  Object.entries({ ...filters, search, compact: true }).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length)) params.set(key, String(value));
  });
  const cacheKey = (getToken() || '') + ':' + params.toString();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 30000) return cached.data;
  const data = await directFetch<SearchPage>(
    '/discovery/search?' + params.toString(), { signal },
  );
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (searchCache.size >= 30) searchCache.delete(searchCache.keys().next().value!);
  searchCache.set(cacheKey, { at: Date.now(), data });
  return data;
}

export function getDiscoverySearchThumbnail(id: string, signal?: AbortSignal) {
  return directFetch<{ photo: string | null }>('/discovery/search/thumbnail/' + encodeURIComponent(id), { signal });
}

export function undoSwipeProfile(receiverId: string) {
  return directFetch<{ deleted: boolean }>(`/matches/swipe/${receiverId}`, { method: "DELETE" });
}

export function recordDiscoveryProfileView(userId: string) {
  return directFetch<{ recorded: boolean }>(`/users/${userId}/view`, { method: "POST" });
}

export function getDiscoveryProfileDetails(userId: string, signal?: AbortSignal) {
  return directFetch<any>(`/users/${userId}/details`, { signal });
}
