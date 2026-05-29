import type { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("hiddenstay-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { refreshToken?: string } };
    return parsed.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return null;

      const accessToken = json.data.accessToken as string;
      const newRefresh = json.data.refreshToken as string;
      localStorage.setItem("accessToken", accessToken);

      const stored = localStorage.getItem("hiddenstay-auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state) {
          parsed.state.accessToken = accessToken;
          parsed.state.refreshToken = newRefresh;
          localStorage.setItem("hiddenstay-auth", JSON.stringify(parsed));
        }
      }
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function fetchWithAuth(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && typeof window !== "undefined") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchWithAuth(path, options, false);
    }
    localStorage.removeItem("accessToken");
    const { useAuthStore } = await import("@/stores/auth");
    useAuthStore.getState().logout();
  }

  return res;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetchWithAuth(path, options);
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Request failed");
  }
  return json.data;
}

export async function apiWithMeta<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await fetchWithAuth(path, options);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Request failed");
  return { data: json.data, meta: json.meta };
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetchWithAuth("/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error?.message || "Upload failed");
  return json.data.url as string;
}
