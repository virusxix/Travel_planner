"use client";

import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  time?: string | null;
  title: string;
  description?: string | null;
};

export function PlannerDayTimeline({
  dayNumber,
  title,
  activities,
  mapOrderById,
}: {
  dayNumber: number;
  title: string;
  activities: Activity[];
  mapOrderById?: Map<string, number>;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-bold text-slate-900 mb-1">Day {dayNumber}</h3>
      <p className="text-sm text-slate-600 mb-4">{title}</p>

      <ul className="space-y-2.5">
        {activities.map((a) => {
          const mapOrder = mapOrderById?.get(a.id);
          return (
            <li key={a.id} className="flex gap-2.5 text-sm text-slate-700 leading-relaxed">
              {mapOrder != null ? (
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white"
                  title={`Map stop ${mapOrder}`}
                >
                  {mapOrder}
                </span>
              ) : (
                <span className="text-slate-300 mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              )}
              <span className="min-w-0 flex-1">
                {a.time && (
                  <span className="text-slate-500 text-xs flex items-center gap-1 mb-0.5">
                    <Clock className="h-3 w-3" />
                    {a.time}
                  </span>
                )}
                <span className={cn("font-medium text-slate-900")}>{a.title}</span>
                {mapOrder == null && (
                  <span className="text-slate-400 text-[10px] flex items-center gap-0.5 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    Not on map
                  </span>
                )}
                {a.description && (
                  <span className="block text-slate-500 text-xs mt-0.5 line-clamp-2">
                    {a.description}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
