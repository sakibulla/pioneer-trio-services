import type { Lead } from "@/lib/lead-schema";
import { portalApi } from "@/lib/portal-api";

export async function submitLead(data: Lead): Promise<{ ok: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    // Get token from localStorage
    const token = portalApi.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Submit through Vercel API which forwards to backend
    const res = await fetch("/api/lead", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("[Lead Submit] Response status:", res.status);

    if (!res.ok) {
      console.error("[Lead Submit] Error response status:", res.status);
      return { ok: false };
    }

    return res.json();
  } catch (err: any) {
    console.error("[Submit Lead] Error:", err);
    if (err.name === 'AbortError') {
      console.error("[Submit Lead] Request timed out");
    }
    return { ok: false };
  }
}
