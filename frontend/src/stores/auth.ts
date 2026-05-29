import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }
        set({ user, accessToken, refreshToken });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      login: async (email, password) => {
        const data = await api<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        get().setAuth(data.user, data.accessToken, data.refreshToken);
      },

      register: async (body) => {
        const data = await api<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>("/auth/register", {
          method: "POST",
          body: JSON.stringify(body),
        });
        get().setAuth(data.user, data.accessToken, data.refreshToken);
      },

      hydrate: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const user = await api<User>("/auth/me");
          set({ user });
        } catch {
          get().logout();
        }
      },
    }),
    { name: "hiddenstay-auth", partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);
