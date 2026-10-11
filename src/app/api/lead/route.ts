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
    
    // If it's an immigration quick enquiry, create a case in the database
    if (data.formType === "immigration") {
      const quickEnquiryPayload = {
        fullName: data.name,
        email: data.contact,
        phone: "",
        dateOfBirth: "",
        gender: "MALE", // Use valid enum
        nationality: "Bangladesh",
        nidNumber: null,
        passportNumber: "",
        passportExpiry: "",
        maritalStatus: "NEVER_MARRIED", // Use valid enum
        currentAddress: "",
        
        destinationCountry: (data as any).destinationCountry || "Not specified",
        applicationType: (data as any).applicationType || "Not specified",
        specificProgram: null,
        targetApplicationDate: null,
        priorApplications: false,
        priorRefusals: false,
        refusalDetails: null,

        employmentProfile: {
          employmentStatus: "UNEMPLOYED", // Use valid enum
          currentEmployer: null,
          jobTitle: null,
          monthlyIncome: 0,
          businessName: null,
          businessType: null,
        },

        financialProfile: {
          currentBankBalance: 0,
          hasSponsor: false,
          sponsorRelationship: null,
          sourceOfFunds: "Personal savings",
          unusualDeposits: false,
          unusualDepositDetails: null,
        },

        travelHistory: [],

        homeCountryTies: {
          applicationPurpose: (data as any).message || "Quick enquiry submitted",
          familyInBangladesh: false,
          familyDetails: null,
          ownsProperty: false,
          propertyDetails: null,
          intentToReturn: "Not specified",
        },
      };

      await fetch(`${backendUrl}/immigration/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickEnquiryPayload),
      });
    } else if (data.formType !== "notify") {
      // For other form types, forward to contact/general
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
