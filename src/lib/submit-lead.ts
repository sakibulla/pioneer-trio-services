import type { Lead } from "@/lib/lead-schema";

export async function submitLead(data: Lead): Promise<{ ok: boolean }> {
  const res = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return { ok: false };
  return res.json();
}
