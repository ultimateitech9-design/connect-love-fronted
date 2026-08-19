const AVATAR_CACHE_KEY = "cl_avatar_url";

function canPersistAvatar(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return Boolean(value) && value.length <= 4096 && !normalized.startsWith("data:") && !normalized.startsWith("blob:");
}

export function getCachedAvatarUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(AVATAR_CACHE_KEY);
    if (!cached) return null;
    if (!canPersistAvatar(cached)) {
      window.localStorage.removeItem(AVATAR_CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

export function cacheAvatarUrl(value?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!value || !canPersistAvatar(value)) {
      window.localStorage.removeItem(AVATAR_CACHE_KEY);
      return;
    }
    window.localStorage.setItem(AVATAR_CACHE_KEY, value);
  } catch {
    try { window.localStorage.removeItem(AVATAR_CACHE_KEY); } catch {}
  }
}
