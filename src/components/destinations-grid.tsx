"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import { destinations } from "@/data/destinations";

export function DestinationsGrid() {
  const [filter, setFilter] = useState<string>("all");

  const caseTypes = useMemo(() => {
    const all = new Set<string>();
    destinations.forEach((d) => d.caseTypes.forEach((t) => all.add(t)));
    return ["all", ...Array.from(all)];
  }, []);

  const visible =
    filter === "all" ? destinations : destinations.filter((d) => d.caseTypes.includes(filter));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {caseTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              filter === type
                ? "border-immigration-600 bg-immigration-600 text-white"
                : "border-stone-300 text-stone-700 hover:border-immigration-300"
            )}
          >
            {type === "all" ? "All case types" : type}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((d) => (
          <div key={d.slug} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-immigration-600" />
              <h3 className="font-bold text-stone-900">{d.country}</h3>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              {d.caseTypes.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
            {d.note && <p className="mt-3 text-xs text-amber-700">{d.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
