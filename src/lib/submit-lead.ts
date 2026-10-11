import type { Lead } from "@/lib/lead-schema";

export async function submitLead(data: Lead): Promise<{ ok: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    // If it's an immigration quick enquiry, submit directly to backend API (CORS enabled)
    if (data.formType === "immigration") {
      const quickEnquiryPayload = {
        fullName: data.name,
        email: data.contact,
        phone: (data as any).phone || "0000000000",
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        nationality: "Bangladesh",
        nidNumber: null,
        passportNumber: "PLACEHOLDER",
        passportExpiry: "2030-12-31",
        maritalStatus: "NEVER_MARRIED",
        currentAddress: "Not provided",
        
        destinationCountry: (data as any).destinationCountry || "Not specified",
        applicationType: (data as any).applicationType || "Not specified",
        specificProgram: null,
        targetApplicationDate: null,
        priorApplications: false,
        priorRefusals: false,
        refusalDetails: null,

        employmentProfile: {
          employmentStatus: "UNEMPLOYED",
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

      // Submit directly to backend API (CORS enabled)
      const backendUrl = "https://pioneer-backend-5qhe.onrender.com/api/v1";
      const res = await fetch(`${backendUrl}/immigration/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickEnquiryPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[Quick Enquiry Submit] Response status:", res.status);

      if (res.ok) {
        return { ok: true };
      } else {
        console.error("[Quick Enquiry Submit] Error response status:", res.status);
        return { ok: false };
      }
    } else {
      // For other form types, submit through Vercel API
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) return { ok: false };
      return res.json();
    }
  } catch (err: any) {
    console.error("[Submit Lead] Error:", err);
    if (err.name === 'AbortError') {
      console.error("[Submit Lead] Request timed out");
    }
    return { ok: false };
  }
}
