import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import {
  gemini,
  GEMINI_MODELS,
  GROQ_MODEL,
  OPENAI_MODEL,
  getAiProvider,
  getProviderFallbackOrder,
  callGroqJson,
  callOpenAiJson,
  type AiProviderName,
} from "../lib/ai-providers.js";
import {
  enrichItineraryActivities,
  isServerPlacesEnrichmentEnabled,
} from "./places.service.js";

export { getAiProvider, isAiEnabled } from "../lib/ai-providers.js";

export function getGeminiModels(): string[] {
  return GEMINI_MODELS;
}

export function isOpenAiEnabled(): boolean {
  return getAiProvider() === "openai";
}

export interface ItineraryInput {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number;
  interests: string[];
}

type ActivityPayload = {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  category: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  placeId?: string;
};

type DayPayload = {
  dayNumber: number;
  title: string;
  description: string;
  activities: ActivityPayload[];
};

type ItineraryPayload = {
  summary: string;
  totalCost: number;
  days: DayPayload[];
  hotelRecommendations: string[];
};

export type AiGenerationMeta = {
  aiPowered: boolean;
  provider: AiProviderName | null;
  model?: string;
  generationMode: "ai" | "demo";
  fallbackReason?: string;
};

const SYSTEM_PROMPT = `You are HiddenStay AI, an expert travel planner.
Return valid JSON only (no markdown) with this exact structure:
{
  "summary": "string",
  "totalCost": number,
  "hotelRecommendations": ["real hotel or guesthouse names in the destination"],
  "days": [{
    "dayNumber": number,
    "title": "string",
    "description": "string",
    "activities": [{
      "time": "HH:MM",
      "title": "official venue or attraction name",
      "description": "what to do there (2 sentences max)",
      "location": "full street address or landmark plus neighborhood, city",
      "cost": number,
      "category": "food|culture|experience|attraction|transport"
    }]
  }]
}
Rules:
- Every activity MUST use a real, searchable business or landmark in the given destination and country (no generic labels like "morning market" or "artisan quarter").
- "location" must include city and country so maps can find it.
- Costs in USD, realistic for the budget.
- 3–5 activities per day, chronological times.
- Prefer local food, culture, and small businesses over chains.`;

function activityCreateData(a: ActivityPayload) {
  return {
    time: a.time,
    title: a.title,
    description: a.description,
    location: a.location,
    cost: a.cost,
    category: a.category,
    latitude: a.latitude ?? null,
    longitude: a.longitude ?? null,
    imageUrl: a.imageUrl ?? null,
    placeId: a.placeId ?? null,
  };
}

async function enrichPayload(
  payload: ItineraryPayload,
  input: ItineraryInput
): Promise<ItineraryPayload> {
  const days = await Promise.all(
    payload.days.map(async (day) => {
      const activities = await enrichItineraryActivities(
        day.activities,
        input.destination,
        input.country
      );
      return { ...day, activities };
    })
  );
  return { ...payload, days };
}

const DEMO_ITINERARY = (input: ItineraryInput): ItineraryPayload => ({
  summary: `[Demo template] Discover ${input.destination} — enable Gemini or fix API quota for AI-generated plans.`,
  totalCost: Math.min(input.budget * 0.85, input.budget),
  days: buildDemoDays(input),
  hotelRecommendations: [
    "Riverside Homestay — family-run, 5% commission friendly",
    "Bamboo Guesthouse — eco-lodge near old town",
    "Lantern Boutique Inn — hidden alley, local breakfast",
  ],
});

