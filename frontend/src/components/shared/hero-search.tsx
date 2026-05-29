"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (destination) q.set("city", destination);
    router.push(`/search?${q}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="max-w-xl mx-auto"
    >
      <form onSubmit={handleSearch} className="glass rounded-[1.5rem] p-2 glow-border">
        <div className="flex items-center gap-2 px-2">
          <button type="button" className="icon-btn-glass shrink-0">
            <Plus className="h-4 w-4" />
          </button>
          <Input
            placeholder="Where to? Try Chiang Mai..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 flex-1"
          />
          <Link href="/planner">
            <button type="button" className="h-11 w-11 shrink-0 rounded-full gradient-btn flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </button>
          </Link>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["Chiang Mai", "Hoi An", "Pai"].map((city) => (
          <Link
            key={city}
            href={`/search?city=${encodeURIComponent(city)}`}
            className="pill-inactive rounded-full px-4 py-2 text-xs font-medium hover:bg-white/10"
          >
            {city}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
