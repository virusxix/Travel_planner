import { prisma } from "../lib/prisma.js";

export type ItineraryListItem = {
  id: string;
  destination: string;
  country: string;
  startDate: Date;
  endDate: Date;
};

export type DeleteItineraryAction = {
  action: "DELETE_ITINERARY";
  target_ids: string[];
  confirmation_message: string;
};

export type CoordinatorResult =
  | { type: "not_delete" }
  | { type: "clarify"; message: string }
  | { type: "execute"; payload: DeleteItineraryAction };

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const DELETE_INTENT_RE =
  /\b(delete|remove|cancel|discard|clear|drop)\b.*\b(trip|itinerary|plan|travel\s*plan)\b|\b(delete|remove)\b.*\b(my\s+)?(trip|itinerary)\b/i;

const THIS_TRIP_RE =
  /\b(this|current|active)\s+(trip|itinerary|plan)\b/i;

function formatTripDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTripLabel(t: ItineraryListItem): string {
  const start = formatTripDate(t.startDate);
  const end = formatTripDate(t.endDate);
  const range = start === end ? start : `${start} – ${end}`;
  return `${t.destination}, ${t.country} (${range}) — ID ${t.id}`;
}

function confirmationMessage(t: ItineraryListItem): string {
  const start = formatTripDate(t.startDate);
  return `Successfully removed your trip to ${t.destination}, ${t.country} on ${start}.`;
}

export function isDeleteItineraryIntent(message: string): boolean {
  return DELETE_INTENT_RE.test(message.trim());
}

function extractUuid(message: string): string | null {
  const m = message.match(UUID_RE);
  return m ? m[0].toLowerCase() : null;
}

function normalizePlaceToken(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull likely city/destination tokens from free text after delete verbs */
function extractPlaceQuery(message: string): string | null {
  const patterns = [
    /\b(?:trip|itinerary|plan)\s+(?:to|in|for)\s+([a-z][a-z\s'-]{1,40})/i,
    /\b(?:delete|remove|cancel)\s+(?:my\s+)?(?:trip\s+)?(?:to|in)?\s*([a-z][a-z\s'-]{1,40})/i,
    /\b([a-z][a-z\s'-]{2,40})\s+trip\b/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m?.[1]) {
      const q = normalizePlaceToken(m[1]);
      const stop = new Set([
        "my",
        "the",
        "this",
        "trip",
        "itinerary",
        "plan",
        "delete",
        "remove",
        "cancel",
      ]);
      const words = q.split(" ").filter((w) => !stop.has(w));
      if (words.length) return words.join(" ");
    }
  }
  return null;
}

function matchesPlace(it: ItineraryListItem, query: string): boolean {
  const q = normalizePlaceToken(query);
  const dest = normalizePlaceToken(it.destination);
  const country = normalizePlaceToken(it.country);
  return dest.includes(q) || q.includes(dest) || country.includes(q);
}

export async function listUserItineraries(userId: string): Promise<ItineraryListItem[]> {
  return prisma.itinerary.findMany({
    where: { userId },
    select: {
      id: true,
      destination: true,
      country: true,
      startDate: true,
      endDate: true,
    },
    orderBy: { startDate: "desc" },
  });
}

/**
 * Database coordinator: resolve delete intent → clarify, execute JSON, or not a delete.
 */
export async function resolveDeleteItinerary(input: {
  userId: string;
  userRequest: string;
  activeItineraryId?: string;
}): Promise<CoordinatorResult> {
  const message = input.userRequest.trim();
  if (!isDeleteItineraryIntent(message)) {
    return { type: "not_delete" };
  }

  const itineraries = await listUserItineraries(input.userId);
  if (itineraries.length === 0) {
    return {
      type: "clarify",
      message:
        "You don't have any saved itineraries to delete. Generate a trip first from the planner.",
    };
  }

  const byId = new Map(itineraries.map((t) => [t.id, t]));

  const explicitId = extractUuid(message);
  if (explicitId) {
    const hit = byId.get(explicitId);
    if (!hit) {
      return {
        type: "clarify",
        message: `I couldn't find an itinerary with ID ${explicitId}. Check your trip list and try again.`,
      };
    }
    return {
      type: "execute",
      payload: {
        action: "DELETE_ITINERARY",
        target_ids: [hit.id],
        confirmation_message: confirmationMessage(hit),
      },
    };
  }

  if (THIS_TRIP_RE.test(message) && input.activeItineraryId) {
    const hit = byId.get(input.activeItineraryId);
    if (hit) {
      return {
        type: "execute",
        payload: {
          action: "DELETE_ITINERARY",
          target_ids: [hit.id],
          confirmation_message: confirmationMessage(hit),
        },
      };
    }
  }

  const placeQuery = extractPlaceQuery(message);
  if (placeQuery) {
    const matches = itineraries.filter((t) => matchesPlace(t, placeQuery));
    if (matches.length === 1) {
      const hit = matches[0];
      return {
        type: "execute",
        payload: {
          action: "DELETE_ITINERARY",
          target_ids: [hit.id],
          confirmation_message: confirmationMessage(hit),
        },
      };
    }
    if (matches.length > 1) {
      const lines = matches.map((t) => `• ${formatTripLabel(t)}`).join("\n");
      return {
        type: "clarify",
        message: `You have ${matches.length} trips matching "${placeQuery}". Which one should I delete?\n\n${lines}\n\nReply with the full ID or the exact dates.`,
      };
    }
  }

  if (input.activeItineraryId && byId.has(input.activeItineraryId)) {
    const onlyActive = itineraries.length === 1;
    if (onlyActive) {
      const hit = byId.get(input.activeItineraryId)!;
      return {
        type: "execute",
        payload: {
          action: "DELETE_ITINERARY",
          target_ids: [hit.id],
          confirmation_message: confirmationMessage(hit),
        },
      };
    }
  }

  if (itineraries.length === 1) {
    const hit = itineraries[0];
    return {
      type: "execute",
      payload: {
        action: "DELETE_ITINERARY",
        target_ids: [hit.id],
        confirmation_message: confirmationMessage(hit),
      },
    };
  }

  const lines = itineraries.map((t) => `• ${formatTripLabel(t)}`).join("\n");
  return {
    type: "clarify",
    message: `Which itinerary should I delete? You have ${itineraries.length} saved trips:\n\n${lines}\n\nReply with the destination and dates, or paste the trip ID.`,
  };
}

export async function executeDeleteItinerary(
  userId: string,
  targetIds: string[]
): Promise<number> {
  const result = await prisma.itinerary.deleteMany({
    where: { userId, id: { in: targetIds } },
  });
  return result.count;
}

export const ITINERARY_COORDINATOR_SYSTEM = `You are the database coordinator assistant for HiddenStay AI. Process user requests to delete itineraries.

When the user wants to delete a trip:
1. Match against their Active Itineraries List (id, destination, country, dates).
2. If ambiguous (multiple trips to the same city), ask which date or ID they mean — do not guess.
3. If clear, output ONLY valid JSON:
{"action":"DELETE_ITINERARY","target_ids":["<uuid>"],"confirmation_message":"Successfully removed your trip to <city>, <country> on <date>."}

For non-delete messages, respond normally as a travel assistant.`;
