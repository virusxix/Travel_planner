export const DEMO_AUTH_PREFILL_KEY = "hiddenstay-demo-auth-prefill";

export function storeDemoAuthPrefill(email: string, password: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DEMO_AUTH_PREFILL_KEY, JSON.stringify({ email, password }));
}

export function consumeDemoAuthPrefill(): { email: string; password: string } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DEMO_AUTH_PREFILL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(DEMO_AUTH_PREFILL_KEY);
  try {
    return JSON.parse(raw) as { email: string; password: string };
  } catch {
    return null;
  }
}
