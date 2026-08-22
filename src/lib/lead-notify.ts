import nodemailer from "nodemailer";
import type { Lead } from "@/lib/lead-schema";

const inboxByFormType: Record<Lead["formType"], string | undefined> = {
  immigration: process.env.IMMIGRATION_INBOX_EMAIL ?? process.env.LEAD_INBOX_EMAIL,
  marriage: process.env.MARRIAGE_INBOX_EMAIL ?? process.env.LEAD_INBOX_EMAIL,
  contact: process.env.LEAD_INBOX_EMAIL,
  notify: process.env.LEAD_INBOX_EMAIL,
};

function formatLead(lead: Lead): { subject: string; text: string } {
  switch (lead.formType) {
    case "immigration":
      return {
        subject: `New immigration case inquiry — ${lead.destinationCountry}`,
        text: [
          `Name: ${lead.name}`,
          `Contact: ${lead.contact}`,
          `Destination: ${lead.destinationCountry}`,
          `Application type: ${lead.applicationType}`,
          `Message: ${lead.message || "(none)"}`,
        ].join("\n"),
      };
    case "marriage":
      return {
        subject: `New marriage consultancy profile inquiry — ${lead.name}`,
        text: [
          `Name: ${lead.name}`,
          `Contact: ${lead.contact}`,
          `Age: ${lead.age}`,
          `Current location: ${lead.currentLocation}`,
          `Background: ${lead.background || "(none)"}`,
        ].join("\n"),
      };
    case "contact":
      return {
        subject: `New contact message — ${lead.interest}`,
        text: [
          `Interested in: ${lead.interest}`,
          `Name: ${lead.name}`,
          `Contact: ${lead.contact}`,
          `Message: ${lead.message}`,
        ].join("\n"),
      };
    case "notify":
      return {
        subject: "New Coming Soon notify-me signup",
        text: `Email: ${lead.contact}`,
      };
  }
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Best-effort email delivery via Gmail SMTP (an app password, not a full
 * email-service signup — works before the business has its own domain).
 * Never throws: a lead is already logged server-side by the caller before
 * this runs, so a delivery failure here should not fail the user's request.
 */
export async function notifyLead(lead: Lead): Promise<void> {
  const mailer = getTransporter();
  const to = inboxByFormType[lead.formType];
  const from = process.env.GMAIL_USER;

  if (!mailer || !to || !from) return;

  const { subject, text } = formatLead(lead);
  // "contact" is free text (email or phone) — only use it as Reply-To when it's
  // actually an email, since an invalid Reply-To can cause SMTP to reject the send.
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.contact) ? lead.contact : undefined;

  try {
    await mailer.sendMail({ from, to, replyTo, subject, text });
  } catch (err) {
    console.error("[lead-notify] failed to send lead email", err);
  }
}
