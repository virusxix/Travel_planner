"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { DemoAccounts } from "@/components/auth/demo-accounts";
import { storeDemoAuthPrefill } from "@/lib/demo-auth-prefill";
import { useAuthStore } from "@/stores/auth";

function RegisterForm() {
  const params = useSearchParams();
  const isOwner = params.get("role") === "owner";
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: isOwner ? "BUSINESS_OWNER" : "TRAVELER",
    businessName: "",
  });
  const [error, setError] = useState("");
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      router.push(isOwner ? "/business" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  function tryDemo(nextEmail: string, nextPassword: string) {
    storeDemoAuthPrefill(nextEmail, nextPassword);
    router.push("/login");
  }

  return (
    <GlassCard hover={false} className="p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First name">
            <Input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Last name">
            <Input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </FormField>
        </div>
        <FormField label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </FormField>
        <FormField label="Password" hint="Minimum 8 characters">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </FormField>
        {isOwner && (
          <FormField label="Business name">
            <Input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              required
            />
          </FormField>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="h-12 w-full rounded-2xl">
          Create account
        </Button>
      </form>

      <div className="mt-6">
        <DemoAccounts
          onSelect={tryDemo}
          compact
          hint="Prefer to explore first? Jump to sign in with a demo account."
        />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Already have an account?
        </Link>
      </p>
    </GlassCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const params = useSearchParams();
  const isOwner = params.get("role") === "owner";

  return (
    <AuthPageShell
      title={isOwner ? "Become a host" : "Join HiddenStay AI"}
      subtitle={
        isOwner
          ? "List your property with only 5% commission"
          : "Discover authentic stays across Asia"
      }
      variant={isOwner ? "owner" : "traveler"}
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
