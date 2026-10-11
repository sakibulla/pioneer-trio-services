"use client";

import { useState, useEffect } from "react";
import { BadgeCheck, MessageCircleWarning, UserCheck, Sparkles, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ProcessSteps } from "@/components/ui/process-steps";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { MarriageInquiryForm } from "@/components/forms/marriage-inquiry-form";
import { MarriageProfileForm } from "@/components/forms/marriage-profile-form";
import { portalApi, type AuthUser } from "@/lib/portal-api";

const verifiedAndSafe = [
  { icon: BadgeCheck, text: "Identity (ID/passport) verification for every profile." },
  { icon: MessageCircleWarning, text: "A mandatory individual interview before any cross-border match proceeds." },
  { icon: ShieldCheck, text: "Active screening against status-motivated or coercive intent — see our full Trust & Safety page." },
  { icon: UserCheck, text: "A named human matchmaker on every case, not an algorithm alone." },
];

const whyChooseUs = [
  { icon: Sparkles, text: "Verified profiles and a transparent process — no hidden broker fees." },
  { icon: Users, text: "A modern, culturally fluent brand that speaks to its audience, not a dated matrimonial-site tone." },
  { icon: BadgeCheck, text: "Purpose-built for serious, marriage-intent matching within a shared cultural and family context — not a general dating app." },
  { icon: ShieldCheck, text: "Support for both domestic Bangladeshi clients and the global diaspora." },
];

const steps = [
  "Complete identity verification and a structured profile covering background, values, family expectations, and relationship goals.",
  "Take part in an individual intake interview, which screens for genuine relationship intent.",
  "Your matchmaker reviews the client pool and proposes 2–3 candidate matches, with rationale — accounting for cross-border logistics where relevant.",
  "A guided first introduction (video call for cross-border matches), followed by matchmaker check-ins with both sides.",
  "If both sides want to proceed, optional relationship-readiness consultation sessions are available before family or marriage discussions begin.",
  "Your case closes on a successful match commitment, or you remain active in the pool with periodic new-match reviews.",
];

const faqs = [
  {
    question: "How are profiles verified?",
    answer:
      "Every client completes ID/passport verification and an individual intake interview before joining the active pool.",
  },
  {
    question: "Can I use this service if I already have a visa or plan to move abroad?",
    answer:
      "Yes, provided your interest in marriage is genuine; we do not arrange matches intended solely to secure immigration status.",
  },
  {
    question: "Is this a dating app?",
    answer:
      "No. Pioneer Trio is a guided, matchmaker-led service for people seriously seeking marriage, not casual dating.",
  },
  {
    question: "Do you guarantee I will find a spouse through your service?",
    answer:
      "No organization can guarantee a government visa decision or a relationship outcome. Pioneer Trio ensures your file, process, and introductions are handled thoroughly, transparently, and on time — but the outcome of any relationship is not guaranteed.",
  },
];

export default function MarriageConsultancyPage() {
  const [showFullForm, setShowFullForm] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = portalApi.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  return (
    <>
      <section className="border-b border-marriage-100 bg-marriage-50/50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Marriage Consultancy"
            tone="marriage"
            title="Verified profiles. A real matchmaker. Genuine relationship intent."
            description="Pioneer Trio is a verified matchmaking service for Bangladeshi clients in Bangladesh and across the diaspora. You build a verified profile, complete a structured compatibility questionnaire, and are matched by a real human matchmaker — supported by our platform's tools, never replaced by them. Every match is grounded in genuine relationship intent, verified identity, and family-context compatibility."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading tone="marriage" title="Who This Is For" />
          <p className="mt-6 max-w-3xl text-stone-600">
            Bangladeshi singles, roughly 20–35, in Bangladesh or in the diaspora (UAE, Saudi
            Arabia, Malaysia, UK, US, Canada, and beyond), who are serious about finding a spouse
            within a shared cultural and family context — not a casual dating app, and not a
            traditional broker.
          </p>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading tone="marriage" title="How It Works" />
            <div className="mt-8">
              <ProcessSteps steps={steps} tone="marriage" />
            </div>
          </div>
          <div>
            <SectionHeading tone="marriage" title="Verified & Safe by Design" />
            <div className="mt-8 space-y-5">
              {verifiedAndSafe.map((v) => (
                <div key={v.text} className="flex gap-3">
                  <v.icon className="h-5 w-5 shrink-0 text-marriage-600" />
                  <p className="text-stone-700">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading tone="marriage" title="Why Choose Pioneer Trio" />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {whyChooseUs.map((w) => (
              <div key={w.text} className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-5">
                <w.icon className="h-5 w-5 shrink-0 text-marriage-600" />
                <p className="text-sm text-stone-700">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-3xl">
            <Disclaimer>
              Pioneer Trio is a genuine matchmaking and relationship-readiness service.
              We do not solicit, screen for, or accommodate marriages sought purely for
              immigration status in any country, and we actively screen against trafficking risk.
              Any file showing status-motivated or coercive intent is declined and documented.
            </Disclaimer>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 py-16 sm:py-20">
        <Container>
          <SectionHeading tone="marriage" title="Frequently Asked Questions" />
          <div className="mt-8 max-w-3xl">
            <FaqAccordion items={faqs} />
          </div>
        </Container>
      </section>

      {/* Profile Creation Section */}
      <section id="inquiry" className="scroll-mt-20 border-t border-stone-200 bg-marriage-50/40 py-16 sm:py-20">
        <Container className="max-w-3xl">
          <SectionHeading tone="marriage" title="Begin My Matchmaking Journey" align="center" />
          <p className="mt-2 text-center text-sm text-stone-600">
            Choose how you would like to begin: submit a quick initial inquiry or complete your full verified profile.
          </p>

          {/* Form Switcher */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setShowFullForm(false)}
              className={`rounded-xl border p-4 text-left transition-all ${
                !showFullForm
                  ? "border-marriage-600 bg-marriage-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-marriage-300"
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
                  ? "border-marriage-600 bg-marriage-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-marriage-300"
              }`}
            >
              <h3 className="font-semibold text-stone-900">Full Profile (9 Sections)</h3>
              <p className="mt-1 text-sm text-stone-600">Complete verified profile - 15 minutes</p>
            </button>
          </div>

          <div className="mt-8">
            {showFullForm ? <MarriageProfileForm user={user} /> : <MarriageInquiryForm user={user} />}
          </div>
        </Container>
      </section>
    </>
  );
}
