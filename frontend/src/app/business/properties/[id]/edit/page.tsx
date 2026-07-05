"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { PropertyForm, propertyToForm, type PropertyFormValues } from "@/components/business/property-form";
import { useToast } from "@/components/shared/toast-provider";
import { findDemoProperty } from "@/lib/business-demo";
import type { Property } from "@/types";

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const demoProperty = findDemoProperty(id);

  const { data: fetchedProperty, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => api<Property>(`/properties/${id}`),
    enabled: !demoProperty,
  });

  const property = fetchedProperty ?? demoProperty;
  const isDemoProperty = !fetchedProperty && !!demoProperty;

  const mutation = useMutation({
    mutationFn: (body: PropertyFormValues) =>
      api(`/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...body,
          amenityIds: body.amenityIds,
          imageUrls: body.imageUrls.length ? body.imageUrls : undefined,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast({ title: "Property updated", variant: "success" });
      router.push(`/business/properties/${id}`);
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "error" }),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-surface p-8"><div className="h-96 max-w-2xl mx-auto rounded-2xl bg-slate-200 animate-pulse" /></div>;
  }

  if (!property) return <div className="p-8 text-center">Not found</div>;

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/business/properties/${id}`} className="inline-flex items-center gap-2 text-sm text-violet-400 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-display text-2xl font-bold mb-6">Edit property</h1>
        {isDemoProperty && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span className="font-semibold">Demo listing</span> — this is example data. Connect a real property to edit and save changes.
          </div>
        )}
        <PropertyForm
          initial={propertyToForm(property)}
          submitLabel="Save changes"
          loading={mutation.isPending}
          onSubmit={(v) => {
            if (isDemoProperty) {
              toast({ title: "Demo listing", description: "Connect a real property to edit.", variant: "info" });
              return;
            }
            mutation.mutate(v);
          }}
        />
      </div>
    </div>
  );
}
