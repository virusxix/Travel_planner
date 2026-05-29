"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Activity = {
  id: string;
  time?: string | null;
  title: string;
  description?: string | null;
};

function timeBucket(time?: string | null): "Morning" | "Afternoon" | "Evening" | "Activity" {
  if (!time) return "Activity";
  const m = time.match(/^(\d{1,2}):/);
  if (!m) return "Activity";
  const h = parseInt(m[1], 10);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export function PlannerDayTimeline({
  dayNumber,
  title,
  activities,
}: {
  dayNumber: number;
  title: string;
  activities: Activity[];
}) {
  const grouped = activities.reduce(
    (acc, a) => {
      const bucket = timeBucket(a.time);
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket].push(a);
      return acc;
    },
    {} as Record<string, Activity[]>
  );

  const order = ["Morning", "Afternoon", "Evening", "Activity"] as const;

  return (
    <div className="mb-8">
      <h3 className="text-base font-bold text-white mb-1">Day {dayNumber}</h3>
      <p className="text-sm text-slate-400 mb-4">{title}</p>

      <div className="space-y-4">
        {order.map((bucket) => {
          const items = grouped[bucket];
          if (!items?.length) return null;
          return (
            <div key={bucket}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {bucket}
              </p>
              <ul className="space-y-2.5">
                {items.map((a) => (
                  <li key={a.id} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
                    <span className="text-orange-400 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      {a.time && (
                        <span className="text-slate-500 text-xs flex items-center gap-1 mb-0.5">
                          <Clock className="h-3 w-3" />
                          {a.time}
                        </span>
                      )}
                      <span className={cn("font-medium text-white")}>{a.title}</span>
                      {a.description && (
                        <span className="block text-slate-500 text-xs mt-0.5 line-clamp-2">
                          {a.description}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
