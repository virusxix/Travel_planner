"use client";

import { AuthShowcase } from "@/components/auth/auth-showcase";

export function AuthPageShell({
  title,
  subtitle,
  variant = "traveler",
  children,
}: {
  title: string;
  subtitle: string;
  variant?: "traveler" | "owner";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 px-4 py-10 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,400px)_1fr] xl:gap-16">
        <div className="w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-stretch">
          <div className="mb-8">
            <LinkWordmark />
            <h1 className="font-display text-2xl font-semibold text-stone-900 sm:text-3xl mt-6">
              {title}
            </h1>
            <p className="mt-2 text-stone-500">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="hidden lg:block min-h-[560px] sticky top-24">
          <AuthShowcase variant={variant} />
        </div>
      </div>
    </div>
  );
}

function LinkWordmark() {
  return (
    <a href="/" className="font-display text-lg font-semibold text-stone-900">
      HiddenStay
    </a>
  );
}
