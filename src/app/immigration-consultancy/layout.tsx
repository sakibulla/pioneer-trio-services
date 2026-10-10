import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immigration Consultancy Bangladesh | Pioneer Trio",
  description:
    "Immigration consultant Dhaka. Document preparation, guided checklists, and case tracking for study, work, and immigration applications across multiple destination countries.",
};

export default function ImmigrationConsultancyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
