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

  // Get auth token from headers
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Logged unconditionally so nothing is silently dropped, even if email
  // delivery below is unconfigured or fails.
  console.log("[lead]", JSON.stringify(parsed.data));

  // Forward submission to backend server
  try {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://pioneer-backend-5qhe.onrender.com/api/v1";
    const data = parsed.data;
    
    // If it's an immigration quick enquiry, create a case in the database
    if (data.formType === "immigration") {
      const quickEnquiryPayload = {
        fullName: data.name,
        email: data.contact,
        phone: (data as any).phone || "00000",
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        nationality: "Bangladeshi",
        nidNumber: "",
        passportNumber: "PLACEHOLDER",
        passportExpiry: "2030-12-31",
        maritalStatus: "SINGLE",
        currentAddress: "TBD",
        
        destinationCountry: (data as any).destinationCountry || "TBD",
        applicationType: (data as any).applicationType || "TBD",
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
          applicationPurpose: (data as any).message || "Quick enquiry",
          familyInBangladesh: true,
          familyDetails: "",
          ownsProperty: false,
          propertyDetails: "",
          intentToReturn: "Undecided",
        },
      };

      // Submit directly to backend API
      try {
        const response = await fetch(`${backendUrl}/immigration/assessments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quickEnquiryPayload),
        });
        
        if (response.ok) {
          const result = await response.json();
          const caseId = result.data?.id || result.id;
          if (caseId) {
            console.log("[lead-assessment-created]", caseId);
            return NextResponse.json({ ok: true, caseId });
          }
        } else {
          console.warn("[lead-assessment-error]", response.status, await response.text());
        }
      } catch (err) {
        console.error("[lead-assessment-error]", err);
      }
    } else if (data.formType === "marriage") {
      // Marriage quick enquiry - create matrimonial profile
      const locationParts = ((data as any).currentLocation || "Bangladesh").split(",").map((s: string) => s.trim());
      const country = locationParts[0] || "Bangladesh";
      const city = locationParts[1] || locationParts[0] || "Dhaka";

      const matrimonyPayload = {
        fullName: data.name,
        dateOfBirth: "1990-01-01",
        gender: "MALE",
        maritalStatus: "SINGLE",
        currentCountry: country,
        currentCity: city,
        motherTongue: "Bengali",
        languagesSpoken: ["Bengali"],
        
        fatherOccupation: "Professional",
        motherOccupation: "Homemaker",
        familyType: "NUCLEAR",
        familyLocation: "BD",
        
        educationLevel: "Graduate",
        currentProfession: "Professional",
        
        religion: "Islam",
        religiousPractice: "Moderate",
        
        dietaryPreference: "Halal",
        smokingHabits: "No",
        drinkingHabits: "No",
        
        email: data.contact,
        phone: (data as any).phone || "00000",
        
        bloodGroup: "B+",
        visaStatus: "Citizen",
        siblingsCount: 1,
        siblingsMarried: 0,
        familyDescription: "",
        
        institution: "Unspecified",
        fieldOfStudy: "General",
        jobTitle: "Professional",
        employer: "Private",
        incomeBracket: "Moderate",
        
        sect: "Sunni",
        ethnicity: "Bengali",
        
        hobbies: "",
        preferredContactMethod: "Email",
        
        partnerPreference: {
          ageMin: 20,
          ageMax: 40,
          preferredLocations: [country || "Bangladesh"],
          preferredEducation: "Graduate",
          preferredProfession: "Professional",
          religiousPreference: "Islam",
          otherPreferences: (data as any).background || "Compatible match",
          dealbreakers: "",
        },
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${backendUrl}/matrimonial/profiles`, {
          method: "POST",
          headers,
          body: JSON.stringify(matrimonyPayload),
        });
        
        if (response.ok) {
          const result = await response.json();
          const profileId = result.data?.id || result.id;
          if (profileId) {
            console.log("[lead-matrimony-created]", profileId);
            return NextResponse.json({ ok: true, profileId });
          }
        } else {
          console.warn("[lead-matrimony-error]", response.status, await response.text());
        }
      } catch (err) {
        console.error("[lead-matrimony-error]", err);
      }
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
