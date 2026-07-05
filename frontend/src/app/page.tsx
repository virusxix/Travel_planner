"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Luggage,
  Building2,
  BadgePercent,
} from "lucide-react";
import { YTravelSearchBar } from "@/components/home/y-travel-search-bar";
import { PopularDestinationsRow } from "@/components/home/popular-destinations-row";
import { ExampleStayCard, PropertyStayCard } from "@/components/home/example-stay-card";
import { ScrambleText } from "@/components/home/scramble-text";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { AUTH_EXAMPLE_STAYS } from "@/lib/auth-examples";
import { UNSPLASH } from "@/lib/unsplash-images";
import type { Property } from "@/types";

const ImmersiveHero = dynamic(
  () => import("@/components/home/immersive-hero").then((m) => m.ImmersiveHero),
  { ssr: false }
);

const TRUST = [
  {
    icon: Luggage,
    title: "Backed by travelers",
    desc: "Real reviews from guests who stayed with local hosts across Asia.",
  },
  {
    icon: Building2,
    title: "Stays for every style",
    desc: "Homestays, eco-lodges, boutique inns — from budget to boutique.",
  },
  {
    icon: BadgePercent,
    title: "Best rates around",
    desc: "Book direct with only 5% commission. Hosts keep more, you pay less.",
  },
];

export default function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: properties } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () => api<Property[]>("/properties?limit=6"),
  });

  const hasStays = (properties?.length ?? 0) > 0;

  useEffect(() => {
    // Lazy-load gsap so ~40 kB of animation code stays out of the initial bundle.
    let mm: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      mm = media;
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 85%" },
            }
          );
        });
        gsap.fromTo(
          "[data-hero-ui]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.2, delay: 0.9, ease: "power3.out" }
        );
      });
    })();
    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, []);

  function scrollDestinations(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Procedural night landscape lives fixed behind the whole page so the
          scene stays visible while scrolling (not just the hero). */}
      <ImmersiveHero className="fixed inset-0 z-0" />
      {/* legibility scrim — clear at the top, deepening toward the fold */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#050a17]/25 to-[#050a17]/85"
      />

      <div className="relative z-10">
      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
          <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.5em] text-white/40">
            HiddenStay — AI travel, Asia
          </p>
          <h1 className="mt-6 text-[13vw] sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.02em] text-white max-w-5xl leading-[0.98] uppercase">
            <ScrambleText text="Stays hidden" delay={400} />
            <br />
            <span className="text-hollow">
              <ScrambleText text="from the crowd" delay={900} />
            </span>
          </h1>
          <p className="mt-7 text-sm sm:text-base text-white/55 max-w-md leading-relaxed">
            Homestays and eco-lodges run by locals. Planned by AI, booked
            direct — hosts keep 95%.
          </p>

          <div className="w-full mt-10 hero-search" data-hero-ui>
            <YTravelSearchBar embedded className="max-w-7xl" />
          </div>
        </div>

        <div className="relative z-10 pb-8 flex justify-center">
          <a
            href="#trust"
            aria-label="Scroll to content"
            className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors"
          >
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* Trust row — glass on night */}
      <section id="trust" className="relative border-b border-white/10 py-14 sm:py-16">
        <div className="page-container grid gap-6 sm:grid-cols-3">
          {TRUST.map((item) => (
            <div
              key={item.title}
              data-reveal
              className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-6 flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300 mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured stays — white cards float on the night like lit windows */}
      <section className="page-container py-16 sm:py-20">
        <div data-reveal className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-300/70">
              01 — Stays
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Popular stays
            </h2>
            <p className="mt-2 text-white/55 text-sm sm:text-base">
              {hasStays ? "Handpicked from our host community" : "Sample listings for inspiration"}
            </p>
          </div>
          <Link href="/hidden-gems" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-teal-300 hover:bg-white/10 hover:text-teal-200">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div data-reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hasStays
            ? properties!.map((p) => <PropertyStayCard key={p.id} property={p} />)
            : AUTH_EXAMPLE_STAYS.slice(0, 6).map((stay) => (
                <ExampleStayCard key={stay.id} stay={stay} preview />
              ))}
        </div>
      </section>

      {/* Destinations carousel */}
      <section className="border-y border-white/10 bg-white/[0.03] py-16 sm:py-20">
        <div className="page-container">
          <div data-reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-300/70">
                02 — Destinations
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Explore destinations
              </h2>
              <p className="mt-2 text-white/55">Trending places across Southeast Asia</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                type="button"
                onClick={() => scrollDestinations("left")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollDestinations("right")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div data-reveal>
            <PopularDestinationsRow ref={scrollRef} />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="relative py-16 sm:py-24">
        <div className="page-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div data-reveal className="grid grid-cols-2 gap-3">
            <div className="space-y-3 pt-6">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image src={UNSPLASH.aboutTemple} alt="Chiang Mai temple" fill className="object-cover" sizes="240px" />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={UNSPLASH.heroEco} alt="Eco lodge" fill className="object-cover" sizes="240px" />
              </div>
            </div>
            <div className="relative aspect-[3/5] overflow-hidden rounded-2xl mt-4">
              <Image src={UNSPLASH.aboutLake} alt="Mountain lake" fill className="object-cover" sizes="280px" />
            </div>
          </div>
          <div data-reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-300/70">
              03 — About
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white">
              Independent hospitality, fairly priced
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed">
              HiddenStay connects you with homestays and eco-lodges run by locals — not global
              chains. Plan your trip with AI, book direct, and know your host keeps 95% of every
              reservation.
            </p>
            <Link href="/register?role=owner" className="inline-block mt-8">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                List your property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Host CTA — glowing panel over the night */}
      <section className="pb-20 sm:pb-28 pt-4">
        <div className="page-container">
          <div
            data-reveal
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/20 via-[#0a1622]/60 to-[#0a1622]/60 px-8 py-14 sm:px-14 text-center sm:text-left backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(94,234,212,0.18),transparent_55%)]" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Grow your hospitality business
                </h2>
                <p className="mt-2 text-white/60 max-w-md">
                  Join hosts across Asia with industry-low 5% commission.
                </p>
              </div>
              <Link href="/register?role=owner">
                <Button size="lg" className="bg-white text-[#0a1622] hover:bg-white/90 shrink-0">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
