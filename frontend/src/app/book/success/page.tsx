"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import type { Booking } from "@/types";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing payment session");
      return;
    }

    api<Booking>("/bookings/verify-checkout", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    })
      .then(setBooking)
      .catch((e: Error) => setError(e.message));
  }, [sessionId]);

  if (error) {
    return (
      <GlassCard hover={false} className="p-10 text-center max-w-md mx-auto">
        <p className="text-red-400 font-medium">Payment verification failed</p>
        <p className="text-sm text-muted mt-2">{error}</p>
        <Link href="/dashboard">
          <Button className="mt-6 rounded-2xl">Go to dashboard</Button>
        </Link>
      </GlassCard>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted">
        <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
        <p>Confirming your booking...</p>
      </div>
    );
  }

  return (
    <GlassCard hover={false} className="p-10 text-center max-w-md mx-auto">
      <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto" />
      <h1 className="font-display text-2xl font-bold mt-4">Booking confirmed!</h1>
      <p className="text-sm text-muted mt-2">
        Your stay is reserved. Booking ID: {booking.id.slice(0, 8)}…
      </p>
      <Button className="mt-8 rounded-2xl w-full" onClick={() => router.push(`/dashboard?booked=${booking.id}`)}>
        View my trips
      </Button>
    </GlassCard>
  );
}

export default function BookSuccessPage() {
  return (
    <div className="min-h-screen bg-surface py-16 px-4">
      <Suspense
        fallback={
          <div className="flex justify-center min-h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
