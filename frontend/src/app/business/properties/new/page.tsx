"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { PropertyForm, type PropertyFormValues } from "@/components/business/property-form";
import { useToast } from "@/components/shared/toast-provider";
import type { Property } from "@/types";

export default function NewPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (body: PropertyFormValues) =>
      api<Property>("/properties", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (p) => {
      toast({ title: "Property created", description: "Add at least one room, then submit for review.", variant: "success" });
      router.push(`/business/properties/${p.id}`);
    },
    onError: (e: Error) => {
      toast({ title: "Failed to create", description: e.message, variant: "error" });
    },
  });

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/business/properties" className="inline-flex items-center gap-2 text-sm text-violet-400 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to properties
        </Link>
        <h1 className="font-display text-2xl font-bold">Create property</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Clock className="h-4 w-4" /> Takes about 10 minutes
        </p>

        <ol className="my-6 flex items-center gap-2 text-xs">
          {[
            { n: 1, label: "Property details", active: true },
            { n: 2, label: "Add rooms" },
            { n: 3, label: "Submit for review" },
          ].map((s, i) => (
            <li key={s.n} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
                  s.active ? "bg-teal-500 text-white" : "bg-white/10 text-white/50"
                }`}
              >
                {s.n}
              </span>
              <span className={s.active ? "font-medium text-white" : "text-white/50"}>{s.label}</span>
              {i < 2 && <span className="mx-1 h-px w-6 bg-white/15" />}
            </li>
          ))}
        </ol>

        <PropertyForm
          submitLabel="Create property"
          loading={mutation.isPending}
          onSubmit={(v) => mutation.mutate(v)}
        />
      </div>
    </div>
  );
}
