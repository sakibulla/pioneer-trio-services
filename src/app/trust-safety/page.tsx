import type { Metadata } from "next";
import { ShieldCheck, Lock, FileWarning, ScanEye, UserCheck, EyeOff } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description:
    "Every safeguard behind Pioneer Trio's Immigration and Marriage Consultancy services, in one place.",
};

const immigrationSafeguards = [
  {
    icon: FileWarning,
    text: "We handle document preparation, checklists, and case tracking — we refer any matter requiring licensed legal advice to a vetted, licensed professional in your destination country.",
  },
  {
    icon: ScanEye,
    text: "We do not charge placement or recruitment fees for overseas labour migration (Gulf/Malaysia) unless and until we hold a BMET manpower license.",
  },
  {
    icon: Lock,
    text: "Your documents are stored in encrypted, access-controlled storage — only your assigned coordinator can view your case.",
  },
];

const marriageSafeguards = [
  "Every profile completes identity (ID/passport) verification before joining the active pool.",
  "Every client completes a mandatory individual interview — not just a joint one — before any cross-border match proceeds.",
  "Our team is trained to recognize trafficking red flags (e.g., large power imbalances paired with pressure to move quickly, a broker or relative speaking for the client, reluctance to speak with the client alone), with a clear escalation and refusal process.",
  "We do not arrange or knowingly facilitate marriages sought purely for immigration status, in Bangladesh or any destination country.",
  "Every matchmaking intake is reviewed by a second team member before a client is added to the active pool.",
];

export default function TrustSafetyPage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Trust & Safety"
            title="Trust is the core of what we do — here's exactly how we protect it."
            description="Every safeguard described in our business plan, consolidated in one place, for both service lines."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-immigration-700">
              <ShieldCheck className="h-5 w-5" /> For Immigration Consultancy
            </h2>
            <ul className="mt-6 space-y-4">
              {immigrationSafeguards.map((s) => (
                <li key={s.text} className="flex gap-3 text-stone-700">
                  <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-immigration-600" />
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-marriage-700">
              <UserCheck className="h-5 w-5" /> For Marriage Consultancy
            </h2>
            <ul className="mt-6 space-y-4">
              {marriageSafeguards.map((s) => (
                <li key={s} className="flex gap-3 text-stone-700">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-marriage-600" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <EyeOff className="mx-auto h-8 w-8 text-brand-600" />
            <h2 className="mt-4 text-xl font-bold text-stone-900">Data Privacy</h2>
            <p className="mt-3 text-stone-600">
              All identity documents, immigration case files, and matchmaking profiles are held in
              encrypted storage with role-based access, so only your assigned coordinator or
              matchmaker can see your file. Full detail is provided in our Privacy Policy.
            </p>
            <div className="mt-6">
              <ButtonLink href="/privacy-policy" tone="brand">
                Read Our Privacy Policy
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
