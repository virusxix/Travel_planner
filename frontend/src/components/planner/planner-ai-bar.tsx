"use client";

import { Mic, Plus, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PlannerAiBar({
  placeholder = "Ask anything…",
  onSend,
  isLoading = false,
}: {
  placeholder?: string;
  onSend?: (text: string) => void;
  isLoading?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || isLoading) return;
    onSend?.(value.trim());
    setValue("");
  };

  return (
    <div className="shrink-0 p-4 pt-2">
      <div className="ai-input-gradient p-[1px] rounded-2xl">
        <div className="flex items-center gap-2 rounded-[15px] bg-[#12121a]/95 px-3 py-2.5">
          <button
            type="button"
            className="icon-btn-glass h-9 w-9 shrink-0 text-slate-300"
            aria-label="Add attachment"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
          </button>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none min-w-0 disabled:opacity-50"
          />
          <button
            type="button"
            className="icon-btn-glass h-9 w-9 shrink-0 text-slate-300"
            aria-label="Voice"
            disabled={isLoading}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isLoading || !value.trim()}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-btn text-white",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
            aria-label="Send"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
