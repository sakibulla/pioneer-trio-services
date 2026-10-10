import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ResourcesExplorer } from "@/components/resources-explorer";
import { resources } from "@/data/resources";

export const metadata: Metadata = {
  title: "Immigration & Marriage Guides | Pioneer Trio",
  description:
    "Visa checklist Bangladesh, Gulf employment visa documents, matchmaking guide Bangladesh. Bengali-language-priority destination checklists, process explainers, and matchmaking guides from Pioneer Trio.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Resources"
            title="Guides to help you move abroad, and find a spouse, with confidence."
            description="Destination-specific checklists, process explainers, and matchmaking guides — Bengali-language versions of priority guides are planned alongside this English content."
          />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <ResourcesExplorer resources={resources} />
        </Container>
      </section>
    </>
  );
}
