import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export type AiProviderName = "gemini" | "openai" | "groq";

export const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

/** Groq — fast Llama/Mixtral via OpenAI-compatible API: https://console.groq.com */
export const groq = env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

export const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

export const GROQ_MODEL = env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
export const OPENAI_MODEL = "gpt-4o-mini";

export const GEMINI_MODELS = (env.GEMINI_MODELS ?? "gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export function getAiProvider(): AiProviderName | null {
  const pref = env.AI_PROVIDER ?? "auto";
  if (pref === "groq") return groq ? "groq" : null;
  if (pref === "openai") return openai ? "openai" : null;
  if (pref === "gemini") return gemini ? "gemini" : null;
  if (groq) return "groq";
  if (gemini) return "gemini";
  if (openai) return "openai";
  return null;
}

/** Provider attempt order for auto-fallback */
export function getProviderFallbackOrder(): AiProviderName[] {
  const pref = env.AI_PROVIDER ?? "auto";
  if (pref === "groq") return groq ? ["groq"] : [];
  if (pref === "gemini") return gemini ? ["gemini"] : [];
  if (pref === "openai") return openai ? ["openai"] : [];
  const order: AiProviderName[] = [];
  if (groq) order.push("groq");
  if (gemini) order.push("gemini");
  if (openai) order.push("openai");
  return order;
}

export function isAiEnabled(): boolean {
  return getAiProvider() !== null;
}

export async function callGroqJson(system: string, user: string): Promise<string | null> {
  if (!groq) return null;
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.5,
  });
  return completion.choices[0]?.message?.content ?? null;
}

export async function callOpenAiJson(system: string, user: string): Promise<string | null> {
  if (!openai) return null;
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content ?? null;
}

export async function callGroqChat(
  system: string,
  history: { role: "user" | "assistant"; content: string }[],
  message: string
): Promise<string | null> {
  if (!groq) return null;
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: system },
      ...history.slice(-16).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ],
    max_tokens: 1024,
    temperature: 0.6,
  });
  return completion.choices[0]?.message?.content?.trim() ?? null;
}

export async function callOpenAiChat(
  system: string,
  history: { role: "user" | "assistant"; content: string }[],
  message: string
): Promise<string | null> {
  if (!openai) return null;
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      ...history.slice(-16).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ],
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content?.trim() ?? null;
}
