import { z } from "zod";

// Section A: Applicant & Identity Details
export const sectionASchema = z.object({
  fullLegalName: z.string().min(2, "Full legal name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { error: "Gender is required" }),
  nationality: z.string().min(2, "Nationality is required"),
  nidNumber: z.string().optional(),
  passportNumber: z.string().min(1, "Passport number is required"),
  passportExpiry: z.string().min(1, "Passport expiry date is required"),
  previousPassport: z.enum(["yes", "no"]),
  previousPassportDetails: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"], {
    error: "Marital status is required",
  }),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  currentAddress: z.string().min(10, "Current address is required"),
});

// Section B: Immigration Goal
export const sectionBSchema = z.object({
  destinationCountry: z.string().min(1, "Destination country is required"),
  applicationType: z.enum(
    ["study", "skilled-work", "family-sponsorship", "visit", "overseas-labour"],
    { error: "Application type is required" }
  ),
  targetDate: z.string().optional(),
  appliedBefore: z.enum(["yes", "no"], { error: "This field is required" }),
  appliedBeforeOutcome: z.string().optional(),
  specificProgram: z.string().optional(),
});

// Section C: Employment & Business Background
export const sectionCSchema = z.object({
  employmentStatus: z.enum(["employed", "self-employed", "student", "unemployed"], {
    error: "Employment status is required",
  }),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentLength: z.string().optional(),
  monthlyIncome: z.string().optional(),
  currency: z.string().optional(),
  businessName: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  businessType: z.string().optional(),
});

// Section D: Financial Snapshot
export const sectionDSchema = z.object({
  bankBalance: z.string().min(1, "Approximate bank balance is required"),
  financialCurrency: z.string().min(1, "Currency is required"),
  hasSponsor: z.enum(["yes", "no"], { error: "This field is required" }),
  sponsorName: z.string().optional(),
  sponsorRelationship: z.string().optional(),
  fundsSource: z.string().min(1, "Primary source of funds is required"),
  unusualDeposits: z.enum(["yes", "no"]),
  unusualDepositsNotes: z.string().optional(),
});

// Section E: Travel History
export const sectionESchema = z.object({
  traveledBefore: z.enum(["yes", "no"], { error: "This field is required" }),
  countriesVisited: z.string().optional(),
  previousRefusal: z.enum(["yes", "no"], { error: "This field is required" }),
  refusalDetails: z.string().optional(),
});

// Section F: Purpose & Home-Country Ties
export const sectionFSchema = z.object({
  applicationPurpose: z.string().min(20, "Please describe your purpose in detail"),
  familyInBangladesh: z.string().min(10, "Please describe your family ties"),
  ownProperty: z.enum(["yes", "no"]),
  propertyDetails: z.string().optional(),
  intendToReturn: z.string().optional(),
});

// Section G: Document Readiness Self-Check
export const sectionGSchema = z.object({
  hasValidPassport: z.boolean(),
  hasNID: z.boolean(),
  hasEmploymentProof: z.boolean(),
  hasBankStatements: z.boolean(),
});

// Section H: Consent & Declaration
export const sectionHSchema = z.object({
  consentDataProcessing: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to proceed",
  }),
  understandNoGuarantee: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge this to proceed",
  }),
  confirmTruthful: z.boolean().refine((val) => val === true, {
    message: "You must confirm the information is truthful",
  }),
  eSignature: z.string().min(2, "Full name is required as e-signature"),
});

// Complete Immigration Assessment Schema
export const immigrationAssessmentSchema = z.object({
  formType: z.literal("immigration-assessment"),
  sectionA: sectionASchema,
  sectionB: sectionBSchema,
  sectionC: sectionCSchema,
  sectionD: sectionDSchema,
  sectionE: sectionESchema,
  sectionF: sectionFSchema,
  sectionG: sectionGSchema,
  sectionH: sectionHSchema,
});

export type ImmigrationAssessment = z.infer<typeof immigrationAssessmentSchema>;
