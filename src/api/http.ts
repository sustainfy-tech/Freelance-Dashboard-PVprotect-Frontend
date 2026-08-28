/**
 * Thin fetch wrapper used by every API module. Centralizes base URL
 * resolution, JSON handling, and error shaping so pages/components never
 * call `fetch` directly.
 *
 * Auth is handled via an httpOnly cookie set by the backend on login —
 * `credentials: "include"` ensures the browser sends it automatically.
 * The frontend never reads or attaches the token itself.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// Mount points for the two routers you shared. Change these if your
// Express app mounts them somewhere else, e.g. app.use('/services', ...).
export const SERVICES_BASE = `${API_BASE_URL}/services`;
export const ADMIN_BASE = `${API_BASE_URL}/admin`;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(base: string, path: string, query?: RequestOptions["query"]) {
  const url = new URL(base + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/**
 * The backend wraps every response as:
 *   { success: boolean, data: T, message?: string, ... }
 * This type-guards that shape so we can safely unwrap `.data` without
 * an `any` cast leaking through.
 */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  [key: string]: unknown;
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

export async function apiRequest<T>(
  base: string,
  path: string,
  { method = "GET", body, query }: RequestOptions = {}
): Promise<T> {
  const url = buildUrl(base, path, query);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "include", // sends the httpOnly admin session cookie
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      `Network error calling ${method} ${url}. Is the API running and reachable at ${API_BASE_URL}?`,
      0,
      err
    );
  }

  const text = await res.text();
  const parsed = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    // Session expired/invalid — bounce to login rather than showing
    // whatever partial/broken state the page is in.
    if (res.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    const message =
      (parsed && typeof parsed === "object" && parsed !== null && "message" in parsed && String((parsed as Record<string, unknown>).message)) ||
      `${method} ${url} failed with ${res.status}`;
    throw new ApiError(message, res.status, parsed);
  }

  // Unwrap the { success, data } envelope so every api/*.ts module can
  // keep typing its return as the actual payload (T), not the wrapper.
  // Endpoints that don't use the envelope fall through unchanged.
  if (isEnvelope(parsed)) {
    if (parsed.success === false) {
      const message = parsed.message ?? `${method} ${url} returned success: false`;
      throw new ApiError(message, res.status, parsed);
    }
    return parsed.data as T;
  }

  return parsed as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}