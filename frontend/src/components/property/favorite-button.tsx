"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  propertyId,
  className,
  size = "md",
}: {
  propertyId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite, isPending } = useFavorites();
  const saved = isFavorite(propertyId);

  return (
    <button
      type="button"
      disabled={isPending}
      className={cn(
        "icon-btn-glass",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        saved && "text-pink-500",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          router.push("/login");
          return;
        }
        toggleFavorite(propertyId);
      }}
      aria-label={saved ? "Remove from saved" : "Save property"}
    >
      <Heart className={cn("h-3.5 w-3.5", saved && "fill-current")} />
    </button>
  );
}
