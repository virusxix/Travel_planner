"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { PlannerAiBar } from "@/components/planner/planner-ai-bar";
import { cn } from "@/lib/utils";
import type { Itinerary } from "@/types";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function storageKey(userId: string, itineraryId?: string | null) {
  return `hiddenstay-chat:${userId}:${itineraryId ?? "general"}`;
}

function loadMessages(userId: string, itineraryId?: string | null): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(storageKey(userId, itineraryId));
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessages(userId: string, itineraryId: string | null | undefined, msgs: ChatMessage[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(userId, itineraryId), JSON.stringify(msgs.slice(-40)));
}

const STARTERS = [
  "Best local food near my stops?",
  "How should I split my days?",
  "Hidden gems off the tourist path",
  "Budget tips for this trip",
];

export function PlannerChatPanel({
  userId,
  itinerary,
}: {
  userId: string;
  itinerary?: Itinerary | null;
}) {
  const itineraryId = itinerary?.id ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadMessages(userId, itineraryId)
  );

  useEffect(() => {
    setMessages(loadMessages(userId, itineraryId));
  }, [userId, itineraryId]);

  useEffect(() => {
    saveMessages(userId, itineraryId, messages);
  }, [messages, userId, itineraryId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: (payload: { text: string; history: ChatMessage[] }) =>
      api<{ reply: string; model: string; provider: string }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: payload.text,
          itineraryId: itineraryId ?? undefined,
          history: payload.history.map((m) => ({ role: m.role, content: m.content })),
        }),
      }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    },
  });

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const history = [...messages, userMsg];
    setMessages(history);
    chatMutation.mutate({ text: trimmed, history });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0a0a0f]">
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.06] glass-strong">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full gradient-btn flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Travel Chat</h1>
            <p className="text-[11px] text-slate-400">
              {itinerary
                ? `Planning ${itinerary.destination} — I know your itinerary`
                : "Ask about destinations, days, food & more"}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Hi! I&apos;m your travel assistant. Ask me anything — refine your trip, find
              restaurants, or get day-by-day advice.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full px-3 py-2 text-xs font-medium pill-inactive hover:border-violet-500/40 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-br-md"
                  : "glass-card text-slate-200 rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Thinking…
            </div>
          </div>
        )}

        {chatMutation.isError && (
          <p className="text-xs text-red-400 text-center px-2">
            {chatMutation.error?.message ?? "Could not reach AI. Check GEMINI_API_KEY on the server."}
          </p>
        )}
      </div>

      <PlannerAiBar
        placeholder="Ask anything about your trip…"
        onSend={send}
        isLoading={chatMutation.isPending}
      />
    </div>
  );
}
