"use client";

import { useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Map as MapIcon,
  Plus,
  Sparkles,
  RefreshCw,
  Share2,
  MessageCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { ItineraryMap } from "@/components/maps/itinerary-map";
import {
  getDayActivities,
  mapStopsFromActivities,
  hasEnoughStopsForRoute,
} from "@/lib/itinerary-stops";
import { useGeocodedCenter } from "@/hooks/use-geocoded-center";
import { useEnrichItineraryPlaces } from "@/hooks/use-enrich-itinerary-places";
import { useGeneratePhase } from "@/hooks/use-generate-phase";
import { formatCurrency } from "@/lib/utils";
import type { Itinerary } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/shared/toast-provider";
import {
  confirmDeleteItinerary,
  useDeleteItinerary,
} from "@/hooks/use-delete-itinerary";
import { BackButton } from "@/components/layout/back-button";
import { PlannerBottomNav } from "@/components/planner/planner-bottom-nav";
import { PlannerChatPanel } from "@/components/planner/planner-chat-panel";
import { PlannerVenueCard } from "@/components/planner/planner-venue-card";
import { PlannerDayTimeline } from "@/components/planner/planner-day-timeline";
import { ExploreMapSheet } from "@/components/planner/explore-map-sheet";

const INPUT = "input-light";

function PlannerContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const itineraryId = params.get("id");
  const view = params.get("view");
  const isChatView = view === "chat";
  const [expandedDay, setExpandedDay] = useState(1);

  const chatHref = itineraryId
    ? `/planner?view=chat&id=${itineraryId}`
    : "/planner?view=chat";

  const [form, setForm] = useState({
    destination: "Paris",
    country: "France",
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    travelers: 2,
    budget: 1200,
    interests: "museums, food, landmarks, cafes",
  });

  const { data: saved } = useQuery({
    queryKey: ["itinerary", itineraryId],
    queryFn: () => api<Itinerary>(`/itinerary/${itineraryId}`),
    enabled: !!itineraryId && !!user,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      api<{
        itinerary: Itinerary;
        generationMode?: "ai" | "demo";
        model?: string;
        fallbackReason?: string;
      }>("/itinerary/generate", {
        method: "POST",
        body: JSON.stringify({
          destination: form.destination,
          country: form.country,
          startDate: form.startDate,
          endDate: form.endDate,
          interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
          budget: Number(form.budget) || 800,
          travelers: Number(form.travelers) || 2,
        }),
      }),
    onSuccess: (data) => {
      const id = data.itinerary?.id;
      if (!id) return;
      queryClient.setQueryData(["itinerary", id], data.itinerary);
      toast({
        title: data.generationMode === "ai" ? "Trip ready" : "Demo itinerary",
        description:
          data.generationMode === "ai"
            ? `Built with ${data.model ?? "AI"}. Explore on the map.`
            : data.fallbackReason?.slice(0, 100),
        variant: data.generationMode === "ai" ? "success" : "error",
      });
      router.push(`/planner?id=${id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Generation failed", description: err.message, variant: "error" });
    },
  });

  const displayItinerary = saved ?? generateMutation.data?.itinerary;
  const generatePhase = useGeneratePhase(generateMutation.isPending);

  const deleteItineraryMutation = useDeleteItinerary({
    onDeleted: (id) => {
      if (itineraryId === id) router.push("/planner");
    },
  });

  useEnrichItineraryPlaces(displayItinerary, (updated) => {
    if (updated.id) queryClient.setQueryData(["itinerary", updated.id], updated);
  });

  const regenerateDayMutation = useMutation({
    mutationFn: (dayNumber: number) => {
      if (!displayItinerary?.id) throw new Error("No itinerary");
      return api<{ itinerary: Itinerary }>(
        `/itinerary/${displayItinerary.id}/days/${dayNumber}/regenerate`,
        { method: "POST" }
      );
    },
    onSuccess: (data) => {
      const id = displayItinerary?.id;
      if (id && data.itinerary) {
        queryClient.setQueryData(["itinerary", id], data.itinerary);
        toast({ title: "Day updated", variant: "success" });
      }
    },
  });

  const mapDestination = displayItinerary?.destination ?? form.destination;
  const mapCountry = displayItinerary?.country ?? form.country;
  const center = useGeocodedCenter(mapDestination, mapCountry);

  const dayActivities = useMemo(
    () => getDayActivities(displayItinerary, expandedDay),
    [displayItinerary, expandedDay]
  );

  const mapStops = useMemo(
    () => mapStopsFromActivities(dayActivities ?? [], center),
    [dayActivities, center]
  );

  const mapOrderById = useMemo(() => {
    const m = new Map<string, number>();
    mapStops.forEach((s) => m.set(s.id, s.order));
    return m;
  }, [mapStops]);

  const exploreVenues = useMemo(
    () =>
      (dayActivities ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        imageUrl: a.imageUrl,
        category: a.category,
        mapOrder: mapOrderById.get(a.id),
      })),
    [dayActivities, mapOrderById]
  );

  const totalCost = displayItinerary?.totalCost
    ? Number(displayItinerary.totalCost)
    : form.budget * 0.85;

  if (!user) {
    return (
      <div className="flex flex-1 flex-col min-h-0 bg-slate-50">
        <div className="flex-1 flex flex-col items-center justify-center p-8 hero-mesh">
          <Sparkles className="h-12 w-12 text-brand-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Plan with AI</h2>
          <p className="mt-2 text-slate-600 text-sm text-center max-w-xs">
            Sign in for AI itineraries, maps, and venue picks.
          </p>
          <Link
            href="/login"
            className="mt-8 h-12 px-10 flex items-center rounded-2xl gradient-btn text-white font-semibold text-sm"
          >
            Log in
          </Link>
        </div>
        <PlannerBottomNav active="chat" />
      </div>
    );
  }

  if (isChatView) {
    return (
      <div className="flex flex-1 flex-col min-h-0 bg-slate-50 overflow-hidden">
        <PlannerChatPanel
          userId={user.id}
          itinerary={displayItinerary ?? null}
          onItineraryDeleted={(action) => {
            action.target_ids.forEach((id) => {
              queryClient.removeQueries({ queryKey: ["itinerary", id] });
            });
            queryClient.invalidateQueries({ queryKey: ["my-itineraries"] });
            toast({
              title: "Trip removed",
              description: action.confirmation_message,
              variant: "success",
            });
            router.push("/planner");
          }}
        />
        <PlannerBottomNav active="chat" itineraryId={itineraryId} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-slate-50 overflow-hidden">
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Map — top on mobile, right on desktop */}
        <section className="relative order-1 h-[min(58vh,520px)] lg:h-auto lg:flex-[1.2] lg:min-w-0 shrink-0 p-3 lg:p-4 bg-[#0a1622]/70 backdrop-blur-xl">
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <ItineraryMap
              center={center}
              stops={mapStops}
              variant="explore"
              routeDuration={
                hasEnoughStopsForRoute(mapStops) ? "Calculating…" : "—"
              }
            />
            {displayItinerary && (
              <ExploreMapSheet
                venues={exploreVenues}
                destination={displayItinerary.destination}
              />
            )}
          </div>
        </section>

        {/* Itinerary panel */}
        <aside className="flex flex-col flex-1 lg:flex-none lg:w-[42%] min-h-0 order-2 bg-[#0a1622]/70 backdrop-blur-xl">
          <header className="shrink-0 flex items-center justify-between px-4 py-3">
            <BackButton
              className="!p-0 !border-0 !bg-transparent hover:!bg-white/10 h-9 w-9 justify-center rounded-xl"
              label=""
            />
            <div className="flex items-center gap-2">
              <Link href={chatHref} className="icon-btn-glass" aria-label="AI Chat">
                <MessageCircle className="h-4 w-4 text-slate-700" />
              </Link>
              <button type="button" className="icon-btn-glass" aria-label="Map">
                <MapIcon className="h-4 w-4 text-slate-700" />
              </button>
              <button type="button" className="icon-btn-glass" aria-label="Add">
                <Plus className="h-4 w-4 text-slate-700" />
              </button>
              <button type="button" className="icon-btn-glass" aria-label="Document">
                <FileText className="h-4 w-4 text-slate-700" />
              </button>
              {displayItinerary && (
                <>
                  <button
                    type="button"
                    className="icon-btn-glass hover:text-red-600 hover:border-red-200"
                    aria-label="Delete trip"
                    disabled={deleteItineraryMutation.isPending}
                    onClick={() => {
                      if (
                        !confirmDeleteItinerary(
                          displayItinerary.destination,
                          displayItinerary.country
                        )
                      ) {
                        return;
                      }
                      deleteItineraryMutation.mutate(displayItinerary.id);
                    }}
                  >
                    {deleteItineraryMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                  <button type="button" className="icon-btn-glass" aria-label="Share">
                    <Share2 className="h-4 w-4 text-slate-700" />
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
            {!displayItinerary ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">New trip</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    AI builds your days — explore them on the map.
                  </p>
                </div>
                <input
                  className={INPUT}
                  placeholder="Destination"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                />
                <input
                  className={INPUT}
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className={INPUT}
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                  <input
                    type="date"
                    className={INPUT}
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    className={INPUT}
                    value={form.travelers}
                    onChange={(e) =>
                      setForm({ ...form, travelers: parseInt(e.target.value, 10) })
                    }
                  />
                  <input
                    type="number"
                    className={INPUT}
                    placeholder="Budget"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: parseInt(e.target.value, 10) })
                    }
                  />
                </div>
                <textarea
                  className={cn(INPUT, "min-h-[80px] resize-none")}
                  placeholder="Interests"
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                />
                {generateMutation.isPending && (
                  <p className="text-xs text-slate-500 animate-pulse">{generatePhase}</p>
                )}
                {generateMutation.isError && (
                  <p className="text-xs text-red-600">{generateMutation.error?.message}</p>
                )}
                <button
                  type="button"
                  disabled={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                  className="w-full h-12 rounded-2xl gradient-btn text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles
                    className={cn("h-5 w-5", generateMutation.isPending && "animate-pulse")}
                  />
                  {generateMutation.isPending ? "Planning…" : "Generate itinerary"}
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider">
                    {displayItinerary.country}
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900 mt-1">
                    {displayItinerary.destination}
                    <span className="text-slate-500 font-normal text-lg">
                      {" "}
                      · {displayItinerary.days?.length ?? 0} days
                    </span>
                  </h1>
                  <p className="text-sm text-brand-600 font-semibold mt-1">
                    {formatCurrency(totalCost)} est.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
                  {displayItinerary.days?.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setExpandedDay(day.dayNumber)}
                      className={cn(
                        "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all",
                        expandedDay === day.dayNumber
                          ? "pill-active"
                          : "pill-inactive"
                      )}
                    >
                      Day {day.dayNumber}
                    </button>
                  ))}
                </div>

                {displayItinerary.days
                  ?.filter((d) => d.dayNumber === expandedDay)
                  .map((day) => (
                    <div key={day.id}>
                      <PlannerDayTimeline
                        dayNumber={day.dayNumber}
                        title={day.title}
                        activities={dayActivities ?? []}
                        mapOrderById={mapOrderById}
                      />

                      {(dayActivities ?? []).length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-bold text-slate-900 mb-3">Places</h3>
                          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                            {(dayActivities ?? []).map((a) => (
                              <PlannerVenueCard
                                key={a.id}
                                title={a.title}
                                imageUrl={a.imageUrl}
                                mapOrder={mapOrderById.get(a.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={regenerateDayMutation.isPending}
                        onClick={() => regenerateDayMutation.mutate(day.dayNumber)}
                        className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 mb-6"
                      >
                        <RefreshCw
                          className={cn(
                            "h-3 w-3",
                            regenerateDayMutation.isPending && "animate-spin"
                          )}
                        />
                        Regenerate day
                      </button>
                    </div>
                  ))}
              </>
            )}
          </div>

          {displayItinerary && (
            <div className="shrink-0 p-4">
              <Link
                href={chatHref}
                className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl gradient-btn text-white text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with AI about this trip
              </Link>
            </div>
          )}
        </aside>
      </main>

      <PlannerBottomNav active="trips" itineraryId={itineraryId} />
    </div>
  );
}

function PlannerLoading() {
  return (
    <div className="flex flex-1 min-h-[50vh] bg-slate-50 flex items-center justify-center">
      <p className="text-slate-600 text-sm">Loading…</p>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<PlannerLoading />}>
      <PlannerContent />
    </Suspense>
  );
}
