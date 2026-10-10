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

  // Forward submission to backend server
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000/api/v1";
    const data = parsed.data;
    
    // Only forward if it's not a notify lead (which doesn't have name/email)
    if (data.formType !== "notify") {
      await fetch(`${backendUrl}/contact/general`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.contact,
          phone: (data as any).phone || "",
          serviceLine: data.formType || "general",
          subject: `Website Lead: ${(data as any).interest || (data as any).destinationCountry || "General Inquiry"}`,
          message: (data as any).message || (data as any).background || (data as any).notes || "Lead submitted via Pioneer Trio website form.",
        }),
      });
    }
  } catch (backendError) {
    console.warn("[lead-backend-forward-warning]", backendError);
  }

  return NextResponse.json({ ok: true });
}
