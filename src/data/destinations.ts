export interface Destination {
  slug: string;
  country: string;
  caseTypes: string[];
  note?: string;
}

export const destinations: Destination[] = [
  {
    slug: "canada",
    country: "Canada",
    caseTypes: ["Study permits", "Skilled worker (Express Entry)", "Family sponsorship"],
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    caseTypes: ["Skilled worker visas", "Study visas"],
  },
  {
    slug: "australia",
    country: "Australia",
    caseTypes: ["Points-based permanent residency", "Study visas"],
  },
  {
    slug: "united-states",
    country: "United States",
    caseTypes: ["Study pathways", "Family-based pathways"],
  },
  {
    slug: "eu",
    country: "EU States",
    caseTypes: ["Study pathways", "Family-based pathways"],
  },
  {
    slug: "gulf-malaysia",
    country: "Gulf States & Malaysia",
    caseTypes: ["Employment visa document preparation"],
    note: "Document preparation and information support only — see disclaimer below.",
  },
];

export const gulfDisclaimer =
  "Overseas job placement and recruitment is regulated by BMET under Bangladesh's Overseas Employment and Migrants Act. Pioneer Trio provides document preparation and information support for this corridor; we do not charge placement or recruitment fees unless and until we hold a BMET manpower license.";
