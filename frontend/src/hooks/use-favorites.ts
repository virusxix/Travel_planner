"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Property } from "@/types";

export function useFavorites() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: favoriteIds = [], isLoading: idsLoading } = useQuery({
    queryKey: ["favorite-ids"],
    queryFn: () => api<string[]>("/favorites/ids"),
    enabled: !!user,
  });

  const { data: savedProperties = [], isLoading: listLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api<Property[]>("/favorites"),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (propertyId: string) =>
      api(`/favorites/${propertyId}`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite-ids"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (propertyId: string) =>
      api(`/favorites/${propertyId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite-ids"] });
    },
  });

  function isFavorite(propertyId: string) {
    return favoriteIds.includes(propertyId);
  }

  function toggleFavorite(propertyId: string) {
    if (!user) return false;
    if (isFavorite(propertyId)) {
      removeMutation.mutate(propertyId);
    } else {
      addMutation.mutate(propertyId);
    }
    return true;
  }

  return {
    favoriteIds,
    savedProperties,
    isLoading: idsLoading || listLoading,
    isFavorite,
    toggleFavorite,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
