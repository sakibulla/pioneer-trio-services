import { z } from "zod";

// Section A: Personal & Identity (NO complexion field per Section 8.1)
export const sectionASchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], { error: "Gender is required" }),
  height: z.string().optional(),
  bloodGroup: z.string().optional(),
  maritalStatus: z.enum(["never-married", "divorced", "widowed"], {
    error: "Marital status is required",
  }),
  nationality: z.string().min(2, "Nationality is required"),
  currentCountry: z.string().min(2, "Current country is required"),
  currentCity: z.string().min(2, "Current city is required"),
  visaStatus: z.string().optional(),
  motherTongue: z.string().min(2, "Mother tongue is required"),
  languagesSpoken: z.string().optional(),
});

// Section B: Family Background
export const sectionBSchema = z.object({
  fatherOccupation: z.string().min(2, "Father's occupation is required"),
  motherOccupation: z.string().min(2, "Mother's occupation is required"),
  siblingsCount: z.string().optional(),
  siblingsMarried: z.string().optional(),
  familyType: z.enum(["nuclear", "joint"], { error: "Family type is required" }),
  familyLocation: z.string().min(2, "Family's current location is required"),
  familyDescription: z.string().optional(),
});

// Section C: Education & Profession
export const sectionCSchema = z.object({
  highestEducation: z.string().min(2, "Highest education level is required"),
  institution: z.string().min(2, "Institution is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  currentProfession: z.string().min(2, "Current profession/job title is required"),
  employer: z.string().optional(),
  incomeBracket: z.string().optional(),
});

// Section D: Religious & Cultural Background
export const sectionDSchema = z.object({
  religion: z.string().min(2, "Religion is required"),
  sect: z.string().optional(),
  religiousPractice: z.string().optional(),
  ethnicity: z.string().optional(),
});

// Section E: Lifestyle
export const sectionESchema = z.object({
  dietaryPreference: z.string().optional(),
  smokingHabits: z.enum(["no", "occasionally", "regularly", "prefer-not-say"], {
    error: "This field is required",
  }),
  drinkingHabits: z.enum(["no", "occasionally", "socially", "prefer-not-say"], {
    error: "This field is required",
  }),
  hobbiesInterests: z.string().optional(),
});

// Section F: Partner Preferences
export const sectionFSchema = z.object({
  preferredAgeMin: z.string().optional(),
  preferredAgeMax: z.string().optional(),
  preferredLocations: z.string().optional(),
  preferredEducation: z.string().optional(),
  preferredProfession: z.string().optional(),
  religiousPracticePreference: z.string().optional(),
  mustHaves: z.string().optional(),
  dealbreakers: z.string().optional(),
});

// Section G: Photos - Hard cap of 2 enforced in component
// Note: In production, this would be file uploads, not text fields
export const sectionGSchema = z.object({
  photoCount: z.number().max(2, "Maximum 2 photos allowed"),
});

// Section H: Verification & Consent
export const sectionHSchema = z.object({
  governmentIdUploaded: z.boolean().refine((val) => val === true, {
    message: "Government ID upload is required for verification",
  }),
  consentInterview: z.boolean().refine((val) => val === true, {
    message: "You must consent to the mandatory intake interview",
  }),
  relationshipIntent: z.boolean().refine((val) => val === true, {
    message: "You must declare genuine marriage intent",
  }),
  consentDataProcessing: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to proceed",
  }),
  eSignature: z.string().min(2, "Full name is required as e-signature"),
});

// Section I: Interview Scheduling
export const sectionISchema = z.object({
  preferredContactMethod: z.enum(["phone", "whatsapp", "video", "email"], {
    error: "Preferred contact method is required",
  }),
  contactNumber: z.string().min(1, "Contact number is required"),
  email: z.string().email("Valid email is required"),
  availabilityNotes: z.string().optional(),
});

// Complete Marriage Profile Schema
export const marriageProfileSchema = z.object({
  formType: z.literal("marriage-profile"),
  sectionA: sectionASchema,
  sectionB: sectionBSchema,
  sectionC: sectionCSchema,
  sectionD: sectionDSchema,
  sectionE: sectionESchema,
  sectionF: sectionFSchema,
  sectionG: sectionGSchema,
  sectionH: sectionHSchema,
  sectionI: sectionISchema,
});

export type MarriageProfile = z.infer<typeof marriageProfileSchema>;
