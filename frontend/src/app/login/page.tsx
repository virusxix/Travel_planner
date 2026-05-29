"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { DemoAccounts } from "@/components/auth/demo-accounts";
import { consumeDemoAuthPrefill } from "@/lib/demo-auth-prefill";
import { useAuthStore } from "@/stores/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  useEffect(() => {
    const prefill = consumeDemoAuthPrefill();
    if (prefill) {
      setEmail(prefill.email);
      setPassword(prefill.password);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === "ADMIN") router.push("/admin");
      else if (user?.role === "BUSINESS_OWNER") router.push("/business");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(nextEmail: string, nextPassword: string) {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError("");
  }

  return (
    <AuthPageShell title="Welcome back" subtitle="Sign in to HiddenStay AI">
      <GlassCard hover={false} className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </FormField>
          <FormField label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-500 dark:bg-red-900/20">
              {error}
            </p>
          )}
          <Button type="submit" className="h-12 w-full rounded-2xl" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6">
          <DemoAccounts onSelect={fillDemo} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">
            Create one
          </Link>
        </p>
      </GlassCard>
    </AuthPageShell>
  );
}
