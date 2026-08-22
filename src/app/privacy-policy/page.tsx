import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { LegalDraftBanner } from "@/components/legal-draft-banner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Pioneer Trio Services collects, stores, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: to be set at publication.</p>

        <div className="mt-8">
          <LegalDraftBanner />
        </div>

        <div className="mt-10 space-y-10 text-stone-700">
          <section>
            <h2 className="text-xl font-bold text-stone-900">What data we collect</h2>
            <p className="mt-3">
              To provide our Immigration Consultancy and Marriage Consultancy services, we collect
              identity documents (such as passport and ID information), immigration case files
              (destination country, application type, supporting documents), and matchmaking
              profile data (background, family expectations, relationship goals, and intake
              interview notes).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">How it&apos;s stored</h2>
            <p className="mt-3">
              All identity documents, case files, and profiles are held in encrypted storage with
              role-based access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Who can access it</h2>
            <p className="mt-3">
              Only your assigned coordinator (for immigration cases) or matchmaker (for marriage
              consultancy cases) can view your file. A second team member reviews marriage
              consultancy intakes before a client is added to the active pool, as part of our
              screening process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Third-party sharing</h2>
            <p className="mt-3">
              For immigration cases, your file is shared with a licensed referral partner only
              where your matter requires licensed legal advice, and only with your consent. We do
              not sell client data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Retention</h2>
            <p className="mt-3">
              Retention periods for case files and profile data will be defined in coordination
              with local counsel and published here before launch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900">Your rights</h2>
            <p className="mt-3">
              You may request access to, correction of, or deletion of your data by contacting us
              through our{" "}
              <a href="/contact" className="font-medium text-brand-700 hover:underline">
                Contact page
              </a>
              . Specific rights and response timelines will be finalized with local counsel before
              publication.
            </p>
          </section>
        </div>
      </Container>
    </section>
  );
}
