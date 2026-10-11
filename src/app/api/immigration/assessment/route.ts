import { NextResponse } from "next/server";
import { immigrationAssessmentSchema } from "@/lib/immigration-assessment-schema";

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST instead." },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = immigrationAssessmentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please verify all fields in the 8 sections.", details: parsed.error.format() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Map frontend form schema to backend schema
  const backendPayload = {
    fullName: data.sectionA.fullLegalName,
    email: data.sectionA.email,
    phone: data.sectionA.phoneNumber,
    dateOfBirth: data.sectionA.dateOfBirth,
    gender: data.sectionA.gender.toUpperCase(),
    nationality: data.sectionA.nationality,
    ...(data.sectionA.nidNumber && { nidNumber: data.sectionA.nidNumber }),
    passportNumber: data.sectionA.passportNumber,
    passportExpiry: data.sectionA.passportExpiry,
    maritalStatus: data.sectionA.maritalStatus.toUpperCase(),
    currentAddress: data.sectionA.currentAddress,

    destinationCountry: data.sectionB.destinationCountry,
    applicationType: data.sectionB.applicationType,
    ...(data.sectionB.specificProgram && { specificProgram: data.sectionB.specificProgram }),
    ...(data.sectionB.targetDate && { targetApplicationDate: data.sectionB.targetDate }),
    priorApplications: data.sectionB.appliedBefore === "yes",
    priorRefusals: data.sectionE.previousRefusal === "yes",
    ...(data.sectionE.refusalDetails || data.sectionB.appliedBeforeOutcome ? { refusalDetails: data.sectionE.refusalDetails || data.sectionB.appliedBeforeOutcome } : {}),

    employmentProfile: {
      employmentStatus: data.sectionC.employmentStatus.toUpperCase().replace("-", "_"),
      ...(data.sectionC.employerName && { currentEmployer: data.sectionC.employerName }),
      ...(data.sectionC.jobTitle && { jobTitle: data.sectionC.jobTitle }),
      ...(data.sectionC.monthlyIncome && { monthlyIncome: Number(data.sectionC.monthlyIncome) }),
      ...(data.sectionC.businessName && { businessName: data.sectionC.businessName }),
      ...(data.sectionC.businessType && { businessType: data.sectionC.businessType }),
    },

    financialProfile: {
      currentBankBalance: data.sectionD.bankBalance ? Number(data.sectionD.bankBalance.replace(/[^0-9.]/g, "")) || 100000 : 100000,
      hasSponsor: data.sectionD.hasSponsor === "yes",
      ...(data.sectionD.sponsorRelationship && { sponsorRelationship: data.sectionD.sponsorRelationship }),
      sourceOfFunds: data.sectionD.fundsSource || "Personal savings",
      unusualDeposits: data.sectionD.unusualDeposits === "yes",
      ...(data.sectionD.unusualDepositsNotes && { unusualDepositDetails: data.sectionD.unusualDepositsNotes }),
    },

    travelHistory: data.sectionE.countriesVisited
      ? [
          {
            country: data.sectionE.countriesVisited || "Not specified",
            visitPurpose: "International Travel",
            visitDate: new Date().toISOString(),
            hadRefusal: data.sectionE.previousRefusal === "yes",
            ...(data.sectionE.refusalDetails && { refusalReason: data.sectionE.refusalDetails }),
          },
        ]
      : [],

    homeCountryTies: {
      applicationPurpose: data.sectionF.applicationPurpose || "Employment",
      familyInBangladesh: true,
      ...(data.sectionF.familyInBangladesh && { familyDetails: data.sectionF.familyInBangladesh }),
      ownsProperty: data.sectionF.ownProperty === "yes",
      ...(data.sectionF.propertyDetails && { propertyDetails: data.sectionF.propertyDetails }),
      intentToReturn: data.sectionF.intendToReturn || "Committed to ongoing family ties in Bangladesh",
    },
  };

  // Forward to Express Backend
  try {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";
    
    console.log("[immigration-assessment] Sending to backend:", JSON.stringify(backendPayload, null, 2));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for full assessment
    
    const res = await fetch(`${backendUrl}/immigration/assessments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const responseData = await res.json();
      return NextResponse.json({ ok: true, data: responseData.data });
    } else {
      // Backend returned an error
      console.error("[immigration-backend-error] Status:", res.status);
      const errorData = await res.json().catch(() => ({}));
      console.error("[immigration-backend-error] Response:", JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { ok: false, error: errorData.message || "Backend error", details: errorData.errors },
        { status: res.status }
      );
    }
  } catch (backendError: any) {
    console.error("[immigration-backend-forward-error]", backendError);
    
    // Return proper error response instead of fake success
    if (backendError.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Backend service is taking too long to respond. Please try again later." },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { ok: false, error: "Failed to reach backend service. Please try again later." },
      { status: 503 }
    );
  }
}
