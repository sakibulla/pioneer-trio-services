import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LegalDraftBanner } from "@/components/legal-draft-banner";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of Pioneer Trio Services' Immigration and Marriage Consultancy services.",
};

export default function TermsOfServicePage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: to be set at publication.</p>

        <div className="mt-8">
          <LegalDraftBanner />
        </div>

        <div className="mt-10 space-y-10 text-stone-700">
          <section>
            <h2 className="text-xl font-bold text-stone-900">Scope of service</h2>
            <p className="mt-3">
              For Immigration Consultancy, Pioneer Trio Services provides document preparation,
              checklist guidance, and case-tracking support, with referral to licensed immigration
              professionals where legal advice is required. For Marriage Consultancy, we provide
              verified matchmaking, guided introductions, and relationship-readiness support
              through a human matchmaker.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">What we do not guarantee</h2>
            <p className="mt-3">
              No organization can guarantee a government visa decision or a relationship outcome.
              Pioneer Trio Services ensures your file, process, and introductions are handled
              thoroughly, transparently, and on time — but the outcome of any government
              application, or of any relationship, is not guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Fees and refunds</h2>
            <p className="mt-3">
              Detailed pricing and refund terms will be published here once finalized by the
              founding partners and reviewed by local counsel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Client conduct</h2>
            <p className="mt-3">
              Clients are expected to provide accurate information throughout their case or
              profile. For Marriage Consultancy specifically, seeking a match purely to secure
              immigration status is prohibited; any file showing status-motivated or coercive
              intent will be declined and documented.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Dispute resolution</h2>
            <p className="mt-3">
              Dispute resolution terms will be defined in coordination with local counsel and
              published here before launch.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
