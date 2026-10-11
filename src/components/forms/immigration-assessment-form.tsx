"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  immigrationAssessmentSchema,
  type ImmigrationAssessment,
  sectionASchema,
  sectionBSchema,
  sectionCSchema,
  sectionDSchema,
  sectionESchema,
  sectionFSchema,
  sectionGSchema,
  sectionHSchema,
} from "@/lib/immigration-assessment-schema";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";

const TOTAL_STEPS = 8;

interface ImmigrationAssessmentFormProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function ImmigrationAssessmentForm({ user }: ImmigrationAssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved inquiry data from sessionStorage or use logged-in user info
  const getSavedInquiryData = () => {
    // If user is logged in, pre-fill with their info
    if (user) {
      return {
        sectionA: {
          fullLegalName: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
        },
      };
    }

    // Otherwise try to load from sessionStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("immigrationInquiry");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return {
            sectionA: {
              email: data.contact?.split(" ")[0] === data.contact ? data.contact : "", // Extract email if it's an email
            },
            sectionB: {
              destinationCountry: data.destinationCountry || "",
              applicationType: data.applicationType || "",
            },
          };
        } catch {
          return {};
        }
      }
    }
    return {};
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ImmigrationAssessment>({
    resolver: zodResolver(immigrationAssessmentSchema),
    mode: "onChange",
    defaultValues: {
      formType: "immigration-assessment",
      ...getSavedInquiryData(),
    },
  });

  const watchPreviousPassport = watch("sectionA.previousPassport");
  const watchAppliedBefore = watch("sectionB.appliedBefore");
  const watchEmploymentStatus = watch("sectionC.employmentStatus");
  const watchHasSponsor = watch("sectionD.hasSponsor");
  const watchUnusualDeposits = watch("sectionD.unusualDeposits");
  const watchTraveledBefore = watch("sectionE.traveledBefore");
  const watchPreviousRefusal = watch("sectionE.previousRefusal");
  const watchOwnProperty = watch("sectionF.ownProperty");
  const watchApplicationType = watch("sectionB.applicationType");

  const onSubmit = async (data: ImmigrationAssessment) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      // Submit directly to backend API (CORS enabled)
      const backendUrl = "https://pioneer-backend-5qhe.onrender.com/api/v1";
      const res = await fetch(`${backendUrl}/immigration/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log("[Assessment Submit] Response status:", res.status);
      
      if (res.ok) {
        setSubmitted(true);
        // Clear session storage after successful submission
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("immigrationInquiry");
        }
      } else {
        let msg = "Submission failed. Please try again.";
        try {
          const json = await res.json();
          console.error("[Assessment Submit] Error response:", json);
          if (json?.error) msg = json.error;
        } catch { /* ignore */ }
        setSubmitError(msg);
      }
    } catch (err: any) {
      console.error("[Assessment Submit] Error:", err);
      if (err.name === 'AbortError') {
        setSubmitError("Request timed out. The server took too long to respond. Please try again.");
      } else {
        setSubmitError("A network error occurred. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-immigration-200 bg-immigration-50 p-6 text-immigration-900">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-immigration-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">Your initial assessment is complete!</p>
          <p className="mt-1 text-sm text-immigration-800">
            A coordinator will review your submission and follow up within one business day at the
            contact you provided.
          </p>
        </div>
      </div>
    );
  }

  const nextStep = async () => {
    // Define fields to validate for each step
    const fieldsToValidate: Record<
      number,
      Array<keyof ImmigrationAssessment>
    > = {
      1: [
        "sectionA.fullLegalName" as keyof ImmigrationAssessment,
        "sectionA.dateOfBirth" as keyof ImmigrationAssessment,
        "sectionA.gender" as keyof ImmigrationAssessment,
        "sectionA.nationality" as keyof ImmigrationAssessment,
        "sectionA.passportNumber" as keyof ImmigrationAssessment,
        "sectionA.passportExpiry" as keyof ImmigrationAssessment,
        "sectionA.previousPassport" as keyof ImmigrationAssessment,
        "sectionA.maritalStatus" as keyof ImmigrationAssessment,
        "sectionA.phoneNumber" as keyof ImmigrationAssessment,
        "sectionA.email" as keyof ImmigrationAssessment,
        "sectionA.currentAddress" as keyof ImmigrationAssessment,
      ],
      2: [
        "sectionB.destinationCountry" as keyof ImmigrationAssessment,
        "sectionB.applicationType" as keyof ImmigrationAssessment,
        "sectionB.appliedBefore" as keyof ImmigrationAssessment,
      ],
      3: ["sectionC.employmentStatus" as keyof ImmigrationAssessment],
      4: [
        "sectionD.bankBalance" as keyof ImmigrationAssessment,
        "sectionD.financialCurrency" as keyof ImmigrationAssessment,
        "sectionD.hasSponsor" as keyof ImmigrationAssessment,
        "sectionD.fundsSource" as keyof ImmigrationAssessment,
        "sectionD.unusualDeposits" as keyof ImmigrationAssessment,
      ],
      5: [
        "sectionE.traveledBefore" as keyof ImmigrationAssessment,
        "sectionE.previousRefusal" as keyof ImmigrationAssessment,
      ],
      6: [
        "sectionF.applicationPurpose" as keyof ImmigrationAssessment,
        "sectionF.familyInBangladesh" as keyof ImmigrationAssessment,
        "sectionF.ownProperty" as keyof ImmigrationAssessment,
      ],
      7: [],
    };

    const isValid = await trigger(fieldsToValidate[currentStep] || []);
    if (isValid && currentStep < TOTAL_STEPS) {
      setSubmitError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setSubmitError(null);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-immigration-700">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-stone-600">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-200">
          <div
            className="h-2 rounded-full bg-immigration-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
        <input type="hidden" {...register("formType")} />

        {/* Section A: Applicant & Identity Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Applicant & Identity Details</h3>
              <p className="mt-1 text-sm text-stone-600">
                All information must match your passport exactly.
              </p>
            </div>

            <Field
              label="Full legal name (as on passport)"
              htmlFor="fullLegalName"
              error={errors.sectionA?.fullLegalName?.message}
            >
              <TextInput id="fullLegalName" {...register("sectionA.fullLegalName")} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Date of birth"
                htmlFor="dateOfBirth"
                error={errors.sectionA?.dateOfBirth?.message}
              >
                <TextInput type="date" id="dateOfBirth" {...register("sectionA.dateOfBirth")} />
              </Field>

              <Field label="Gender" htmlFor="gender" error={errors.sectionA?.gender?.message}>
                <Select id="gender" {...register("sectionA.gender")} defaultValue="">
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Nationality"
                htmlFor="nationality"
                error={errors.sectionA?.nationality?.message}
              >
                <TextInput id="nationality" {...register("sectionA.nationality")} />
              </Field>

              <Field
                label="National ID (NID) number"
                htmlFor="nidNumber"
                error={errors.sectionA?.nidNumber?.message}
                optional
              >
                <TextInput id="nidNumber" {...register("sectionA.nidNumber")} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Current passport number"
                htmlFor="passportNumber"
                error={errors.sectionA?.passportNumber?.message}
              >
                <TextInput id="passportNumber" {...register("sectionA.passportNumber")} />
              </Field>

              <Field
                label="Passport expiry date"
                htmlFor="passportExpiry"
                error={errors.sectionA?.passportExpiry?.message}
              >
                <TextInput type="date" id="passportExpiry" {...register("sectionA.passportExpiry")} />
              </Field>
            </div>

            <Field
              label="Previously held another passport?"
              htmlFor="previousPassport"
              error={errors.sectionA?.previousPassport?.message}
            >
              <Select id="previousPassport" {...register("sectionA.previousPassport")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchPreviousPassport === "yes" && (
              <Field
                label="Previous passport details"
                htmlFor="previousPassportDetails"
                optional
              >
                <TextArea
                  id="previousPassportDetails"
                  rows={2}
                  {...register("sectionA.previousPassportDetails")}
                  placeholder="Passport number, country, expiry date"
                />
              </Field>
            )}

            <Field
              label="Marital status"
              htmlFor="maritalStatus"
              error={errors.sectionA?.maritalStatus?.message}
            >
              <Select id="maritalStatus" {...register("sectionA.maritalStatus")} defaultValue="">
                <option value="" disabled>
                  Select marital status
                </option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </Select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Phone number"
                htmlFor="phoneNumber"
                error={errors.sectionA?.phoneNumber?.message}
              >
                <TextInput id="phoneNumber" {...register("sectionA.phoneNumber")} />
              </Field>

              <Field label="Email" htmlFor="email" error={errors.sectionA?.email?.message}>
                <TextInput type="email" id="email" {...register("sectionA.email")} />
              </Field>
            </div>

            <Field
              label="Current address"
              htmlFor="currentAddress"
              error={errors.sectionA?.currentAddress?.message}
            >
              <TextArea id="currentAddress" rows={3} {...register("sectionA.currentAddress")} />
            </Field>
          </div>
        )}

        {/* Section B: Immigration Goal */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Immigration Goal</h3>
              <p className="mt-1 text-sm text-stone-600">
                Tell us about your immigration plans and timeline.
              </p>
            </div>

            <Field
              label="Destination country"
              htmlFor="destinationCountry"
              error={errors.sectionB?.destinationCountry?.message}
            >
              <Select
                id="destinationCountry"
                {...register("sectionB.destinationCountry")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select destination
                </option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.country}>
                    {d.country}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Application / case type"
              htmlFor="applicationType"
              error={errors.sectionB?.applicationType?.message}
            >
              <Select id="applicationType" {...register("sectionB.applicationType")} defaultValue="">
                <option value="" disabled>
                  Select application type
                </option>
                <option value="study">Study permit / study visa</option>
                <option value="skilled-work">Skilled work / points-based</option>
                <option value="family-sponsorship">Family sponsorship</option>
                <option value="visit">Visit visa</option>
                <option value="overseas-labour">Overseas labour (Gulf/Malaysia)</option>
              </Select>
            </Field>

            <Field
              label="Target travel or intake date"
              htmlFor="targetDate"
              error={errors.sectionB?.targetDate?.message}
              optional
            >
              <TextInput type="date" id="targetDate" {...register("sectionB.targetDate")} />
            </Field>

            <Field
              label="Applied to this destination before?"
              htmlFor="appliedBefore"
              error={errors.sectionB?.appliedBefore?.message}
            >
              <Select id="appliedBefore" {...register("sectionB.appliedBefore")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchAppliedBefore === "yes" && (
              <Field
                label="Outcome of previous application"
                htmlFor="appliedBeforeOutcome"
                error={errors.sectionB?.appliedBeforeOutcome?.message}
              >
                <TextArea
                  id="appliedBeforeOutcome"
                  rows={3}
                  {...register("sectionB.appliedBeforeOutcome")}
                  placeholder="Please disclose any prior refusals, approvals, or pending applications"
                />
              </Field>
            )}

            <Field
              label="Specific program, employer, or school in mind?"
              htmlFor="specificProgram"
              optional
            >
              <TextArea
                id="specificProgram"
                rows={3}
                {...register("sectionB.specificProgram")}
                placeholder="e.g., Express Entry Federal Skilled Worker, University of Toronto Computer Science program, etc."
              />
            </Field>
          </div>
        )}

        {/* Section C: Employment & Business Background */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Employment & Business Background
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                Your current employment or business situation.
              </p>
            </div>

            <Field
              label="Current employment status"
              htmlFor="employmentStatus"
              error={errors.sectionC?.employmentStatus?.message}
            >
              <Select
                id="employmentStatus"
                {...register("sectionC.employmentStatus")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-employed / Business owner</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
              </Select>
            </Field>

            {(watchEmploymentStatus === "employed" || watchEmploymentStatus === "self-employed") && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={
                      watchEmploymentStatus === "employed" ? "Employer name" : "Business name"
                    }
                    htmlFor={watchEmploymentStatus === "employed" ? "employerName" : "businessName"}
                  >
                    {watchEmploymentStatus === "employed" ? (
                      <TextInput id="employerName" {...register("sectionC.employerName")} />
                    ) : (
                      <TextInput id="businessName" {...register("sectionC.businessName")} />
                    )}
                  </Field>

                  <Field
                    label={watchEmploymentStatus === "employed" ? "Job title" : "Trade license no."}
                    htmlFor={watchEmploymentStatus === "employed" ? "jobTitle" : "tradeLicenseNumber"}
                  >
                    {watchEmploymentStatus === "employed" ? (
                      <TextInput id="jobTitle" {...register("sectionC.jobTitle")} />
                    ) : (
                      <TextInput
                        id="tradeLicenseNumber"
                        {...register("sectionC.tradeLicenseNumber")}
                      />
                    )}
                  </Field>
                </div>

                {watchEmploymentStatus === "employed" && (
                  <Field label="Length of current employment" htmlFor="employmentLength" optional>
                    <TextInput
                      id="employmentLength"
                      {...register("sectionC.employmentLength")}
                      placeholder="e.g., 3 years 6 months"
                    />
                  </Field>
                )}

                {watchEmploymentStatus === "self-employed" && (
                  <Field label="Business type / industry" htmlFor="businessType" optional>
                    <TextInput
                      id="businessType"
                      {...register("sectionC.businessType")}
                      placeholder="e.g., Retail, IT Services, Manufacturing"
                    />
                  </Field>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Approximate monthly income" htmlFor="monthlyIncome" optional>
                    <TextInput
                      id="monthlyIncome"
                      {...register("sectionC.monthlyIncome")}
                      placeholder="Amount"
                    />
                  </Field>

                  <Field label="Currency" htmlFor="currency" optional>
                    <Select id="currency" {...register("sectionC.currency")} defaultValue="">
                      <option value="">Select currency</option>
                      <option value="BDT">BDT</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </Select>
                  </Field>
                </div>
              </>
            )}
          </div>
        )}

        {/* Section D: Financial Snapshot */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Financial Snapshot</h3>
              <p className="mt-1 text-sm text-stone-600">
                Help us understand your financial readiness for this application.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Approximate personal bank balance"
                htmlFor="bankBalance"
                error={errors.sectionD?.bankBalance?.message}
              >
                <TextInput id="bankBalance" {...register("sectionD.bankBalance")} />
              </Field>

              <Field
                label="Currency"
                htmlFor="financialCurrency"
                error={errors.sectionD?.financialCurrency?.message}
              >
                <Select
                  id="financialCurrency"
                  {...register("sectionD.financialCurrency")}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select currency
                  </option>
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </Select>
              </Field>
            </div>

            <Field
              label="Do you have a financial sponsor?"
              htmlFor="hasSponsor"
              error={errors.sectionD?.hasSponsor?.message}
            >
              <Select id="hasSponsor" {...register("sectionD.hasSponsor")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchHasSponsor === "yes" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Sponsor name" htmlFor="sponsorName">
                  <TextInput id="sponsorName" {...register("sectionD.sponsorName")} />
                </Field>

                <Field label="Relationship to sponsor" htmlFor="sponsorRelationship">
                  <TextInput
                    id="sponsorRelationship"
                    {...register("sectionD.sponsorRelationship")}
                    placeholder="e.g., Father, Spouse, Uncle"
                  />
                </Field>
              </div>
            )}

            <Field
              label="Primary source of funds"
              htmlFor="fundsSource"
              error={errors.sectionD?.fundsSource?.message}
            >
              <Select id="fundsSource" {...register("sectionD.fundsSource")} defaultValue="">
                <option value="" disabled>
                  Select source
                </option>
                <option value="salary">Salary</option>
                <option value="business-income">Business income</option>
                <option value="property-sale">Property sale</option>
                <option value="family-support">Family support</option>
                <option value="savings">Savings</option>
                <option value="other">Other</option>
              </Select>
            </Field>

            <Field
              label="Any large or unusual deposits in the last 6 months?"
              htmlFor="unusualDeposits"
              error={errors.sectionD?.unusualDeposits?.message}
            >
              <Select id="unusualDeposits" {...register("sectionD.unusualDeposits")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchUnusualDeposits === "yes" && (
              <Field
                label="Please provide details"
                htmlFor="unusualDepositsNotes"
                optional
              >
                <TextArea
                  id="unusualDepositsNotes"
                  rows={2}
                  {...register("sectionD.unusualDepositsNotes")}
                  placeholder="This helps your coordinator prepare your financial documentation properly"
                />
              </Field>
            )}
          </div>
        )}

        {/* Section E: Travel History */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Travel History</h3>
              <p className="mt-1 text-sm text-stone-600">
                Your international travel experience in the last 5 years.
              </p>
            </div>

            <Field
              label="Have you traveled internationally before?"
              htmlFor="traveledBefore"
              error={errors.sectionE?.traveledBefore?.message}
            >
              <Select id="traveledBefore" {...register("sectionE.traveledBefore")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchTraveledBefore === "yes" && (
              <Field
                label="Countries visited in the last 5 years"
                htmlFor="countriesVisited"
                optional
              >
                <TextArea
                  id="countriesVisited"
                  rows={4}
                  {...register("sectionE.countriesVisited")}
                  placeholder="List countries, approximate year, and visa type. Example: India (2022, tourist visa), UAE (2023, employment visa)"
                />
              </Field>
            )}

            <Field
              label="Previous visa refusal, cancellation, or violation?"
              htmlFor="previousRefusal"
              error={errors.sectionE?.previousRefusal?.message}
            >
              <Select id="previousRefusal" {...register("sectionE.previousRefusal")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchPreviousRefusal === "yes" && (
              <Field label="Refusal details (must be disclosed)" htmlFor="refusalDetails">
                <TextArea
                  id="refusalDetails"
                  rows={4}
                  {...register("sectionE.refusalDetails")}
                  placeholder="Country, year, reason for refusal/cancellation/violation, and current status"
                />
              </Field>
            )}
          </div>
        )}

        {/* Section F: Purpose & Home-Country Ties */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Purpose & Home-Country Ties</h3>
              <p className="mt-1 text-sm text-stone-600">
                Help us understand your motivations and connections to Bangladesh.
              </p>
            </div>

            <Field
              label="Purpose of this application, in your own words"
              htmlFor="applicationPurpose"
              error={errors.sectionF?.applicationPurpose?.message}
            >
              <TextArea
                id="applicationPurpose"
                rows={4}
                {...register("sectionF.applicationPurpose")}
                placeholder="Explain why you want to apply and what you hope to achieve"
              />
            </Field>

            <Field
              label="Family members remaining in Bangladesh"
              htmlFor="familyInBangladesh"
              error={errors.sectionF?.familyInBangladesh?.message}
            >
              <TextArea
                id="familyInBangladesh"
                rows={3}
                {...register("sectionF.familyInBangladesh")}
                placeholder="e.g., Parents, spouse, siblings - their relationship to you and current location"
              />
            </Field>

            <Field
              label="Do you own property or a business in Bangladesh?"
              htmlFor="ownProperty"
              error={errors.sectionF?.ownProperty?.message}
            >
              <Select id="ownProperty" {...register("sectionF.ownProperty")} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </Field>

            {watchOwnProperty === "yes" && (
              <Field label="Property or business details" htmlFor="propertyDetails" optional>
                <TextArea
                  id="propertyDetails"
                  rows={2}
                  {...register("sectionF.propertyDetails")}
                  placeholder="Brief description of property or business you own"
                />
              </Field>
            )}

            {watchApplicationType === "visit" && (
              <Field
                label="Do you intend to return after your visit?"
                htmlFor="intendToReturn"
                optional
              >
                <TextArea
                  id="intendToReturn"
                  rows={2}
                  {...register("sectionF.intendToReturn")}
                  placeholder="Please explain your plans to return to Bangladesh"
                />
              </Field>
            )}
          </div>
        )}

        {/* Section G: Document Readiness Self-Check */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Document Readiness Self-Check</h3>
              <p className="mt-1 text-sm text-stone-600">
                Quick check of key documents you currently have in hand.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionG.hasValidPassport")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I have a valid passport (not expiring within 6 months)
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionG.hasNID")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I have my National ID (NID) or equivalent
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionG.hasEmploymentProof")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I have employment proof or business documentation (if applicable)
                </span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionG.hasBankStatements")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I have recent bank statements (last 3-6 months)
                </span>
              </label>
            </div>

            <p className="text-sm text-amber-700">
              Don&apos;t worry if you&apos;re missing some documents — your coordinator will help you
              obtain what you need.
            </p>
          </div>
        )}

        {/* Section H: Consent & Declaration */}
        {currentStep === 8 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Consent & Declaration</h3>
              <p className="mt-1 text-sm text-stone-600">
                Please review and confirm the following before submitting.
              </p>
            </div>

            {submitError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">Submission failed</p>
                <p className="mt-1">{submitError}</p>
              </div>
            )}

            <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-5">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionH.consentDataProcessing")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I consent to Pioneer Trio storing and processing my personal data for this
                  immigration case, per the Privacy Policy.
                </span>
              </label>
              {errors.sectionH?.consentDataProcessing && (
                <p className="text-sm text-red-600">
                  {errors.sectionH.consentDataProcessing.message}
                </p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionH.understandNoGuarantee")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I understand Pioneer Trio provides document preparation and referral support only,
                  and does not guarantee any visa or application outcome.
                </span>
              </label>
              {errors.sectionH?.understandNoGuarantee && (
                <p className="text-sm text-red-600">
                  {errors.sectionH.understandNoGuarantee.message}
                </p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register("sectionH.confirmTruthful")}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-immigration-600 focus:ring-immigration-500"
                />
                <span className="text-sm text-stone-700">
                  I confirm the information provided above is true and complete to the best of my
                  knowledge.
                </span>
              </label>
              {errors.sectionH?.confirmTruthful && (
                <p className="text-sm text-red-600">{errors.sectionH.confirmTruthful.message}</p>
              )}
            </div>

            <Field
              label="E-signature: Type your full legal name"
              htmlFor="eSignature"
              error={errors.sectionH?.eSignature?.message}
            >
              <TextInput
                id="eSignature"
                {...register("sectionH.eSignature")}
                placeholder="Full legal name"
              />
            </Field>

            <p className="text-xs text-stone-500">
              Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Required disclaimer:</p>
              <p className="mt-2">
                Pioneer Trio provides document preparation, checklist guidance, and case-tracking
                support. We are not a licensed immigration law firm and do not provide legal advice.
                Where your matter requires licensed immigration advice, your file is referred to a
                licensed immigration professional in the relevant destination country.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          tone="immigration"
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button type="button" onClick={nextStep} tone="immigration" className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" tone="immigration" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Assessment"}
          </Button>
        )}
      </div>
    </form>
  );
}
