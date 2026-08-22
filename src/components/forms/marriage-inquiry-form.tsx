"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { marriageLeadSchema, type MarriageLead } from "@/lib/lead-schema";
import { submitLead } from "@/lib/submit-lead";
import { Field, TextInput, TextArea } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function MarriageInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MarriageLead>({
    resolver: zodResolver(marriageLeadSchema),
    defaultValues: {
      formType: "marriage",
      name: "",
      contact: "",
      age: "",
      currentLocation: "",
      background: "",
    },
  });

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-marriage-200 bg-marriage-50 p-6 text-marriage-900">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-marriage-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">Thanks — your profile inquiry is in.</p>
          <p className="mt-1 text-sm text-marriage-800">
            A matchmaker will reach out within one business day to start your verification and intake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await submitLead(data);
        if (res.ok) setSubmitted(true);
      })}
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8"
    >
      <input type="hidden" {...register("formType")} value="marriage" />
      <Field label="Full name" htmlFor="mc-name" error={errors.name?.message}>
        <TextInput id="mc-name" {...register("name")} placeholder="Your full name" />
      </Field>
      <Field label="Email or phone" htmlFor="mc-contact" error={errors.contact?.message}>
        <TextInput id="mc-contact" {...register("contact")} placeholder="you@example.com" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Age" htmlFor="mc-age" error={errors.age?.message}>
          <TextInput id="mc-age" type="number" min={18} max={75} {...register("age")} placeholder="e.g. 28" />
        </Field>
        <Field
          label="Current location"
          htmlFor="mc-location"
          error={errors.currentLocation?.message}
        >
          <TextInput id="mc-location" {...register("currentLocation")} placeholder="e.g. Dhaka, or Dubai, UAE" />
        </Field>
      </div>
      <Field label="Brief background (optional)" htmlFor="mc-background">
        <TextArea
          id="mc-background"
          rows={4}
          {...register("background")}
          placeholder="A little about you and what you're looking for"
        />
      </Field>
      <Button type="submit" tone="marriage" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Begin My Profile"}
      </Button>
    </form>
  );
}
