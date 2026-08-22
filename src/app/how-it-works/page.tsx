import type { Metadata } from "next";
import { Plane, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "A side-by-side walkthrough of the Immigration Consultancy and Marriage Consultancy processes, step by step.",
};

const rows = [
  {
    step: 1,
    immigration: "Sign up, choose destination & case type",
    marriage: "Sign up, complete verification & profile",
  },
  {
    step: 2,
    immigration: "Receive destination-specific document checklist",
    marriage: "Individual intake interview & screening",
  },
  {
    step: 3,
    immigration: "Upload documents; coordinator reviews for completeness",
    marriage: "Matchmaker proposes 2–3 candidate matches",
  },
  {
    step: 4,
    immigration: "Refer to licensed partner if legal advice is needed",
    marriage: "Guided introduction & matchmaker check-ins",
  },
  {
    step: 5,
    immigration: "Coordinator tracks status against official timelines",
    marriage: "Optional relationship-readiness consultation",
  },
  {
    step: 6,
    immigration: "Case closes on filing or outcome",
    marriage: "Case closes on match commitment, or stays active",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="How It Works"
            title="Comparing the two paths, side by side."
            description="Whether you're deciding where to start, or explaining both services to a family member, here's exactly how each process unfolds."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-stone-50">
                  <th className="w-16 px-4 py-3 font-semibold text-stone-500">Step</th>
                  <th className="px-4 py-3 font-semibold text-immigration-700">
                    <span className="flex items-center gap-2">
                      <Plane className="h-4 w-4" /> Immigration Consultancy
                    </span>
                  </th>
                  <th className="px-4 py-3 font-semibold text-marriage-700">
                    <span className="flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4" /> Marriage Consultancy
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {rows.map((r) => (
                  <tr key={r.step}>
                    <td className="px-4 py-4 align-top font-bold text-stone-400">{r.step}</td>
                    <td className="px-4 py-4 align-top text-stone-700">{r.immigration}</td>
                    <td className="px-4 py-4 align-top text-stone-700">{r.marriage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/immigration-consultancy#inquiry" tone="immigration" className="w-full sm:w-auto">
              Start with Immigration Consultancy
            </ButtonLink>
            <ButtonLink href="/marriage-consultancy#inquiry" tone="marriage" className="w-full sm:w-auto">
              Start with Marriage Consultancy
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
