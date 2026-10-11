import { NextResponse } from "next/server";
import { marriageProfileSchema } from "@/lib/marriage-profile-schema";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = marriageProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please verify all required fields in the profile form.", details: parsed.error.format() },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Map frontend form schema to backend database model
  const backendPayload = {
    fullName: data.sectionA.fullName,
    dateOfBirth: data.sectionA.dateOfBirth,
    gender: data.sectionA.gender.toUpperCase(),
    height: data.sectionA.height ? parseInt(data.sectionA.height.replace(/[^0-9]/g, "")) || 170 : 170,
    bloodGroup: data.sectionA.bloodGroup || null,
    maritalStatus: data.sectionA.maritalStatus === "never-married" ? "SINGLE" : data.sectionA.maritalStatus.toUpperCase(),
    currentNationality: data.sectionA.nationality,
    currentCountry: data.sectionA.currentCountry,
    currentCity: data.sectionA.currentCity,
    visaStatus: data.sectionA.visaStatus || null,
    motherTongue: data.sectionA.motherTongue,
    languagesSpoken: data.sectionA.languagesSpoken ? data.sectionA.languagesSpoken.split(",").map((s) => s.trim()) : ["Bengali", "English"],

    fatherOccupation: data.sectionB.fatherOccupation,
    motherOccupation: data.sectionB.motherOccupation,
    siblingsCount: data.sectionB.siblingsCount ? parseInt(data.sectionB.siblingsCount) || 0 : 0,
    siblingsMarried: data.sectionB.siblingsMarried ? parseInt(data.sectionB.siblingsMarried) || 0 : 0,
    familyType: data.sectionB.familyType.toUpperCase(),
    familyLocation: data.sectionB.familyLocation,
    familyDescription: data.sectionB.familyDescription || null,

    educationLevel: data.sectionC.highestEducation,
    institution: data.sectionC.institution,
    fieldOfStudy: data.sectionC.fieldOfStudy,
    currentProfession: data.sectionC.currentProfession,
    employer: data.sectionC.employer || null,
    incomeBracket: data.sectionC.incomeBracket || null,

    religion: data.sectionD.religion,
    sect: data.sectionD.sect || null,
    religiousPractice: data.sectionD.religiousPractice || "Practicing",
    ethnicity: data.sectionD.ethnicity || "Bengali",

    dietaryPreference: data.sectionE.dietaryPreference || "Halal",
    smokingHabits: data.sectionE.smokingHabits,
    drinkingHabits: data.sectionE.drinkingHabits,
    hobbies: data.sectionE.hobbiesInterests || null,

    email: data.sectionI.email,
    phone: data.sectionI.contactNumber,
    preferredContactMethod: data.sectionI.preferredContactMethod,

    partnerPreference: {
      ageMin: data.sectionF.preferredAgeMin ? parseInt(data.sectionF.preferredAgeMin) || 20 : 20,
      ageMax: data.sectionF.preferredAgeMax ? parseInt(data.sectionF.preferredAgeMax) || 35 : 35,
      preferredLocations: data.sectionF.preferredLocations ? data.sectionF.preferredLocations.split(",").map((s) => s.trim()) : ["Bangladesh"],
      preferredEducation: data.sectionF.preferredEducation || null,
      dealbreakers: data.sectionF.dealbreakers || null,
    },
  };

  // Forward to Express Backend
  try {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api/v1";
    
    console.log("[matrimonial-profile] Sending to backend:", JSON.stringify(backendPayload, null, 2));
    
    const res = await fetch(`${backendUrl}/matrimonial/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
    });

    if (res.ok) {
      const responseData = await res.json();
      return NextResponse.json({ ok: true, data: responseData.data });
    } else {
      console.error("[matrimonial-backend-error] Status:", res.status);
      const errorData = await res.json().catch(() => ({}));
      console.error("[matrimonial-backend-error] Response:", JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { ok: false, error: errorData.message || "Backend error", details: errorData.errors },
        { status: res.status }
      );
    }
  } catch (backendError) {
    console.error("[matrimonial-backend-forward-error]", backendError);
    return NextResponse.json(
      { ok: false, error: "Failed to reach backend service. Please try again later." },
      { status: 503 }
    );
  }
}
