"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { immigrationLeadSchema, type ImmigrationLead } from "@/lib/lead-schema";
import { submitLead } from "@/lib/submit-lead";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { destinations } from "@/data/destinations";
import { portalApi } from "@/lib/portal-api";

const applicationTypes = [
  "Study permit / study visa",
  "Skilled worker / points-based",
  "Family sponsorship",
  "Employment visa document preparation",
  "Not sure yet",
];

interface ImmigrationInquiryFormProps {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function ImmigrationInquiryForm({ user }: ImmigrationInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentUser = portalApi.getCurrentUser();
    setIsLoggedIn(!!currentUser);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ImmigrationLead>({
    resolver: zodResolver(immigrationLeadSchema),
    mode: "onChange",
    defaultValues: {
      formType: "immigration",
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      contact: user ? user.email : "",
      destinationCountry: "",
      applicationType: "",
      message: "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        formType: "immigration",
        name: `${user.firstName} ${user.lastName}`.trim(),
        contact: user.email,
        destinationCountry: "",
        applicationType: "",
        message: "",
      });
    }
  }, [user, reset]);

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-immigration-300 bg-immigration-50 p-8 text-center">
        <p className="font-semibold text-immigration-900 text-lg">Login Required</p>
        <p className="mt-2 text-sm text-immigration-800 mb-6">
          You must be logged in to submit a case inquiry.
        </p>
        <Link href="/portal">
          <Button tone="immigration">Go to Portal & Log In</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-immigration-200 bg-immigration-50 p-6 text-immigration-900">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-immigration-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">Thanks — your case inquiry is in.</p>
          <p className="mt-1 text-sm text-immigration-800">
            Check your <Link href="/portal" className="font-bold underline hover:text-immigration-700">portal dashboard</Link> to see your case.
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
      <input type="hidden" {...register("formType")} value="immigration" />
      <Field label="Full name" htmlFor="im-name" error={errors.name?.message}>
        <TextInput id="im-name" {...register("name")} placeholder="Your full name" />
      </Field>
      <Field label="Email or phone" htmlFor="im-contact" error={errors.contact?.message}>
        <TextInput id="im-contact" {...register("contact")} placeholder="you@example.com" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Destination country"
          htmlFor="im-destination"
          error={errors.destinationCountry?.message}
        >
          <Select id="im-destination" {...register("destinationCountry")} defaultValue="">
            <option value="" disabled>
              Select a destination
            </option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.country}>
                {d.country}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Application type"
          htmlFor="im-application-type"
          error={errors.applicationType?.message}
        >
          <Select id="im-application-type" {...register("applicationType")} defaultValue="">
            <option value="" disabled>
              Select a type
            </option>
            {applicationTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Anything we should know? (optional)" htmlFor="im-message">
        <TextArea id="im-message" rows={4} {...register("message")} placeholder="Tell us briefly about your situation" />
      </Field>
      <Button type="submit" tone="immigration" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting…" : "Start My Case Inquiry"}
      </Button>
    </form>
  );
}
