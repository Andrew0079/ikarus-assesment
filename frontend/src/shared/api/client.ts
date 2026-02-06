import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "../config/env";
import type { ApiError } from "./types";

/** Normalized error thrown by the API client (matches backend `{ code, message }`). */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly response: unknown;

  constructor(message: string, code: string, status: number, response?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.response = response;
  }
}

export interface ApiClientConfig {
  /** Called before each request; return token to attach as Bearer, or null for public routes. */
  getToken: () => string | null;
  /** Called when the API returns 401; use to clear auth state and/or redirect to login. */
  onUnauthorized?: () => void;
}

let authConfig: ApiClientConfig | null = null;

/**
 * Configure auth behaviour for the API client. Call once at app startup (e.g. in a provider).
 * - getToken: used by the request interceptor to add `Authorization: Bearer <token>`.
 * - onUnauthorized: called on 401 responses so you can clear credentials and redirect.
 */
export function configureApiClient(config: ApiClientConfig): void {
  authConfig = config;
}

function parseErrorPayload(data: unknown): { code: string; message: string } {
  if (data && typeof data === "object" && "code" in data && "message" in data) {
    const { code, message } = data as ApiError;
    return { code: String(code), message: String(message) };
  }
  return { code: "unknown", message: "An unexpected error occurred" };
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Request: attach JWT when a token is available and add request ID for tracing
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authConfig?.getToken() ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add request ID for correlation with backend logs
  config.headers["X-Request-ID"] = crypto.randomUUID();

  return config;
});

// Response: normalize errors and handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      throw new ApiClientError(error.message ?? "Request failed", "unknown", 0);
    }

    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const { code, message } = parseErrorPayload(data);

    // Only clear credentials on 401 if we actually sent a token
    // (don't clear on failed login attempts)
    if (status === 401) {
      const sentToken = error.config?.headers?.Authorization;
      if (sentToken && authConfig?.onUnauthorized) {
        authConfig.onUnauthorized();
      }
    }

    throw new ApiClientError(message, code, status, error.response);
  }
);

export default apiClient;
