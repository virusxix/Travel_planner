"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { PlannerAiBar } from "@/components/planner/planner-ai-bar";
import { cn } from "@/lib/utils";
import { useStreamingText } from "@/hooks/use-streaming-text";
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
  "Delete this trip",
];

function ChatBubble({
  message,
  stream,
  onStreamTick,
  onStreamDone,
}: {
  message: ChatMessage;
  stream: boolean;
  onStreamTick?: () => void;
  onStreamDone?: () => void;
}) {
  const { text, done } = useStreamingText(message.content, stream && message.role === "assistant");

  useEffect(() => {
    if (stream && message.role === "assistant" && !done) {
      onStreamTick?.();
    }
  }, [text, stream, done, message.role, onStreamTick]);

  useEffect(() => {
    if (stream && message.role === "assistant" && done) {
      onStreamDone?.();
    }
  }, [stream, done, message.role, onStreamDone]);

  const display = message.role === "assistant" && stream ? text : message.content;
  const showCursor = stream && message.role === "assistant" && !done;

  return (
    <div className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "text-sm leading-relaxed",
          message.role === "user"
            ? "max-w-[88%] rounded-2xl px-4 py-2.5 bg-teal-500/20 border border-teal-400/20 text-white rounded-br-sm"
            : "w-full text-white/85"
        )}
      >
        <p className="whitespace-pre-wrap">
          {display}
          {showCursor && (
            <span className="inline-block w-0.5 h-4 ml-0.5 align-text-bottom bg-brand-600 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
}

export type DeleteItineraryAction = {
  action: "DELETE_ITINERARY";
  target_ids: string[];
  confirmation_message: string;
};

export function PlannerChatPanel({
  userId,
  itinerary,
  onItineraryDeleted,
}: {
  userId: string;
  itinerary?: Itinerary | null;
  onItineraryDeleted?: (action: DeleteItineraryAction) => void;
}) {
  const itineraryId = itinerary?.id ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadMessages(userId, itineraryId)
  );

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const finishStreaming = useCallback(() => setStreamingId(null), []);

  useEffect(() => {
    setMessages(loadMessages(userId, itineraryId));
    setStreamingId(null);
  }, [userId, itineraryId]);

  useEffect(() => {
    saveMessages(userId, itineraryId, messages);
  }, [messages, userId, itineraryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const chatMutation = useMutation({
    mutationFn: (payload: { text: string; history: ChatMessage[] }) =>
      api<{
        reply: string;
        model: string;
        provider: string;
        coordinatorAction?: DeleteItineraryAction | null;
      }>("/chat", {
        method: "POST",
        body: JSON.stringify({
          message: payload.text,
          itineraryId: itineraryId ?? undefined,
          history: payload.history.map((m) => ({ role: m.role, content: m.content })),
        }),
      }),
    onSuccess: (data) => {
      const id = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: data.reply,
        },
      ]);
      setStreamingId(id);
      if (data.coordinatorAction?.action === "DELETE_ITINERARY") {
        onItineraryDeleted?.(data.coordinatorAction);
      }
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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="shrink-0 px-4 py-3.5 border-b border-white/10 bg-[#0a1622]/70 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-400/20 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-teal-300" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-900">Trip assistant</h1>
            <p className="text-xs text-stone-500">
              {itinerary
                ? `${itinerary.destination} itinerary loaded`
                : "Ask about destinations, food, and day plans"}
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500 leading-relaxed">
              Ask me to refine your trip, suggest restaurants, or reorganize your days.
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-lg px-3 py-2 text-xs font-medium pill-inactive transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <ChatBubble
            key={m.id}
            message={m}
            stream={m.id === streamingId}
            onStreamTick={scrollToBottom}
            onStreamDone={finishStreaming}
          />
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-2 text-white/60 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}

        {chatMutation.isError && (
          <p className="text-xs text-red-600 text-center px-2">
            {chatMutation.error?.message ?? "Could not reach AI. Check API keys on the server."}
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
