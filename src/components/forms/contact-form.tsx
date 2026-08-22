"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { contactLeadSchema, type ContactLead } from "@/lib/lead-schema";
import { submitLead } from "@/lib/submit-lead";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

const interests = ["Immigration Consultancy", "Marriage Consultancy", "General question"] as const;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactLead>({
    resolver: zodResolver(contactLeadSchema),
    defaultValues: { formType: "contact" },
  });

  if (submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-brand-900">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">Message sent.</p>
          <p className="mt-1 text-sm text-brand-800">We respond within one business day.</p>
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
      <input type="hidden" {...register("formType")} value="contact" />
      <Field label="I'm interested in..." htmlFor="c-interest" error={errors.interest?.message}>
        <Select id="c-interest" {...register("interest")} defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Full name" htmlFor="c-name" error={errors.name?.message}>
        <TextInput id="c-name" {...register("name")} placeholder="Your full name" />
      </Field>
      <Field label="Email or phone" htmlFor="c-contact" error={errors.contact?.message}>
        <TextInput id="c-contact" {...register("contact")} placeholder="you@example.com" />
      </Field>
      <Field label="Message" htmlFor="c-message" error={errors.message?.message}>
        <TextArea id="c-message" rows={5} {...register("message")} placeholder="How can we help?" />
      </Field>
      <Button type="submit" tone="brand" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Sending…" : "Send a Message"}
      </Button>
    </form>
  );
}
