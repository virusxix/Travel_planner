import { prisma } from "../lib/prisma.js";
import {
  gemini,
  GEMINI_MODELS,
  GROQ_MODEL,
  OPENAI_MODEL,
  getAiProvider,
  getProviderFallbackOrder,
  callGroqChat,
  callOpenAiChat,
  type AiProviderName,
} from "../lib/ai-providers.js";
import { formatAiQuotaHelp } from "./ai.service.js";
import {
  resolveDeleteItinerary,
  executeDeleteItinerary,
  type DeleteItineraryAction,
} from "./itinerary-coordinator.service.js";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

const TRAVEL_SYSTEM = `You are HiddenStay's AI travel assistant. Help users plan trips, refine itineraries, suggest restaurants, activities, transport, and local tips. Be concise, practical, and friendly. Use bullet points when listing options. If you lack live data, say so and give sensible general advice. Do not invent specific booking URLs or prices unless the user provided them.`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|404|503|quota|not found/i.test(msg);
}

async function buildItineraryContext(userId: string, itineraryId?: string): Promise<string> {
  if (!itineraryId) return "";

  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: { activities: { orderBy: { time: "asc" } } },
      },
    },
  });

  if (!itinerary) return "";

  const days = itinerary.days
    .map((d) => {
      const acts = d.activities
        .map((a) => `  - ${a.time ?? "?"} ${a.title}${a.location ? ` (${a.location})` : ""}`)
        .join("\n");
      return `Day ${d.dayNumber}: ${d.title}\n${acts}`;
    })
    .join("\n\n");

  return `\n\nActive trip context:\nDestination: ${itinerary.destination}, ${itinerary.country}\nDates: ${itinerary.startDate} to ${itinerary.endDate}\nTravelers: ${itinerary.travelers}, Budget: ${itinerary.budget}\nSummary: ${itinerary.summary ?? "—"}\n\n${days}`;
}

async function chatWithGemini(
  system: string,
  history: ChatMessage[],
  message: string
): Promise<{ reply: string; model: string }> {
  if (!gemini) throw new Error("Gemini is not configured");

  const contents = [
    ...history.slice(-16).map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  let lastError: unknown;
  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await sleep(2000);
        const model = gemini.getGenerativeModel({
          model: modelName,
          systemInstruction: system,
        });
        const result = await model.generateContent({ contents });
        const reply = result.response.text()?.trim();
        if (reply) return { reply, model: modelName };
        break;
      } catch (e) {
        lastError = e;
        if (isRetryable(e) && attempt === 0) continue;
        break;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini chat failed");
}

async function chatWithProvider(
  provider: AiProviderName,
  system: string,
  history: ChatMessage[],
  message: string
): Promise<{ reply: string; model: string; provider: AiProviderName }> {
  if (provider === "gemini") {
    const result = await chatWithGemini(system, history, message);
    return { ...result, provider: "gemini" };
  }
  if (provider === "groq") {
    const reply = await callGroqChat(system, history, message);
    if (!reply) throw new Error("Empty Groq response");
    return { reply, model: GROQ_MODEL, provider: "groq" };
  }
  const reply = await callOpenAiChat(system, history, message);
  if (!reply) throw new Error("Empty OpenAI response");
  return { reply, model: OPENAI_MODEL, provider: "openai" };
}

export async function sendTravelChat(input: {
  userId: string;
  message: string;
  history?: ChatMessage[];
  itineraryId?: string;
}): Promise<{
  reply: string;
  model: string;
  provider: string;
  coordinatorAction?: DeleteItineraryAction | null;
}> {
  const coordinator = await resolveDeleteItinerary({
    userId: input.userId,
    userRequest: input.message,
    activeItineraryId: input.itineraryId,
  });

  if (coordinator.type === "clarify") {
    return {
      reply: coordinator.message,
      model: "coordinator",
      provider: "coordinator",
      coordinatorAction: null,
    };
  }

  if (coordinator.type === "execute") {
    const deleted = await executeDeleteItinerary(
      input.userId,
      coordinator.payload.target_ids
    );
    if (deleted === 0) {
      return {
        reply:
          "I couldn't delete that itinerary — it may have already been removed. Refresh your trip list.",
        model: "coordinator",
        provider: "coordinator",
        coordinatorAction: null,
      };
    }
    return {
      reply: coordinator.payload.confirmation_message,
      model: "coordinator",
      provider: "coordinator",
      coordinatorAction: coordinator.payload,
    };
  }

  if (!getAiProvider()) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY to backend/.env (https://console.groq.com/keys)"
    );
  }

  const context = await buildItineraryContext(input.userId, input.itineraryId);
  const system = TRAVEL_SYSTEM + context;
  const history = input.history ?? [];

  let lastError: unknown;
  for (const provider of getProviderFallbackOrder()) {
    try {
      const result = await chatWithProvider(provider, system, history, input.message);
      return { ...result, coordinatorAction: null };
    } catch (e) {
      lastError = e;
      console.warn(`${provider} chat failed:`, e instanceof Error ? e.message : e);
    }
  }

  throw new Error(formatAiQuotaHelp(lastError));
}
