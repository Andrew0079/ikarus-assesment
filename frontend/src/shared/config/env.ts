/**
 * App config from environment.
 * Vite exposes env vars prefixed with VITE_ on import.meta.env.
 */
const VITE_API_URL = import.meta.env.VITE_API_URL;

export const env = {
  apiUrl: typeof VITE_API_URL === "string" && VITE_API_URL.length > 0 ? VITE_API_URL : "",
} as const;

export function getApiBaseUrl(): string {
  if (env.apiUrl) return env.apiUrl;
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
