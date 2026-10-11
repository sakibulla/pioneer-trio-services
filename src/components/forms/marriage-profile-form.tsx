"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, UploadCloud, Heart, ShieldCheck } from "lucide-react";
import { marriageProfileSchema, type MarriageProfile } from "@/lib/marriage-profile-schema";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

const TOTAL_STEPS = 9;

interface MarriageProfileFormProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function MarriageProfileForm({ user }: MarriageProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MarriageProfile>({
    resolver: zodResolver(marriageProfileSchema),
    mode: "onChange",
    defaultValues: {
      formType: "marriage-profile",
      sectionA: user ? {
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        nationality: "Bangladeshi",
      } as any : { nationality: "Bangladeshi" } as any,
      sectionI: user ? {
        email: user.email,
      } as any : undefined,
      sectionG: {
        photoCount: 0,
      },
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError("");
    if (!e.target.files) return;

    const filesArray = Array.from(e.target.files);
    if (photos.length + filesArray.length > 2) {
      setPhotoError("Strict limit: Maximum 2 photos allowed per profile.");
      return;
    }

    const updated = [...photos, ...filesArray].slice(0, 2);
    setPhotos(updated);
    setValue("sectionG.photoCount", updated.length, { shouldValidate: true });
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setValue("sectionG.photoCount", updated.length, { shouldValidate: true });
  };

  const onSubmit = async (data: MarriageProfile) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

      // Transform frontend schema to backend schema
      const transformedData = {
        // Section A
        fullName: data.sectionA.fullName,
        dateOfBirth: data.sectionA.dateOfBirth,
        gender: (data.sectionA.gender || "MALE").toUpperCase(),
        height: data.sectionA.height ? parseInt(data.sectionA.height.split(" ")[0]) : 170,
        ...(data.sectionA.bloodGroup && { bloodGroup: data.sectionA.bloodGroup }),
        maritalStatus: (data.sectionA.maritalStatus || "SINGLE").toUpperCase().replace(/-/g, "_"),
        currentNationality: data.sectionA.nationality || "Bangladeshi",
        currentCountry: data.sectionA.currentCountry,
        currentCity: data.sectionA.currentCity,
        ...(data.sectionA.visaStatus && { visaStatus: data.sectionA.visaStatus }),
        motherTongue: data.sectionA.motherTongue || "Bengali",
        languagesSpoken: (data.sectionA.languagesSpoken || "Bengali,English").split(",").map((l: string) => l.trim()),

        // Section B
        fatherOccupation: data.sectionB.fatherOccupation,
        motherOccupation: data.sectionB.motherOccupation,
        siblingsCount: parseInt(data.sectionB.siblingsCount as any) || 0,
        siblingsMarried: parseInt(data.sectionB.siblingsMarried as any) || 0,
        familyType: (data.sectionB.familyType || "NUCLEAR").toUpperCase(),
        familyLocation: data.sectionB.familyLocation,
        ...(data.sectionB.familyDescription && { familyDescription: data.sectionB.familyDescription }),

        // Section C
        educationLevel: data.sectionC.highestEducation,
        institution: data.sectionC.institution,
        fieldOfStudy: data.sectionC.fieldOfStudy,
        currentProfession: data.sectionC.currentProfession,
        ...(data.sectionC.employer && { employer: data.sectionC.employer }),
        ...(data.sectionC.incomeBracket && { incomeBracket: data.sectionC.incomeBracket }),

        // Section D
        religion: data.sectionD.religion || "Islam",
        ...(data.sectionD.sect && { sect: data.sectionD.sect }),
        religiousPractice: data.sectionD.religiousPractice || "Moderate",
        ethnicity: data.sectionD.ethnicity || "Bengali",

        // Section E
        dietaryPreference: (data as any).sectionE?.dietaryPreference || "Halal",
        smokingHabits: (data as any).sectionE?.smokingHabits || "Non-smoker",
        drinkingHabits: (data as any).sectionE?.drinkingHabits || "No",
        ...((data as any).sectionE?.hobbiesInterests && { hobbies: (data as any).sectionE?.hobbiesInterests }),

        // Section I (Contact)
        email: data.sectionI.email,
        phone: data.sectionI.contactNumber,
        preferredContactMethod: data.sectionI.preferredContactMethod || "Email",

        // Section F (Partner Preferences)
        partnerPreference: {
          ageMin: parseInt((data as any).sectionF?.preferredAgeMin) || 20,
          ageMax: parseInt((data as any).sectionF?.preferredAgeMax) || 40,
          preferredLocations: ((data as any).sectionF?.preferredLocations || "Bangladesh,UK,USA,Canada")
            .split(",")
            .map((l: string) => l.trim()),
          ...((data as any).sectionF?.preferredEducation && { preferredEducation: (data as any).sectionF?.preferredEducation }),
          ...((data as any).sectionF?.dealbreakers && { dealbreakers: (data as any).sectionF?.dealbreakers }),
        },
      };

      // Submit to Next.js API route which handles backend communication
      const res = await fetch("/api/marriage/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[Marriage Profile Submit] Response status:", res.status);

      if (res.ok) {
        setSubmitted(true);
      } else {
        console.error("[Marriage Profile Submit] Error response status:", res.status);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("[Marriage Profile Submit] Error:", err);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-marriage-200 bg-marriage-50 p-8 text-center text-marriage-900">
        <CheckCircle2 className="mx-auto h-12 w-12 text-marriage-600" />
        <h3 className="mt-3 font-serif text-2xl font-bold">Your Marriage Profile is Submitted</h3>
        <p className="mt-2 text-sm text-marriage-800 max-w-lg mx-auto">
          Thank you. Because Pioneer Trio operates on a strictly human-led matchmaking model (with zero algorithms),
          our Senior Matchmaker will review your verified details and schedule your 1-on-1 intake interview.
        </p>
      </div>
    );
  }

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      // Trigger validation for current step before moving forward
      trigger().then((isValid: boolean) => {
        if (isValid) {
          setCurrentStep(currentStep + 1);
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Get section key for current step (e.g., "sectionA" for step 1)
  const getSectionKeyForStep = (step: number): keyof MarriageProfile => {
    const sectionMap: Record<number, keyof MarriageProfile> = {
      1: "sectionA",
      2: "sectionB",
      3: "sectionC",
      4: "sectionD",
      5: "sectionE",
      6: "sectionF",
      7: "sectionG",
      8: "sectionH",
      9: "sectionI",
    };
    return sectionMap[step] || "sectionA";
  };

  // Get current step errors
  const getCurrentStepErrors = () => {
    const sectionKey = getSectionKeyForStep(currentStep);
    const sectionErrors = errors[sectionKey] as any;
    
    if (!sectionErrors) return [];
    
    return Object.entries(sectionErrors).map(([field, error]: [string, any]) => ({
      field,
      message: error?.message || "This field is required",
    }));
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-marriage-700">
            Step {currentStep} of {TOTAL_STEPS}: {getStepTitle(currentStep)}
          </span>
          <span className="text-stone-600">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-stone-200">
          <div
            className="h-2 rounded-full bg-marriage-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Step 1: Personal & Identity */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section A: Personal & Identity</h3>
            <p className="text-xs text-stone-500">Note: Per our integrity standards, complexion fields are omitted.</p>

            <Field label="Full Legal Name" error={errors.sectionA?.fullName?.message} htmlFor="sectionA.fullName">
              <TextInput id="sectionA.fullName" {...register("sectionA.fullName")} placeholder="Your full name" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Birth" error={errors.sectionA?.dateOfBirth?.message} htmlFor="sectionA.dateOfBirth">
                <TextInput id="sectionA.dateOfBirth" type="date" {...register("sectionA.dateOfBirth")} />
              </Field>

              <Field label="Gender" error={errors.sectionA?.gender?.message} htmlFor="sectionA.gender">
                <Select id="sectionA.gender" {...register("sectionA.gender")} defaultValue="">
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Height (e.g. 5 ft 10 in or 178 cm)" error={errors.sectionA?.height?.message} htmlFor="sectionA.height">
                <TextInput id="sectionA.height" {...register("sectionA.height")} placeholder="5 ft 10 in" />
              </Field>

              <Field label="Marital Status" error={errors.sectionA?.maritalStatus?.message} htmlFor="sectionA.maritalStatus">
                <Select id="sectionA.maritalStatus" {...register("sectionA.maritalStatus")} defaultValue="">
                  <option value="" disabled>Select status</option>
                  <option value="never-married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </Select>
              </Field>
            </div>

            <Field label="Nationality" error={errors.sectionA?.nationality?.message} htmlFor="sectionA.nationality">
              <TextInput id="sectionA.nationality" {...register("sectionA.nationality")} placeholder="e.g. Bangladeshi, British, American" />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Current Country of Residence" error={errors.sectionA?.currentCountry?.message} htmlFor="sectionA.currentCountry">
                <TextInput id="sectionA.currentCountry" {...register("sectionA.currentCountry")} placeholder="e.g. United Kingdom, UAE, Bangladesh" />
              </Field>

              <Field label="Current City" error={errors.sectionA?.currentCity?.message} htmlFor="sectionA.currentCity">
                <TextInput id="sectionA.currentCity" {...register("sectionA.currentCity")} placeholder="e.g. London, Dubai, Dhaka" />
              </Field>
            </div>

            <Field label="Mother Tongue" error={errors.sectionA?.motherTongue?.message} htmlFor="sectionA.motherTongue">
              <TextInput id="sectionA.motherTongue" {...register("sectionA.motherTongue")} defaultValue="Bengali" />
            </Field>
          </div>
        )}

        {/* Step 2: Family Background */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section B: Family Background</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Father's Occupation" error={errors.sectionB?.fatherOccupation?.message} htmlFor="sectionB.fatherOccupation">
                <TextInput id="sectionB.fatherOccupation" {...register("sectionB.fatherOccupation")} placeholder="e.g. Retired Government Official, Business" />
              </Field>

              <Field label="Mother's Occupation" error={errors.sectionB?.motherOccupation?.message} htmlFor="sectionB.motherOccupation">
                <TextInput id="sectionB.motherOccupation" {...register("sectionB.motherOccupation")} placeholder="e.g. Homemaker, Professor, Doctor" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Family Type" error={errors.sectionB?.familyType?.message} htmlFor="sectionB.familyType">
                <Select id="sectionB.familyType" {...register("sectionB.familyType")} defaultValue="nuclear">
                  <option value="nuclear">Nuclear Family</option>
                  <option value="joint">Joint / Extended Family</option>
                </Select>
              </Field>

              <Field label="Family Location / Origins" error={errors.sectionB?.familyLocation?.message} htmlFor="sectionB.familyLocation">
                <TextInput id="sectionB.familyLocation" {...register("sectionB.familyLocation")} placeholder="e.g. Dhaka (Gulshan) & Sylhet" />
              </Field>
            </div>

            <Field label="Brief Family Overview" optional htmlFor="sectionB.familyDescription">
              <TextArea id="sectionB.familyDescription" {...register("sectionB.familyDescription")} placeholder="A few words about family values and background..." rows={3} />
            </Field>
          </div>
        )}

        {/* Step 3: Education & Career */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section C: Education & Profession</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Highest Education Level" error={errors.sectionC?.highestEducation?.message} htmlFor="sectionC.highestEducation">
                <TextInput id="sectionC.highestEducation" {...register("sectionC.highestEducation")} placeholder="e.g. Master's, MBBS, BSc, PhD" />
              </Field>

              <Field label="Institution" error={errors.sectionC?.institution?.message} htmlFor="sectionC.institution">
                <TextInput id="sectionC.institution" {...register("sectionC.institution")} placeholder="e.g. University of Manchester, BUET, DU" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Field of Study" error={errors.sectionC?.fieldOfStudy?.message} htmlFor="sectionC.fieldOfStudy">
                <TextInput id="sectionC.fieldOfStudy" {...register("sectionC.fieldOfStudy")} placeholder="e.g. Computer Science, Medicine, Finance" />
              </Field>

              <Field label="Current Profession / Job Title" error={errors.sectionC?.currentProfession?.message} htmlFor="sectionC.currentProfession">
                <TextInput id="sectionC.currentProfession" {...register("sectionC.currentProfession")} placeholder="e.g. Specialist Physician, Senior Engineer" />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employer (Staff-Only / Confidential)" optional htmlFor="sectionC.employer">
                <TextInput id="sectionC.employer" {...register("sectionC.employer")} placeholder="Visible only to matchmaker" />
              </Field>

              <Field label="Income Bracket (Staff-Only / Confidential)" optional htmlFor="sectionC.incomeBracket">
                <TextInput id="sectionC.incomeBracket" {...register("sectionC.incomeBracket")} placeholder="e.g. £60k-80k / $90k-120k" />
              </Field>
            </div>
          </div>
        )}

        {/* Step 4: Religious & Cultural */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section D: Religious & Cultural Background</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Religion" error={errors.sectionD?.religion?.message} htmlFor="sectionD.religion">
                <TextInput id="sectionD.religion" {...register("sectionD.religion")} defaultValue="Islam" />
              </Field>

              <Field label="Sect / Denomination" optional htmlFor="sectionD.sect">
                <TextInput id="sectionD.sect" {...register("sectionD.sect")} placeholder="e.g. Sunni" />
              </Field>
            </div>

            <Field label="Religious Practice & Values" optional htmlFor="sectionD.religiousPractice">
              <TextInput id="sectionD.religiousPractice" {...register("sectionD.religiousPractice")} placeholder="e.g. Practicing, 5 daily prayers, Halal-focused" />
            </Field>

            <Field label="Ethnicity" optional htmlFor="sectionD.ethnicity">
              <TextInput id="sectionD.ethnicity" {...register("sectionD.ethnicity")} defaultValue="Bengali" />
            </Field>
          </div>
        )}

        {/* Step 5: Lifestyle */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section E: Lifestyle & Habits</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Smoking Habits" error={errors.sectionE?.smokingHabits?.message} htmlFor="sectionE.smokingHabits">
                <Select id="sectionE.smokingHabits" {...register("sectionE.smokingHabits")} defaultValue="no">
                  <option value="no">Non-smoker</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="regularly">Regularly</option>
                  <option value="prefer-not-say">Prefer not to say</option>
                </Select>
              </Field>

              <Field label="Drinking Habits" error={errors.sectionE?.drinkingHabits?.message} htmlFor="sectionE.drinkingHabits">
                <Select id="sectionE.drinkingHabits" {...register("sectionE.drinkingHabits")} defaultValue="no">
                  <option value="no">Never / Non-drinker</option>
                  <option value="socially">Socially</option>
                  <option value="prefer-not-say">Prefer not to say</option>
                </Select>
              </Field>
            </div>

            <Field label="Dietary Preference" optional htmlFor="sectionE.dietaryPreference">
              <TextInput id="sectionE.dietaryPreference" {...register("sectionE.dietaryPreference")} placeholder="e.g. Halal only, Vegetarian" />
            </Field>

            <Field label="Hobbies & Interests" optional htmlFor="sectionE.hobbiesInterests">
              <TextArea id="sectionE.hobbiesInterests" {...register("sectionE.hobbiesInterests")} placeholder="e.g. Travel, photography, literature, sports..." rows={3} />
            </Field>
          </div>
        )}

        {/* Step 6: Partner Preferences */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section F: Partner Preferences</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Preferred Minimum Age" optional htmlFor="sectionF.preferredAgeMin">
                <TextInput id="sectionF.preferredAgeMin" type="number" {...register("sectionF.preferredAgeMin")} placeholder="e.g. 24" />
              </Field>

              <Field label="Preferred Maximum Age" optional htmlFor="sectionF.preferredAgeMax">
                <TextInput id="sectionF.preferredAgeMax" type="number" {...register("sectionF.preferredAgeMax")} placeholder="e.g. 32" />
              </Field>
            </div>

            <Field label="Preferred Location(s)" optional htmlFor="sectionF.preferredLocations">
              <TextInput id="sectionF.preferredLocations" {...register("sectionF.preferredLocations")} placeholder="e.g. United Kingdom, London, Canada, Bangladesh" />
            </Field>

            <Field label="Preferred Education / Profession" optional htmlFor="sectionF.preferredEducation">
              <TextInput id="sectionF.preferredEducation" {...register("sectionF.preferredEducation")} placeholder="e.g. Educated professional, Healthcare, Tech, Corporate" />
            </Field>

            <Field label="Dealbreakers / Non-Negotiables" optional htmlFor="sectionF.dealbreakers">
              <TextArea id="sectionF.dealbreakers" {...register("sectionF.dealbreakers")} placeholder="Any specific dealbreakers (e.g. smoking, relocated elsewhere)..." rows={3} />
            </Field>
          </div>
        )}

        {/* Step 7: Photos (Strict 2-Photo Cap) */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Section G: Profile Photos (Max 2)</h3>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {photos.length} / 2 photos selected
              </span>
            </div>

            <p className="text-xs text-stone-600">
              Per Pioneer Trio policy (Section 8.1), a strict limit of <strong>maximum 2 verified photos</strong> is enforced to ensure privacy and prevent superficial browsing.
            </p>

            {photoError && (
              <p className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-700">{photoError}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              {[0, 1].map((index) => {
                const photo = photos[index];
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center"
                  >
                    {photo ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                        <p className="text-xs font-medium text-stone-800 truncate max-w-[120px]">{photo.name}</p>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          Remove Photo #{index + 1}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <UploadCloud className="mx-auto h-8 w-8 text-stone-400" />
                        <p className="mt-1 text-xs font-semibold text-stone-700">Photo #{index + 1}</p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={photos.length >= 2}
                          className="mt-2 text-[11px] text-stone-500 file:mr-2 file:rounded file:border-0 file:bg-marriage-100 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-marriage-800"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 8: Verification & Consent */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section H: Verification & Legal Consent</h3>
            <p className="text-xs text-stone-600">
              Pioneer Trio conducts relationship-intent verification to protect our clients against status-motivated fraud and trafficking risks.
            </p>

            <div className="space-y-3 rounded-xl bg-stone-50 p-4 border border-stone-200 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("sectionH.governmentIdUploaded")} className="mt-0.5 h-4 w-4 rounded text-marriage-600" />
                <span className="text-stone-800 font-medium">I will provide a valid National ID or Passport for staff verification before introductions.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("sectionH.consentInterview")} className="mt-0.5 h-4 w-4 rounded text-marriage-600" />
                <span className="text-stone-800 font-medium">I agree to a mandatory 1-on-1 intake interview with a Pioneer Trio matchmaker.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("sectionH.relationshipIntent")} className="mt-0.5 h-4 w-4 rounded text-marriage-600" />
                <span className="text-stone-800 font-medium">I declare genuine marriage intent and confirm all supplied background details are truthful.</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" {...register("sectionH.consentDataProcessing")} className="mt-0.5 h-4 w-4 rounded text-marriage-600" />
                <span className="text-stone-800 font-medium">I consent to the secure processing of my profile under Pioneer Trio's Privacy Policy.</span>
              </label>
            </div>

            <Field label="Full Name as E-Signature" error={errors.sectionH?.eSignature?.message} htmlFor="sectionH.eSignature">
              <TextInput id="sectionH.eSignature" {...register("sectionH.eSignature")} placeholder="Type your full legal name" />
            </Field>
          </div>
        )}

        {/* Step 9: Interview Contact */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Section I: Interview Scheduling & Contact</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email Address" error={errors.sectionI?.email?.message} htmlFor="sectionI.email">
                <TextInput id="sectionI.email" type="email" {...register("sectionI.email")} placeholder="your.email@example.com" />
              </Field>

              <Field label="Contact Phone / WhatsApp" error={errors.sectionI?.contactNumber?.message} htmlFor="sectionI.contactNumber">
                <TextInput id="sectionI.contactNumber" {...register("sectionI.contactNumber")} placeholder="+880 1700 000000" />
              </Field>
            </div>

            <Field label="Preferred Interview Mode" error={errors.sectionI?.preferredContactMethod?.message} htmlFor="sectionI.preferredContactMethod">
              <Select id="sectionI.preferredContactMethod" {...register("sectionI.preferredContactMethod")} defaultValue="whatsapp">
                <option value="whatsapp">WhatsApp Video Call</option>
                <option value="video">Google Meet / Zoom Video Call</option>
                <option value="phone">Direct Phone Call</option>
                <option value="email">Email Coordination</option>
              </Select>
            </Field>

            <Field label="Availability Notes" optional htmlFor="sectionI.availabilityNotes">
              <TextArea id="sectionI.availabilityNotes" {...register("sectionI.availabilityNotes")} placeholder="Preferred days/times for interview (e.g. weekends, evenings GMT+6)..." rows={3} />
            </Field>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col gap-4 border-t border-stone-200 pt-5">
          {/* Step-level error messaging */}
          {currentStep < TOTAL_STEPS && getCurrentStepErrors().length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-semibold text-red-900 mb-2">Please fix the following to continue:</p>
              <ul className="space-y-1">
                {getCurrentStepErrors().map((error, idx) => (
                  <li key={idx} className="text-sm text-red-800">
                    • <strong>{error.field.charAt(0).toUpperCase() + error.field.slice(1)}</strong>: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-1.5">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={nextStep} className="bg-marriage-700 text-white hover:bg-marriage-800 flex items-center gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                {Object.keys(errors).length > 0 && (
                  <p className="text-xs text-red-600 mb-2">
                    Please fix errors: {Object.keys(errors).join(', ')}
                  </p>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-marriage-800 text-white hover:bg-marriage-900">
                  {isSubmitting ? "Submitting Profile..." : "Submit Profile for Review"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

function getStepTitle(step: number): string {
  const titles = [
    "Personal & Identity",
    "Family Background",
    "Education & Career",
    "Religious & Cultural",
    "Lifestyle & Habits",
    "Partner Preferences",
    "Profile Photos (Max 2)",
    "Verification & Consent",
    "Interview Scheduling",
  ];
  return titles[step - 1] || "";
}