function buildDemoDays(input: ItineraryInput): DayPayload[] {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const days: DayPayload[] = [];

  for (let i = 0; i < dayCount; i++) {
    days.push({
      dayNumber: i + 1,
      title: `Day ${i + 1}: ${i === 0 ? "Arrival & Old Town" : i === dayCount - 1 ? "Farewell & Markets" : "Hidden Gems Explorer"}`,
      description: `Explore ${input.destination} through local experiences.`,
      activities: [
        {
          time: "09:00",
          title: "Local breakfast at morning market",
          description: "Try regional specialties with vendors who've served locals for decades.",
          location: `${input.destination} Morning Market`,
          cost: 8,
          category: "food",
        },
        {
          time: "11:00",
          title: "Community craft workshop",
          description: "Hands-on session with artisans — supports small businesses.",
          location: "Artisan Quarter",
          cost: 25,
          category: "experience",
        },
        {
          time: "14:00",
          title: "Hidden temple / cultural site",
          description: "Lesser-known site away from tourist buses.",
          location: "East District",
          cost: 5,
          category: "culture",
        },
        {
          time: "19:00",
          title: "Family-run restaurant dinner",
          description: "Seasonal menu, no chain restaurants.",
          location: "Lantern Street",
          cost: 20,
          category: "food",
        },
      ],
    });
  }
  return days;
}

function parseJsonContent<T>(content: string): T {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(raw) as T;
}

function geminiErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isRetryableGeminiError(err: unknown): boolean {
  const msg = geminiErrorMessage(err);
  return /429|404|503|quota|not found|Too Many Requests/i.test(msg);
}

export function formatAiQuotaHelp(err?: unknown): string {
  const msg = err ? geminiErrorMessage(err) : "";
  const isQuota = /429|quota|Too Many Requests/i.test(msg);
  if (isQuota) {
    return (
      "AI quota/rate limit hit. Use GROQ_API_KEY (https://console.groq.com) with AI_PROVIDER=groq, " +
      "or wait and retry Gemini/OpenAI."
    );
  }
  return (
    "Configure GROQ_API_KEY (https://console.groq.com), GEMINI_API_KEY, or OPENAI_API_KEY in backend/.env."
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithGeminiModel(
  modelName: string,
  prompt: string,
  userJson: string
): Promise<string> {
  const model = gemini!.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });
  const result = await model.generateContent([
    { text: `${prompt}\n\nUser request:\n${userJson}` },
  ]);
  return result.response.text();
}

async function callGemini(prompt: string, userJson: string): Promise<{ text: string; model: string } | null> {
  if (!gemini) return null;

  const failures: string[] = [];
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await sleep(2500);
        const text = await generateWithGeminiModel(modelName, prompt, userJson);
        if (text) return { text, model: modelName };
        failures.push(`${modelName}: empty response`);
        break;
      } catch (e) {
        lastError = e;
        const msg = geminiErrorMessage(e).slice(0, 160);
        if (isRetryableGeminiError(e)) {
          if (attempt === 0 && /429/.test(msg)) {
            console.warn(`Gemini ${modelName} rate-limited, retrying once…`);
            continue;
          }
          failures.push(`${modelName}: ${msg}`);
          console.warn(`Gemini model ${modelName} unavailable:`, msg);
          break;
        }
        throw e;
      }
    }
  }

  if (failures.length) {
    throw new Error(
      `Gemini failed for all configured models (${GEMINI_MODELS.join(", ")}). ${failures.join(" | ")}`
    );
  }
  if (lastError) throw lastError;
  return null;
}

async function callOpenAiCompatibleJson(
  provider: AiProviderName,
  system: string,
  user: string
): Promise<{ content: string; model: string } | null> {
  if (provider === "groq") {
    const content = await callGroqJson(system, user);
    return content ? { content, model: GROQ_MODEL } : null;
  }
  if (provider === "openai") {
    const content = await callOpenAiJson(system, user);
    return content ? { content, model: OPENAI_MODEL } : null;
  }
  return null;
}

