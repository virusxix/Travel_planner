import type { ApiResponse } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function accessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function refreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hiddenstay-auth");
    if (!raw) return null;
    return (JSON.parse(raw) as { state?: { refreshToken?: string } }).state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

function persistTokens(access: string, refresh: string) {
  localStorage.setItem("accessToken", access);
  const raw = localStorage.getItem("hiddenstay-auth");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { state?: Record<string, string> };
    if (parsed.state) {
      parsed.state.accessToken = access;
      parsed.state.refreshToken = refresh;
      localStorage.setItem("hiddenstay-auth", JSON.stringify(parsed));
    }
  } catch {
    /* store out of sync — access token still updated */
  }
}

let refreshJob: Promise<string | null> | null = null;

async function rotateAccessToken(): Promise<string | null> {
  if (refreshJob) return refreshJob;

  refreshJob = (async () => {
    const rt = refreshToken();
    if (!rt) return null;

    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return null;

      const access = json.data.accessToken as string;
      const nextRefresh = json.data.refreshToken as string;
      persistTokens(access, nextRefresh);
      return access;
    } catch {
      return null;
    } finally {
      refreshJob = null;
    }
  })();

  return refreshJob;
}

async function request(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  const token = accessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status !== 401 || !retry || typeof window === "undefined") return res;

  const next = await rotateAccessToken();
  if (next) return request(path, init, false);

  localStorage.removeItem("accessToken");
  const { useAuthStore } = await import("@/stores/auth");
  useAuthStore.getState().logout();
  return res;
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  return res.json() as Promise<ApiResponse<T>>;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await request(path, init);
  const json = await parseJson<T>(res);
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Request failed");
  return json.data;
}

export async function apiWithMeta<T>(
  path: string,
  init?: RequestInit
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await request(path, init ?? {});
  const json = await parseJson<T>(res);
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Request failed");
  return { data: json.data, meta: json.meta };
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await request("/upload", { method: "POST", body: form });
  const json = await parseJson<{ url: string }>(res);
  if (!res.ok || !json.success) throw new Error(json.error?.message ?? "Upload failed");
  return json.data.url;
}
