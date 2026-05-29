"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { YTravelSearchBar } from "@/components/home/y-travel-search-bar";
import { PopularDestinationCard } from "@/components/home/popular-destination-card";
import { ExampleStayCard, PropertyStayCard } from "@/components/home/example-stay-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AUTH_EXAMPLE_STAYS } from "@/lib/auth-examples";
import { POPULAR_DESTINATIONS } from "@/lib/home-content";
import type { Property } from "@/types";

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: properties } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () => api<Property[]>("/properties?limit=6"),
  });

  const hasStays = (properties?.length ?? 0) > 0;

  function scrollDestinations(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative y-hero-bg pt-28 pb-44 sm:pt-32 sm:pb-48 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-4xl font-extrabold leading-[1.15] text-foreground sm:text-5xl lg:text-[3.25rem]">
                Your Journey{" "}
                <span className="text-brand-500">to Unforgettable</span> Places Begins Here
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                Discover homestays, eco-lodges, and boutique inns across Asia — authentic stays
                with only 5% commission for local hosts.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/search">
                  <Button size="lg" className="rounded-[1.25rem]">
                    Explore Stays
                  </Button>
                </Link>
                <Link href="/planner">
                  <Button size="lg" variant="outline" className="rounded-[1.25rem]">
                    AI Trip Planner
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <div className="relative aspect-square sm:aspect-[4/3]">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-sky-200/80 to-brand-500/20" />
                <Image
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80"
                  alt="Travel adventure"
                  fill
                  className="object-contain p-6 drop-shadow-2xl"
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="absolute -left-4 top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
                <div className="absolute -right-2 bottom-12 h-32 w-32 rounded-full bg-brand-500/20 blur-3xl" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating search bar */}
        <div className="absolute left-0 right-0 -bottom-16 sm:-bottom-20 px-4 sm:px-6 lg:px-8 z-10">
          <YTravelSearchBar />
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-4 pt-32 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem]">
                  <Image
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80"
                    alt="Mountain travel"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-[1.75rem]">
                  <Image
                    src="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=400&q=80"
                    alt="Temple travel"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
              </div>
              <div className="relative aspect-[3/5] overflow-hidden rounded-[1.75rem] mt-4">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80"
                  alt="Lake travel"
                  fill
                  className="object-cover"
                  sizes="280px"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              About HiddenStay
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Navigating the World, One Hidden Stay at a Time
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              We connect travelers with small, independent hospitality businesses across Asia —
              homestays, guesthouses, and eco-lodges that chain hotels overlook. Our AI planner
              builds day-by-day itineraries with real local spots, and hosts keep 95% of every
              booking.
            </p>
            <Link href="/register?role=owner" className="inline-block mt-8">
              <Button variant="outline" className="rounded-[1.25rem]">
                Become a Host
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
              Popular Travel Locations
            </h2>
            <p className="mt-2 text-muted text-sm">Handpicked destinations across Asia</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={() => scrollDestinations("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_4px_14px_rgba(29,133,228,0.35)] hover:bg-brand-600 transition-colors"
              aria-label="Previous destinations"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollDestinations("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_4px_14px_rgba(29,133,228,0.35)] hover:bg-brand-600 transition-colors"
              aria-label="Next destinations"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {POPULAR_DESTINATIONS.map((dest) => (
            <PopularDestinationCard key={dest.id} {...dest} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/search">
            <Button className="rounded-[1.25rem] px-10">See More</Button>
          </Link>
        </div>
      </section>

      {/* Dream destination / stays */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
            Let&apos;s explore your dream destination here!
          </h2>
          <p className="mt-3 text-muted text-sm">
            {hasStays
              ? "Featured stays from our community of local hosts"
              : "Sample listings shown for inspiration — add your own from the business dashboard"}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hasStays
            ? properties!.map((p) => <PropertyStayCard key={p.id} property={p} />)
            : AUTH_EXAMPLE_STAYS.map((stay) => (
                <ExampleStayCard key={stay.id} stay={stay} preview />
              ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/search">
            <Button className="rounded-[1.25rem] px-10">See More</Button>
          </Link>
          {!hasStays && (
            <Link href="/business/properties/new">
              <Button variant="outline" className="rounded-[1.25rem]">
                Add your property
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Host CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-500 px-8 py-14 sm:px-14 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
              List your property today
            </h2>
            <p className="mt-3 text-white/85 max-w-md mx-auto">
              Only 5% commission for small hospitality businesses across Asia.
            </p>
            <Link href="/register?role=owner">
              <Button
                size="lg"
                className="mt-8 bg-white text-brand-600 hover:bg-white/90 rounded-[1.25rem] shadow-none"
              >
                Register Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
