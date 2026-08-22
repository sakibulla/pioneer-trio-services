import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { notifyLead } from "@/lib/lead-notify";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form and try again." },
      { status: 422 }
    );
  }

  // Logged unconditionally so nothing is silently dropped, even if email
  // delivery below is unconfigured or fails.
  console.log("[lead]", JSON.stringify(parsed.data));

  // Best-effort email to the relevant service-line inbox (Section 10: "website
  // forms should feed directly into" the CRM pipeline). No-ops until
  // RESEND_API_KEY / *_INBOX_EMAIL / LEAD_FROM_EMAIL are set — see .env.example.
  await notifyLead(parsed.data);

  return NextResponse.json({ ok: true });
}
