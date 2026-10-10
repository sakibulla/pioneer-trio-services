"use client";

import { useState } from "react";
import { Globe2, UserCheck, ReceiptText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ProcessSteps } from "@/components/ui/process-steps";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { DestinationsGrid } from "@/components/destinations-grid";
import { ImmigrationInquiryForm } from "@/components/forms/immigration-inquiry-form";
import { ImmigrationAssessmentForm } from "@/components/forms/immigration-assessment-form";
import { gulfDisclaimer } from "@/data/destinations";

const whyChooseUs = [
  { icon: Globe2, text: "One platform for multiple destination countries, instead of juggling separate local agents." },
  { icon: UserCheck, text: "A named coordinator on every case — not a call center." },
  { icon: ReceiptText, text: "Clear, upfront pricing with no hidden broker fees." },
  { icon: ShieldCheck, text: "Referrals only to licensed, vetted immigration professionals." },
];

const steps = [
  "Sign up and select your destination country and application type.",
  "Receive a document checklist built specifically for that destination and case type.",
  "Upload your documents; your coordinator reviews them for completeness and flags any gaps.",
  "If your case needs legal advice, we refer your file to a licensed partner professional in your destination country.",
  "Your coordinator tracks your application against official processing timelines and keeps you updated on next steps and deadlines.",
  "Your case closes when your application is filed, or when you receive your outcome.",
];

const faqs = [
  {
    question: "Do you guarantee my visa or application will be approved?",
    answer:
      "No organization can guarantee a government visa decision or a relationship outcome. Pioneer Trio ensures your file, process, and introductions are handled thoroughly, transparently, and on time — but the outcome of any government application is not guaranteed.",
  },
  {
    question: "Do you handle overseas job placement to the Gulf or Malaysia?",
    answer:
      "We currently provide document preparation and information support only for this corridor, pending BMET licensing.",
  },
  {
    question: "Who actually gives me legal advice?",
    answer:
      "A licensed immigration consultant or lawyer in your destination country, under our formal referral partnership, for any matter requiring legal advice.",
  },
];

export default function ImmigrationConsultancyPage() {
  const [showFullForm, setShowFullForm] = useState(false);

  return (
    <>
      <section className="border-b border-immigration-100 bg-immigration-50/50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Immigration Consultancy"
            tone="immigration"
            title="A complete, accurate application — backed by a coordinator and licensed partners."
            description="Pioneer Trio helps you prepare a complete, accurate application for study, skilled, family, or work opportunities abroad. You get a destination-specific document checklist, a coordinator who reviews your file for completeness, and status tracking from application to decision. Where your case needs licensed legal advice, we refer you to a licensed immigration professional in your destination country under a formal referral agreement."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading tone="immigration" title="Destinations & Case Types" />
          <div className="mt-8">
            <DestinationsGrid />
          </div>
          <div className="mt-8">
            <Disclaimer>{gulfDisclaimer}</Disclaimer>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading tone="immigration" title="How It Works" />
            <div className="mt-8">
              <ProcessSteps steps={steps} tone="immigration" />
            </div>
          </div>
          <div>
            <SectionHeading tone="immigration" title="Why Choose Pioneer Trio" />
            <div className="mt-8 space-y-5">
              {whyChooseUs.map((w) => (
                <div key={w.text} className="flex gap-3">
                  <w.icon className="h-5 w-5 shrink-0 text-immigration-600" />
                  <p className="text-stone-700">{w.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Disclaimer>
                Pioneer Trio provides document preparation, checklist guidance, and
                case-tracking support. We are not a licensed immigration law firm and do not
                provide legal advice. Where your matter requires licensed immigration advice, your
                file is referred to a licensed immigration professional in the relevant
                destination country.
              </Disclaimer>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading tone="immigration" title="Frequently Asked Questions" />
          <div className="mt-8 max-w-3xl">
            <FaqAccordion items={faqs} />
          </div>
        </Container>
      </section>

      <section id="inquiry" className="scroll-mt-20 border-t border-stone-200 bg-immigration-50/40 py-16 sm:py-20">
        <Container className="max-w-2xl">
          <SectionHeading tone="immigration" title="Start Your Immigration Journey" align="center" />
          <p className="mt-3 text-center text-stone-600">
            Choose how you&apos;d like to begin: send a quick inquiry or complete our full initial assessment.
          </p>
          
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setShowFullForm(false)}
              className={`rounded-xl border p-4 text-left transition-all ${
                !showFullForm
                  ? "border-immigration-600 bg-immigration-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-immigration-300"
              }`}
            >
              <h3 className="font-semibold text-stone-900">Quick Inquiry</h3>
              <p className="mt-1 text-sm text-stone-600">Basic contact form - 2 minutes</p>
            </button>
            
            <button
              type="button"
              onClick={() => setShowFullForm(true)}
              className={`rounded-xl border p-4 text-left transition-all ${
                showFullForm
                  ? "border-immigration-600 bg-immigration-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-immigration-300"
              }`}
            >
              <h3 className="font-semibold text-stone-900">Full Assessment</h3>
              <p className="mt-1 text-sm text-stone-600">Complete initial assessment - 15 minutes</p>
            </button>
          </div>

          <div className="mt-8">
            {showFullForm ? <ImmigrationAssessmentForm /> : <ImmigrationInquiryForm />}
          </div>
        </Container>
      </section>
    </>
  );
}
