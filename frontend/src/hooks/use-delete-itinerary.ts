"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/components/shared/toast-provider";

type DeleteItineraryResponse = {
  action: string;
  target_ids: string[];
  confirmation_message: string;
};

export function useDeleteItinerary(options?: {
  onDeleted?: (id: string) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) =>
      api<DeleteItineraryResponse>(`/itinerary/${id}`, { method: "DELETE" }),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["my-itineraries"] });
      queryClient.removeQueries({ queryKey: ["itinerary", id] });
      toast({
        title: "Trip removed",
        description: data.confirmation_message,
        variant: "success",
      });
      options?.onDeleted?.(id);
    },
    onError: (err: Error) => {
      toast({
        title: "Could not delete trip",
        description: err.message,
        variant: "error",
      });
    },
  });
}

export function confirmDeleteItinerary(destination: string, country: string): boolean {
  return window.confirm(
    `Delete your trip to ${destination}, ${country}? This cannot be undone.`
  );
}
