"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BedDouble, Gem, MapPin, Search, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "stays" | "planner" | "gems";

const TABS: { id: Tab; label: string; icon: typeof BedDouble }[] = [
  { id: "stays", label: "Stays", icon: BedDouble },
  { id: "planner", label: "Trip planner", icon: Sparkles },
  { id: "gems", label: "Experiences", icon: Gem },
];

const QUICK = ["Chiang Mai", "Hoi An", "Bali", "Luang Prabang"];

function dayNum(iso: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : String(d.getDate()).padStart(2, "0");
}

function dateLabel(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function nightCount(from: string, to: string) {
  if (!from || !to) return null;
  const n = Math.round((new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) / 86400000);
  return n > 0 ? n : null;
}

export function YTravelSearchBar({ className, embedded }: { className?: string; embedded?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("stays");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");

  const nights = useMemo(() => nightCount(checkIn, checkOut), [checkIn, checkOut]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === "planner") {
      router.push("/planner");
      return;
    }
    if (tab === "gems") {
      router.push(destination ? `/hidden-gems?city=${encodeURIComponent(destination)}` : "/hidden-gems");
      return;
    }
    const q = new URLSearchParams();
    if (destination) q.set("city", destination);
    if (checkIn) q.set("checkIn", checkIn);
    if (checkOut) q.set("checkOut", checkOut);
    if (guests) q.set("guests", guests);
    router.push(`/hidden-gems?${q}`);
  }

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <form onSubmit={submit} className="ota-search-card overflow-hidden">
        <div className="px-4 sm:px-6 pt-5 pb-1 overflow-x-auto scrollbar-hide">
          <div className="inline-flex min-w-max rounded-full bg-slate-100 p-1 gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  tab === id ? "pill-active" : "pill-inactive"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-stretch mx-5 my-4 rounded-2xl border border-slate-200 overflow-hidden">
          <Field label="Destination" icon={MapPin} wide>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City or region"
              className="search-field-input mt-0.5"
            />
          </Field>

          {tab === "stays" && (
            <>
              <DateField label="Check in" value={checkIn} onChange={setCheckIn} />
              <div className="flex flex-col items-center justify-center px-3 border-x border-slate-200 bg-slate-50/60 min-w-[72px]">
                {nights ? (
                  <>
                    <span className="text-lg font-bold">{nights}</span>
                    <span className="text-[10px] uppercase text-slate-500">{nights === 1 ? "night" : "nights"}</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
              <DateField label="Check out" value={checkOut} onChange={setCheckOut} min={checkIn} />
              <GuestsBlock guests={guests} rooms={rooms} onGuests={setGuests} onRooms={setRooms} />
            </>
          )}

          <button type="submit" className="w-[72px] shrink-0 bg-brand-500 hover:bg-brand-600 transition-colors" aria-label="Search">
            <Search className="h-6 w-6 text-white mx-auto" strokeWidth={2.5} />
          </button>
        </div>

        <div className="lg:hidden p-4 space-y-3">
          <Field label="Destination" icon={MapPin}>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City or region"
              className="search-field-input mt-0.5"
            />
          </Field>
          {tab === "stays" && (
            <div className="grid grid-cols-2 gap-3">
              <DateField label="Check in" value={checkIn} onChange={setCheckIn} mobile />
              <DateField label="Check out" value={checkOut} onChange={setCheckOut} min={checkIn} mobile />
              <div className="col-span-2">
                <GuestsBlock guests={guests} rooms={rooms} onGuests={setGuests} onRooms={setRooms} mobile />
              </div>
            </div>
          )}
          <button type="submit" className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 flex items-center justify-center gap-2">
            <Search className="h-5 w-5" /> Search
          </button>
        </div>

        {tab === "stays" && (
          <p className="px-6 pb-5 text-xs text-slate-500 hidden sm:block">
            Book direct with local hosts — only 5% commission.
          </p>
        )}
      </form>

      {!embedded && tab === "stays" && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {QUICK.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setDestination(city)}
              className="rounded-full bg-white/90 border border-white/40 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
  wide,
}: {
  label: string;
  icon: typeof MapPin;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 px-5 py-4 border-r border-slate-200 min-w-0 hover:bg-slate-50/80 text-left", wide && "flex-[1.3]")}>
      <Icon className="h-5 w-5 text-slate-400 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        {children}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  min,
  mobile,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  mobile?: boolean;
}) {
  const day = dayNum(value);
  const id = `ota-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex flex-col justify-center px-5 py-4 border-r border-slate-200 cursor-pointer hover:bg-slate-50/80 text-left",
        !mobile && "flex-1 min-w-0",
        mobile && "rounded-xl border border-slate-200"
      )}
    >
      <span className="text-xs text-slate-500">{label}</span>
      {day ? (
        <>
          <span className={cn("font-bold text-slate-900 mt-1 leading-none", mobile ? "text-2xl" : "text-3xl")}>{day}</span>
          <span className="text-xs text-slate-500 mt-1">{dateLabel(value)}</span>
        </>
      ) : (
        <span className="text-sm text-slate-400 mt-1">Add dates</span>
      )}
      <input id={id} type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
    </label>
  );
}

function GuestsBlock({
  guests,
  rooms,
  onGuests,
  onRooms,
  mobile,
}: {
  guests: string;
  rooms: string;
  onGuests: (v: string) => void;
  onRooms: (v: string) => void;
  mobile?: boolean;
}) {
  const count = guests.padStart(2, "0");

  if (mobile) {
    return (
      <div className="rounded-xl border border-slate-200 px-4 py-3 flex gap-3">
        <select value={guests} onChange={(e) => onGuests(e.target.value)} className="flex-1 text-sm bg-transparent [color-scheme:dark]">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
          ))}
        </select>
        <select value={rooms} onChange={(e) => onRooms(e.target.value)} className="flex-1 text-sm bg-transparent [color-scheme:dark]">
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>{n} room{n > 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-r border-slate-200 flex-1 min-w-[140px] text-left">
      <Users className="h-5 w-5 text-slate-400 shrink-0" />
      <div>
        <p className="text-xs text-slate-500">Guests & rooms</p>
        <p className="text-3xl font-bold mt-1 leading-none">{count}</p>
        <div className="flex gap-2 mt-1.5 text-xs text-slate-600">
          <select value={guests} onChange={(e) => onGuests(e.target.value)} className="bg-transparent cursor-pointer [color-scheme:dark]">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
          <select value={rooms} onChange={(e) => onRooms(e.target.value)} className="bg-transparent cursor-pointer [color-scheme:dark]">
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} room{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
