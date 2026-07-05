"use client";

import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  confirmDeleteItinerary,
  useDeleteItinerary,
} from "@/hooks/use-delete-itinerary";

export type ItinerarySummary = {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate?: string;
  totalCost?: number | string | null;
};

export function ItineraryCard({
  itinerary,
  onDeleted,
}: {
  itinerary: ItinerarySummary;
  onDeleted?: (id: string) => void;
}) {
  const deleteMutation = useDeleteItinerary({ onDeleted });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (deleteMutation.isPending) return;
    if (
      !confirmDeleteItinerary(itinerary.destination, itinerary.country)
    ) {
      return;
    }
    deleteMutation.mutate(itinerary.id);
  };

  return (
    <GlassCard className="p-6 relative group">
      <Link href={`/planner?id=${itinerary.id}`} className="block pr-10">
        <Badge variant="primary">AI Generated</Badge>
        <p className="mt-3 font-display font-semibold text-lg">
          {itinerary.destination}, {itinerary.country}
        </p>
        <p className="text-sm text-muted mt-1">
          {formatDate(itinerary.startDate)}
          {itinerary.endDate ? ` → ${formatDate(itinerary.endDate)}` : ""}
        </p>
        {itinerary.totalCost != null && Number(itinerary.totalCost) > 0 && (
          <p className="mt-2 text-sm font-semibold text-secondary-500">
            Est. {formatCurrency(Number(itinerary.totalCost))}
          </p>
        )}
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label={`Delete trip to ${itinerary.destination}`}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </GlassCard>
  );
}
