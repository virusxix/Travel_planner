"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, ArrowLeft, Clock, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, FormField } from "@/components/ui/input";
import { GlassCard } from "@/components/shared/glass-card";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/components/shared/toast-provider";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types";

const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeConfigured = !!stripePublishable && stripePublishable.startsWith("pk_");

type Quote = {
  nights: number;
  total: number;
  nightlyBreakdown: { date: string; price: number }[];
};

export default function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const cancelled = searchParams.get("cancelled");
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const quoteMutation = useMutation({
    mutationFn: () =>
      api<Quote>("/bookings/quote", {
        method: "POST",
        body: JSON.stringify({ roomId, checkIn, checkOut, guests }),
      }),
    onSuccess: (data) => {
      setQuote(data);
      if (data.nights < 1) {
        toast({
          title: "Invalid dates",
          description: "Check-out must be after check-in.",
          variant: "error",
        });
      }
    },
    onError: (e: Error) => {
      setQuote(null);
      toast({
        title: "Could not calculate price",
        description: e.message,
        variant: "error",
      });
    },
  });

  const reserveMutation = useMutation({
    mutationFn: () =>
      api<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({ roomId, checkIn, checkOut, guests }),
      }),
    onSuccess: (booking) => {
      setPendingBooking(booking);
      toast({
        title: "Reservation held",
        description: stripeConfigured
          ? "Continue to Stripe Checkout to pay."
          : "Complete payment within 30 minutes (dev mode).",
        variant: "info",
      });
    },
    onError: (e: Error) => toast({ title: "Booking failed", description: e.message, variant: "error" }),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await api<{ url?: string; mock?: boolean }>(
        `/bookings/${bookingId}/checkout-session`,
        { method: "POST" }
      );
      if (res.url) {
        window.location.href = res.url;
        return res;
      }
      if (res.mock) {
        return api<Booking>(`/bookings/${bookingId}/confirm-payment`, { method: "POST" });
      }
      throw new Error("No checkout URL returned");
    },
    onSuccess: (data) => {
      if (data && "id" in data) {
        toast({ title: "Booking confirmed!", variant: "success" });
        router.push(`/dashboard?booked=${(data as Booking).id}`);
      }
    },
    onError: (e: Error) => toast({ title: "Checkout failed", description: e.message, variant: "error" }),
  });

  const datesValid = checkIn && checkOut && checkOut > checkIn;

  const handleCalculate = () => {
    if (!datesValid) {
      toast({
        title: "Select valid dates",
        description: "Check-out must be after check-in.",
        variant: "error",
      });
      return;
    }
    quoteMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <GlassCard hover={false} className="p-12 text-center max-w-md">
          <p className="text-muted">Please log in as a traveler to book.</p>
          <Link href="/login"><Button className="mt-4">Log in</Button></Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 pb-24">
      <div className="max-w-lg mx-auto">
        {propertyId && (
          <Link href={`/properties/${propertyId}`} className="inline-flex items-center gap-2 text-sm text-violet-400 font-medium mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to property
          </Link>
        )}

        {cancelled && (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Payment was cancelled. Your reservation hold may still be active for a limited time.
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold">Complete your booking</h1>
          <p className="mt-2 text-muted">
            {stripeConfigured ? "Secure payment via Stripe Checkout" : "Dev mode — mock payment"}
          </p>

          {!pendingBooking ? (
            <>
              <GlassCard hover={false} className="mt-8 p-8 space-y-5">
                <FormField label="Check-in">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        setQuote(null);
                      }}
                      className="pl-11"
                    />
                  </div>
                </FormField>
                <FormField label="Check-out">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().slice(0, 10)}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setQuote(null);
                      }}
                      className="pl-11"
                    />
                  </div>
                </FormField>
                <FormField label="Guests">
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                    <Input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value, 10) || 1)}
                      className="pl-11"
                    />
                  </div>
                </FormField>
                <Button
                  variant="secondary"
                  className="w-full rounded-2xl gap-2"
                  disabled={!datesValid || quoteMutation.isPending}
                  onClick={handleCalculate}
                >
                  {quoteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating…
                    </>
                  ) : (
                    "Calculate dynamic price"
                  )}
                </Button>
              </GlassCard>

              {quote && quote.nights > 0 && (
                <GlassCard hover={false} className="mt-4 p-8">
                  <h3 className="font-display font-semibold">{quote.nights} nights</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {quote.nightlyBreakdown?.map((n) => (
                      <li key={n.date} className="flex justify-between text-muted">
                        <span>{n.date}</span>
                        <span className="font-medium text-foreground">{formatCurrency(n.price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="font-display text-2xl font-bold gradient-brand-text">
                      {formatCurrency(quote.total)}
                    </span>
                    <Button
                      disabled={reserveMutation.isPending}
                      onClick={() => reserveMutation.mutate()}
                      className="rounded-2xl gap-2 w-full sm:w-auto"
                    >
                      Reserve & pay
                    </Button>
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard hover={false} className="mt-8 p-8 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Clock className="h-4 w-4" />
                <span>Payment required within 30 minutes</span>
              </div>
              <p className="text-sm text-muted">
                {stripeConfigured
                  ? "You will be redirected to Stripe to pay securely by card."
                  : "Stripe is not configured — using mock payment for development."}
              </p>
              <p className="font-display text-2xl font-bold gradient-brand-text">
                {formatCurrency(Number(pendingBooking.finalTotal))}
              </p>
              <Button
                className="w-full rounded-2xl gap-2 h-12"
                disabled={checkoutMutation.isPending}
                onClick={() => checkoutMutation.mutate(pendingBooking.id)}
              >
                {stripeConfigured ? (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    {checkoutMutation.isPending ? "Redirecting..." : "Pay with Stripe"}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {checkoutMutation.isPending ? "Processing..." : "Complete payment (dev)"}
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full rounded-2xl" onClick={() => setPendingBooking(null)}>
                Change dates
              </Button>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