async function callAiForItinerary(
  input: ItineraryInput
): Promise<{ payload: ItineraryPayload; model?: string; providerUsed: AiProviderName } | null> {
  const userPayload = JSON.stringify(input);
  const system = `${SYSTEM_PROMPT} Budget: ${input.budget} USD. Travelers: ${input.travelers}. Interests: ${input.interests.join(", ")}.`;

  let lastError: unknown;

  for (const provider of getProviderFallbackOrder()) {
    try {
      if (provider === "gemini") {
        const result = await callGemini(system, userPayload);
        if (result?.text) {
          const parsed = parseJsonContent<ItineraryPayload>(result.text);
          if (parsed?.days?.length) {
            return { payload: parsed, model: result.model, providerUsed: "gemini" };
          }
        }
        continue;
      }

      const json = await callOpenAiCompatibleJson(provider, system, userPayload);
      if (json?.content) {
        const parsed = parseJsonContent<ItineraryPayload>(json.content);
        if (parsed?.days?.length) {
          return { payload: parsed, model: json.model, providerUsed: provider };
        }
      }
    } catch (e) {
      lastError = e;
      console.warn(`${provider} itinerary failed:`, geminiErrorMessage(e).slice(0, 160));
    }
  }

  if (lastError) throw lastError;
  return null;
}

async function callAiForDay(
  input: ItineraryInput,
  dayNumber: number,
  context?: string
): Promise<{ day: DayPayload; model?: string; providerUsed: AiProviderName } | null> {
  const userPayload = JSON.stringify({ ...input, dayNumber, context });
  const system = `${SYSTEM_PROMPT} Return JSON with a single "day" object matching one days[] item for dayNumber ${dayNumber}.`;

  let lastError: unknown;

  for (const provider of getProviderFallbackOrder()) {
    try {
      if (provider === "gemini") {
        const result = await callGemini(system, userPayload);
        if (result?.text) {
          const parsed = parseJsonContent<{ day?: DayPayload } & DayPayload>(result.text);
          const day = parsed.day ?? parsed;
          if (day?.activities?.length) {
            return { day: { ...day, dayNumber }, model: result.model, providerUsed: "gemini" };
          }
        }
        continue;
      }

      const json = await callOpenAiCompatibleJson(provider, system, userPayload);
      if (json?.content) {
        const parsed = parseJsonContent<{ day?: DayPayload } & DayPayload>(json.content);
        const day = parsed.day ?? parsed;
        if (day?.activities?.length) {
          return { day: { ...day, dayNumber }, model: json.model, providerUsed: provider };
        }
      }
    } catch (e) {
      lastError = e;
      console.warn(`${provider} day regen failed:`, geminiErrorMessage(e).slice(0, 160));
    }
  }

  if (lastError) throw lastError;
  return null;
}

