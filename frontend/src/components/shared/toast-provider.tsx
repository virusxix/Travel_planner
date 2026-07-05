"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

const ToastContext = createContext<{
  toast: (opts: { title: string; description?: string; variant?: ToastVariant }) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "info" }: { title: string; description?: string; variant?: ToastVariant }) => {
      const id = Math.random().toString(36).slice(2);
      setMessages((m) => [...m, { id, title, description, variant }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {messages.map((m) => (
          <Toast.Root
            key={m.id}
            className={cn(
              "y-card rounded-2xl px-4 py-3 shadow-lg border bg-white data-[state=open]:animate-in data-[state=closed]:animate-out",
              m.variant === "success" && "border-emerald-500/30",
              m.variant === "error" && "border-red-500/30",
              m.variant === "info" && "border-violet-500/30"
            )}
            onOpenChange={(open) => {
              if (!open) setMessages((prev) => prev.filter((x) => x.id !== m.id));
            }}
            duration={4000}
          >
            <Toast.Title className="text-sm font-semibold text-slate-900">{m.title}</Toast.Title>
            {m.description && (
              <Toast.Description className="text-xs text-slate-600 mt-1">{m.description}</Toast.Description>
            )}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-2rem)]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
