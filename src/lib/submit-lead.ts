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
        nationality: "Bangladeshi",
        nidNumber: "",
        passportNumber: "PLACEHOLDER",
        passportExpiry: "2030-12-31",
        maritalStatus: "SINGLE",
        currentAddress: "Not provided",
        
        destinationCountry: (data as any).destinationCountry || "Not specified",
        applicationType: (data as any).applicationType || "Not specified",
        specificProgram: "",
        targetApplicationDate: "",
        priorApplications: false,
        priorRefusals: false,
        refusalDetails: "",

        employmentProfile: {
          employmentStatus: "UNEMPLOYED",
          currentEmployer: "",
          jobTitle: "",
          employmentSince: "",
          monthlyIncome: 0,
          businessName: "",
          businessType: "",
          businessSince: "",
          annualRevenue: 0,
          institution: "",
          fieldOfStudy: "",
          expectedGraduation: "",
        },

        financialProfile: {
          currentBankBalance: 0,
          hasSponsor: false,
          sponsorRelationship: "",
          sponsorContribution: 0,
          sourceOfFunds: "Personal savings",
          unusualDeposits: false,
          unusualDepositDetails: "",
        },

        travelHistory: [],

        homeCountryTies: {
          applicationPurpose: (data as any).message || "Quick enquiry submitted",
          familyInBangladesh: true,
          familyDetails: "",
          ownsProperty: false,
          propertyDetails: "",
          intentToReturn: "To return to Bangladesh",
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
    } else if (data.formType === "marriage") {
      // Marriage quick enquiry - submit directly to matrimonial profiles
      const marriageQuickPayload = {
        fullName: data.name,
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        height: 170,
        maritalStatus: "SINGLE",
        currentNationality: "Bangladeshi",
        currentCountry: (data as any).currentLocation || "Bangladesh",
        currentCity: (data as any).currentLocation?.split(",")[0] || "Dhaka",
        motherTongue: "Bengali",
        languagesSpoken: ["Bengali", "English"],
        
        fatherOccupation: "Not provided",
        motherOccupation: "Not provided",
        siblingsCount: 0,
        siblingsMarried: 0,
        familyType: "NUCLEAR",
        familyLocation: "Bangladesh",
        familyDescription: "",
        
        educationLevel: "Not provided",
        currentProfession: "Not provided",
        
        religion: "Islam",
        religiousPractice: "Moderate",
        ethnicity: "Bengali",
        
        dietaryPreference: "Halal",
        smokingHabits: "Non-smoker",
        drinkingHabits: "No",
        hobbies: "",
        
        email: data.contact,
        phone: data.contact.includes("@") ? (data as any).phone || "0000000000" : data.contact,
        preferredContactMethod: "Email",
        
        partnerPreference: {
          ageMin: 20,
          ageMax: 40,
          preferredLocations: ["Bangladesh", "UK", "USA", "Canada"],
          religiousPreference: "Islam",
          otherPreferences: (data as any).background || "Open to discussion",
          dealbreakers: "",
        },
      };

      const backendUrl = "https://pioneer-backend-5qhe.onrender.com/api/v1";
      const res = await fetch(`${backendUrl}/matrimonial/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marriageQuickPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[Marriage Quick Enquiry Submit] Response status:", res.status);

      if (res.ok) {
        return { ok: true };
      } else {
        console.error("[Marriage Quick Enquiry Submit] Error response status:", res.status);
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
