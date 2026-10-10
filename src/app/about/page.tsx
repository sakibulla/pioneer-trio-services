import type { Metadata } from "next";
import { Globe2, HeartHandshake, UserCheck, Layers } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Pioneer Trio was founded to give Bangladeshis a transparent, verified path through moving abroad and finding a spouse.",
};

const differentiators = [
  {
    icon: Globe2,
    title: "Fully digital, multi-destination case handling",
    description:
      "Instead of the single-country focus of typical local agents, we handle cases across multiple destination countries from one platform.",
  },
  {
    icon: HeartHandshake,
    title: "A matchmaking service that speaks to its audience",
    description:
      "Verified profiles at its core, with a modern voice — not the formal, dated tone of traditional matrimonial sites.",
  },
  {
    icon: UserCheck,
    title: "A named human coordinator or matchmaker",
    description: "Accountable for every case and every match — the platform supports, never replaces, direct human review.",
  },
  {
    icon: Layers,
    title: "One trusted brand for major life decisions",
    description: "Starting with moving abroad and finding a spouse, under a single accountable company.",
  },
];

const founders = [
  {
    name: "Founding Partner — Compliance & Finance",
    role: "Partner A",
    bio: "Bio and credentials to be added by the founding partners.",
  },
  {
    name: "Founding Partner — Client Delivery & Marketing",
    role: "Partner B",
    bio: "Bio and credentials to be added by the founding partners.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Our Story" title="Two life-changing decisions deserve one honest process." />
          <p className="mt-6 max-w-3xl text-lg text-stone-600">
            Pioneer Trio was founded to solve a simple problem: Bangladeshis making
            life-changing decisions — moving abroad, or choosing a spouse — deserve a process that
            is transparent, verified, and genuinely helpful, not one built on hidden fees and
            word-of-mouth risk.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-stone-900">Our Mission</h2>
            <p className="mt-4 text-stone-600">
              To give Bangladeshi individuals and families — at home and across the global
              diaspora — a trustworthy, fully digital path through two of life&apos;s
              highest-stakes processes: moving abroad, and finding a spouse.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <SectionHeading title="Why We're Different" align="center" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {differentiators.map((d) => (
              <div key={d.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-6">
                <d.icon className="h-6 w-6 shrink-0 text-brand-600" />
                <div>
                  <h3 className="font-bold text-stone-900">{d.title}</h3>
                  <p className="mt-1 text-sm text-stone-600">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading title="Our Team" align="center" />
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {founders.map((f) => (
              <div key={f.name} className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-brand-100" aria-hidden="true" />
                <p className="mt-4 font-bold text-stone-900">{f.name}</p>
                <p className="text-sm font-medium text-brand-700">{f.role}</p>
                <p className="mt-2 text-sm text-stone-600">{f.bio}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/contact" tone="brand">
              Get in Touch
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
