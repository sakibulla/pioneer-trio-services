"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import clsx from "clsx";
import type { Resource, ResourceCategory } from "@/data/resources";

const categoryLabel: Record<ResourceCategory, string> = {
  immigration: "Immigration",
  marriage: "Marriage",
};

const categoryTone: Record<ResourceCategory, string> = {
  immigration: "bg-immigration-100 text-immigration-700",
  marriage: "bg-marriage-100 text-marriage-700",
};

export function ResourcesExplorer({ resources }: { resources: Resource[] }) {
  const [category, setCategory] = useState<"all" | ResourceCategory>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesCategory = category === "all" || r.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        r.countryTag?.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [resources, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "immigration", "marriage"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-stone-300 text-stone-700 hover:border-brand-300"
              )}
            >
              {c === "all" ? "All guides" : categoryLabel[c]}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            className="w-full rounded-full border border-stone-300 py-2 pr-4 pl-9 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <Link
            key={r.slug}
            href={`/resources/${r.slug}`}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-semibold", categoryTone[r.category])}>
                {categoryLabel[r.category]}
              </span>
              {r.countryTag && (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {r.countryTag}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-bold text-stone-900">{r.title}</h3>
            <p className="mt-2 flex-1 text-sm text-stone-600">{r.excerpt}</p>
            <p className="mt-4 text-xs font-medium text-stone-400">{r.readTime}</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-stone-500">No guides match your search yet.</p>
        )}
      </div>
    </div>
  );
}
