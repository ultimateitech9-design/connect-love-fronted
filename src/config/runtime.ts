export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002").replace(/\/$/, "");
export const SOCKET_ORIGIN = (process.env.NEXT_PUBLIC_SOCKET_URL || API_ORIGIN).replace(/\/$/, "");
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");

