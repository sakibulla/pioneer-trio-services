import Link from "next/link";
import {
  Plane,
  HeartHandshake,
  BadgeCheck,
  UserCheck,
  ShieldCheck,
  ReceiptText,
  ArrowRight,
  UserPlus,
  ClipboardCheck,
  Handshake,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const trustMarkers = [
  { icon: BadgeCheck, label: "Verified Profiles & Documents" },
  { icon: UserCheck, label: "Named Human Coordinator on Every Case" },
  { icon: ShieldCheck, label: "Licensed Referral Partners" },
  { icon: ReceiptText, label: "Transparent Pricing, No Hidden Broker Fees" },
];

const steps = [
  { icon: UserPlus, title: "Sign Up", description: "Tell us which service you need and share the basics." },
  { icon: ClipboardCheck, title: "Verify & Prepare", description: "We verify your documents or profile and prepare your case." },
  { icon: Handshake, title: "Match / Refer & Track", description: "We match you with a partner or coordinator and track progress to the end." },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-gradient-to-b from-brand-50/60 to-white">
        <Container className="py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Two of life&apos;s biggest decisions. One trusted partner.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            Pioneer Trio helps Bangladeshis move abroad and find a spouse — with verified
            process, real people, and no hidden broker fees.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/immigration-consultancy" tone="immigration" className="w-full sm:w-auto">
              <Plane className="h-4 w-4" /> Explore Immigration Consultancy
            </ButtonLink>
            <ButtonLink href="/marriage-consultancy" tone="marriage" className="w-full sm:w-auto">
              <HeartHandshake className="h-4 w-4" /> Explore Marriage Consultancy
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/immigration-consultancy"
              className="group rounded-3xl border border-immigration-200 bg-immigration-50/60 p-8 transition-shadow hover:shadow-lg"
            >
              <Plane className="h-8 w-8 text-immigration-600" />
              <h3 className="mt-4 text-xl font-bold text-stone-900">Immigration Consultancy</h3>
              <p className="mt-2 text-stone-600">
                Document preparation, guided checklists, and case tracking for study, work, and
                immigration applications — across multiple destination countries, backed by
                licensed referral partners.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-immigration-700">
                Explore Immigration Consultancy
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/marriage-consultancy"
              className="group rounded-3xl border border-marriage-200 bg-marriage-50/60 p-8 transition-shadow hover:shadow-lg"
            >
              <HeartHandshake className="h-8 w-8 text-marriage-600" />
              <h3 className="mt-4 text-xl font-bold text-stone-900">Marriage Consultancy</h3>
              <p className="mt-2 text-stone-600">
                Verified profiles, guided introductions, and a real matchmaker — for Bangladeshis
                in Bangladesh and across the diaspora who are serious about finding a spouse.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-marriage-700">
                Explore Marriage Consultancy
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-y border-stone-200 bg-stone-50 py-14">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustMarkers.map((m) => (
              <div key={m.label} className="flex items-start gap-3">
                <m.icon className="h-6 w-6 shrink-0 text-brand-600" />
                <p className="text-sm font-medium text-stone-800">{m.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900">How It Works</h2>
            <p className="mt-3 text-stone-600">A simple, three-step path for either service.</p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-brand-700">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-stone-900">{s.title}</h3>
                <p className="mt-2 text-sm text-stone-600">{s.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/how-it-works" tone="brand" variant="outline">
              See the Full Walkthrough
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-stone-200 bg-stone-50 py-16">
        <Container className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Founding clients welcome</h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">
            Be among our first success stories. Client testimonials and partner logos will appear
            here as our founding cohort completes their cases and matches.
          </p>
        </Container>
      </section>

      <section className="bg-brand-950 py-16 text-white">
        <Container className="text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Pick the path that fits your situation — you can always explore the other later.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/immigration-consultancy#inquiry" tone="immigration" className="w-full sm:w-auto">
              Start Your Immigration Case
            </ButtonLink>
            <ButtonLink href="/marriage-consultancy#inquiry" tone="marriage" className="w-full sm:w-auto">
              Begin Your Marriage Consultancy Profile
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
