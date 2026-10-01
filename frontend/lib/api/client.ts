// Centralized API client for SlotSync backend (REST /api/v1).
// Handles base URL, credentials (httpOnly cookie) + optional Bearer token,
// JSON parsing, and standardized error handling. Feature-specific
// functions live in features/*/api.ts — pages must not raw-fetch.

import { ApiError } from "./errors";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000/api/v1";

const TOKEN_KEY = "slotsync_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function request<T>(
  method: string,
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  // 204 / empty body
  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = json as {
      success?: boolean;
      error?: { code?: string; message?: string };
    } | null;
    throw new ApiError(
      res.status,
      err?.error?.code ?? "REQUEST_FAILED",
      err?.error?.message ?? `Request failed (${res.status}).`
    );
  }

  // Backend envelope: { success: true, data, meta? } — unwrap data, keep meta.
  if (
    json !== null &&
    typeof json === "object" &&
    "success" in json &&
    (json as { success: boolean }).success === true &&
    "data" in json
  ) {
    const envelope = json as { data: T; meta?: unknown };
    if (envelope.meta !== undefined && typeof envelope.data !== "object") {
      return envelope.data;
    }
    // Attach meta when data is an array-returning paginated call: callers
    // that need pagination should use api.paginated() instead.
    return envelope.data as T;
  }
  return json as T;
}

export interface Paginated<T> {
  items: T[];
  meta: { page: number; limit: number; total: number };
}

async function paginatedRequest<T>(
  method: string,
  path: string,
  opts: RequestOptions = {}
): Promise<Paginated<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    credentials: "include",
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const err = json as {
      error?: { code?: string; message?: string };
    } | null;
    throw new ApiError(
      res.status,
      err?.error?.code ?? "REQUEST_FAILED",
      err?.error?.message ?? `Request failed (${res.status}).`
    );
  }

  const envelope = json as {
    success: boolean;
    data: T[];
    meta?: { page: number; limit: number; total: number };
  };
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    meta: envelope.meta ?? { page: 1, limit: 20, total: 0 },
  };
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>("DELETE", path, opts),
  getPaginated: <T>(path: string, opts?: RequestOptions) =>
    paginatedRequest<T>("GET", path, opts),
};

export { BASE_URL };
