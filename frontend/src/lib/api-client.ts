import type { ApiResponse, ToastPayload } from "@bank/types";

export class ApiError extends Error {
  status: number;
  toast?: ToastPayload;

  constructor(message: string, status: number, toast?: ToastPayload) {
    super(message);
    this.status = status;
    this.toast = toast;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
}

export const apiFetch = async <T>(path: string, options: RequestOptions = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  const payload = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok || payload.success === false) {
    throw new ApiError(payload.message ?? "Request failed", res.status, payload.toast);
  }

  return payload;
};

