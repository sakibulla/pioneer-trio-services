import { siteUrl, siteName } from "@/lib/site";
import { officeAddress } from "@/data/nav";

// Only verifiable facts go here — no placeholder phone/email/social links,
// since incorrect structured data can surface wrong contact info directly in
// search results. `sameAs` social links come back once data/nav.ts has real
// profile URLs instead of the current generic facebook.com/youtube.com ones.
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description:
      "Pioneer Trio Services helps Bangladeshis move abroad and find a spouse — verified process, real people, no hidden broker fees.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dhaka",
      addressCountry: "BD",
    },
    areaServed: officeAddress,
  };
}