async function resolveItineraryPayload(input: ItineraryInput): Promise<{
  payload: ItineraryPayload;
  meta: AiGenerationMeta;
}> {
  const provider = getAiProvider();

  if (!provider) {
    if (env.ALLOW_DEMO_ITINERARY) {
      return {
        payload: DEMO_ITINERARY(input),
        meta: {
          aiPowered: false,
          provider: null,
          generationMode: "demo",
          fallbackReason: "No GEMINI_API_KEY or OPENAI_API_KEY configured",
        },
      };
    }
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY (https://console.groq.com), GEMINI_API_KEY, or OPENAI_API_KEY to backend/.env"
    );
  }

  try {
    const ai = await callAiForItinerary(input);
    if (!ai?.payload?.days?.length) {
      throw new Error("AI returned an empty itinerary. Try again.");
    }

    let payload = ai.payload;
    if (isServerPlacesEnrichmentEnabled()) {
      payload = await enrichPayload(payload, input);
    }

    return {
      payload,
      meta: {
        aiPowered: true,
        provider: ai.providerUsed,
        model: ai.model,
        generationMode: "ai",
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.warn(`${provider} itinerary generation failed:`, message);

    if (!env.ALLOW_DEMO_ITINERARY) {
      throw new Error(`AI generation failed: ${formatAiQuotaHelp(e)}`);
    }

    return {
      payload: DEMO_ITINERARY(input),
      meta: {
        aiPowered: false,
        provider,
        generationMode: "demo",
        fallbackReason: message.slice(0, 300),
      },
    };
  }
}

export async function generateItinerary(userId: string, input: ItineraryInput) {
  const { payload: parsed, meta } = await resolveItineraryPayload(input);

  const itinerary = await prisma.itinerary.create({
    data: {
      userId,
      destination: input.destination,
      country: input.country,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      travelers: input.travelers,
      budget: input.budget,
      interests: input.interests,
      totalCost: parsed.totalCost,
      summary: parsed.summary,
      rawResponse: { ...parsed, ...meta } as object,
      days: {
        create: parsed.days.map((day) => ({
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description,
          activities: {
            create: day.activities.map((a) => activityCreateData(a)),
          },
        })),
      },
    },
    include: { days: { include: { activities: true }, orderBy: { dayNumber: "asc" } } },
  });

  return {
    itinerary,
    hotelRecommendations: parsed.hotelRecommendations ?? [],
    ...meta,
  };
}

export async function regenerateItineraryDay(itineraryId: string, dayNumber: number, userId: string) {
  const itinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, userId },
    include: { days: { include: { activities: true } } },
  });
  if (!itinerary) throw new Error("Itinerary not found");

  const input: ItineraryInput = {
    destination: itinerary.destination,
    country: itinerary.country,
    startDate: itinerary.startDate.toISOString().split("T")[0],
    endDate: itinerary.endDate.toISOString().split("T")[0],
    travelers: itinerary.travelers,
    budget: Number(itinerary.budget),
    interests: itinerary.interests,
  };

  const provider = getAiProvider();
  let newDay: DayPayload;
  let meta: AiGenerationMeta = {
    aiPowered: false,
    provider,
    generationMode: "demo",
  };

  if (provider) {
    try {
      const existingTitles = itinerary.days.map((d) => `Day ${d.dayNumber}: ${d.title}`).join("; ");
      const aiDay = await callAiForDay(input, dayNumber, existingTitles);
      if (aiDay?.day?.activities?.length) {
        let day = aiDay.day;
        if (isServerPlacesEnrichmentEnabled()) {
          const activities = await enrichItineraryActivities(
            day.activities,
            input.destination,
            input.country
          );
          day = { ...day, activities };
        }
        newDay = day;
        meta = {
          aiPowered: true,
          provider,
          model: aiDay.model,
          generationMode: "ai",
        };
      } else {
        throw new Error("Empty AI day response");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn(`${provider} day regenerate failed:`, message);

      if (!env.ALLOW_DEMO_ITINERARY) {
        throw new Error(`AI day regeneration failed: ${message.slice(0, 200)}`);
      }

      const demo = DEMO_ITINERARY(input);
      newDay = demo.days.find((d) => d.dayNumber === dayNumber) ?? demo.days[0];
      newDay = { ...newDay, title: newDay.title + " (Demo fallback)" };
      meta = {
        aiPowered: false,
        provider,
        generationMode: "demo",
        fallbackReason: message.slice(0, 300),
      };
    }
  } else {
    if (!env.ALLOW_DEMO_ITINERARY) {
      throw new Error("No AI provider configured");
    }
    const demo = DEMO_ITINERARY(input);
    newDay = demo.days.find((d) => d.dayNumber === dayNumber) ?? demo.days[0];
    newDay = { ...newDay, title: newDay.title + " (Demo)" };
    meta.fallbackReason = "No API key configured";
  }

  await prisma.itineraryDay.deleteMany({ where: { itineraryId, dayNumber } });
  await prisma.itineraryDay.create({
    data: {
      itineraryId,
      dayNumber,
      title: newDay.title,
      description: newDay.description,
      activities: {
        create: newDay.activities.map((a) => activityCreateData(a)),
      },
    },
  });

  const updated = await prisma.itinerary.findUnique({
    where: { id: itineraryId },
    include: { days: { include: { activities: true }, orderBy: { dayNumber: "asc" } } },
  });

  return { itinerary: updated, ...meta };
}
