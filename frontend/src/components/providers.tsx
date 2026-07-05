"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { ToastProvider } from "@/components/shared/toast-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { GoogleMapsProvider } from "@/components/maps/google-maps-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  );
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <GoogleMapsProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </GoogleMapsProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
