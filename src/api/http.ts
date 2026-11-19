import axios, { AxiosError, type Method } from "axios";

export const API_BASE_URL = import.meta.env.VITE_APP_SERVER_BASE_URL?.replace(
  /\/+$/,
  ""
);

const isNgrok = /ngrok/i.test(API_BASE_URL);

console.log('API_BASE_URL',API_BASE_URL)

if (!API_BASE_URL) {
  throw new Error(
    "VITE_APP_SERVER_BASE_URL is not configured. Check the deployment environment."
  );
}

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

const client = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    ...(isNgrok ? { "ngrok-skip-browser-warning": "true" } : {}),
  },
});

client.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("pvprotect_admin");
    if (raw) {
      // pvprotect_admin may hold a plain token or a JSON object; handle both
      let token = raw;
      try {
        const parsed = JSON.parse(raw);
        token = parsed?.token ?? parsed?.accessToken ?? raw;
      } catch {
        // not JSON, so it's already the token
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable: send the request without a token
  }
  return config;
});

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

function extractMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as Record<string, unknown>).message !== "undefined"
  ) {
    return String((data as Record<string, unknown>).message);
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  try {
    const res = await client.request<unknown>({
      url,
      method: method as Method,
      params: query,
      data: body,
    });

    const parsed = res.data;
    if (isEnvelope(parsed)) {
      if (parsed.success === false) {
        const message =
          parsed.message ?? `${method} ${url} returned success: false`;
        throw new ApiError(message, res.status, parsed);
      }
      return parsed.data as T;
    }

    return parsed as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<unknown>;
      if (!axiosErr.response) {
        throw new ApiError(`Network error calling `, 0, axiosErr);
      }

      const { status, data: parsed } = axiosErr.response;

      if (status === 401 && window.location.pathname !== "/login") {
        localStorage.removeItem("pvprotect_admin");
        window.location.href = "/login";
      }

      const message = extractMessage(
        parsed,
        ` failed with ${status}`
      );

      throw new ApiError(message, status, parsed);
    }

    throw new ApiError(`${method} ${url} failed unexpectedly.`, 0, err);
  }
}

