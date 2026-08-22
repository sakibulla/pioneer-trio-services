"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { notifyLeadSchema, type NotifyLead } from "@/lib/lead-schema";
import { submitLead } from "@/lib/submit-lead";
import { TextInput } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function NotifyForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NotifyLead>({
    resolver: zodResolver(notifyLeadSchema),
    defaultValues: { formType: "notify" },
  });

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-brand-900">
        <CheckCircle2 className="h-5 w-5 text-brand-600" aria-hidden="true" />
        <p className="font-semibold">You&apos;re on the list — we&apos;ll email you at launch.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await submitLead(data);
        if (res.ok) setSubmitted(true);
      })}
      className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
    >
      <input type="hidden" {...register("formType")} value="notify" />
      <div className="flex-1">
        <TextInput
          type="email"
          aria-label="Email address"
          {...register("contact")}
          placeholder="you@example.com"
        />
        {errors.contact && <p className="mt-1.5 text-left text-sm text-red-600">{errors.contact.message}</p>}
      </div>
      <Button type="submit" tone="brand" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Notify Me at Launch"}
      </Button>
    </form>
  );
}
