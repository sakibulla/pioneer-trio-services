import { z } from "zod";

const base = {
  name: z.string().trim().min(2, "Please enter your name."),
  contact: z.string().trim().min(5, "Please enter an email or phone number."),
};

export const immigrationLeadSchema = z.object({
  formType: z.literal("immigration"),
  ...base,
  destinationCountry: z.string().trim().min(1, "Please select a destination country."),
  applicationType: z.string().trim().min(1, "Please select an application type."),
  message: z.string().trim().max(2000),
});

export const marriageLeadSchema = z.object({
  formType: z.literal("marriage"),
  ...base,
  age: z
    .string()
    .trim()
    .refine((v) => Number(v) >= 18 && Number(v) <= 75, "Please enter a valid age (18+)."),
  currentLocation: z.string().trim().min(2, "Please enter your current location/city."),
  background: z.string().trim().max(2000),
});

export const contactLeadSchema = z.object({
  formType: z.literal("contact"),
  ...base,
  interest: z.enum(["Immigration Consultancy", "Marriage Consultancy", "General question"]),
  message: z.string().trim().min(5, "Please enter a short message."),
});

export const notifyLeadSchema = z.object({
  formType: z.literal("notify"),
  contact: z.string().trim().email("Please enter a valid email address."),
});

export const leadSchema = z.discriminatedUnion("formType", [
  immigrationLeadSchema,
  marriageLeadSchema,
  contactLeadSchema,
  notifyLeadSchema,
]);

export type ImmigrationLead = z.infer<typeof immigrationLeadSchema>;
export type MarriageLead = z.infer<typeof marriageLeadSchema>;
export type ContactLead = z.infer<typeof contactLeadSchema>;
export type NotifyLead = z.infer<typeof notifyLeadSchema>;
export type Lead = z.infer<typeof leadSchema>;
