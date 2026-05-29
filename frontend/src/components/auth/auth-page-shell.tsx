"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
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
    <div className="min-h-screen y-hero-bg px-4 py-10 lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr] xl:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-stretch"
        >
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_4px_14px_rgba(29,133,228,0.4)]">
              <Compass className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-muted">{subtitle}</p>
          </div>
          {children}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="min-h-[640px]"
        >
          <AuthShowcase variant={variant} />
        </motion.div>
      </div>
    </div>
  );
}
