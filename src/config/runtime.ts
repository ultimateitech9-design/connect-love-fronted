function resolveBrowserOrigin(configuredOrigin: string, port: string): string {
  const origin = configuredOrigin.replace(/\/$/, "");

  if (typeof window === "undefined") return origin;

  try {
    const url = new URL(origin);
    const isLoopback = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const pageIsOnLan = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

    // A phone opening the LAN URL must call the host computer, not its own localhost.
    if (isLoopback && pageIsOnLan) {
      if (window.location.protocol === "https:") {
        return window.location.origin;
      }
      url.hostname = window.location.hostname;
      url.port = port;
      return url.origin;
    }
  } catch {
    // Keep the configured value so a malformed environment value fails visibly.
  }

  return origin;
}

const configuredApiOrigin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const configuredSocketOrigin = process.env.NEXT_PUBLIC_SOCKET_URL || configuredApiOrigin;
const configuredSiteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

export const API_ORIGIN = resolveBrowserOrigin(configuredApiOrigin, "5002");
export const SOCKET_ORIGIN = resolveBrowserOrigin(configuredSocketOrigin, "5002");
export const SITE_ORIGIN = resolveBrowserOrigin(configuredSiteOrigin, windowPort("3002"));

export function apiOriginCandidates(): string[] {
  const candidates = [API_ORIGIN];

  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    if (window.location.protocol === "https:") {
      candidates.push(currentOrigin);
      candidates.push(`https://api.${window.location.hostname.replace(/^www\./, "")}`);
    }
  }

  return [...new Set(candidates.map((origin) => origin.replace(/\/$/, "")))];
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origins = apiOriginCandidates();
  let lastError: unknown = null;

  for (const origin of origins) {
    try {
      const response = await fetch(`${origin}${normalizedPath}`, init);
      if (response.status !== 404 || origin === origins[origins.length - 1]) return response;
      lastError = new Error(`API route not found at ${origin}${normalizedPath}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API request failed");
}

const turnUrl = process.env.NEXT_PUBLIC_TURN_URL?.trim();
const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME?.trim();
const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL?.trim();

export const WEBRTC_ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ...(turnUrl && turnUsername && turnCredential
    ? [{
        urls: turnUrl.split(",").map((url) => url.trim()).filter(Boolean),
        username: turnUsername,
        credential: turnCredential,
      }]
    : []),
];

function windowPort(fallback: string): string {
  return typeof window !== "undefined" ? window.location.port || fallback : fallback;
}

