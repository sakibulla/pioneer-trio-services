export type ResourceCategory = "immigration" | "marriage";

export interface Resource {
  slug: string;
  title: string;
  excerpt: string;
  category: ResourceCategory;
  countryTag?: string;
  readTime: string;
  body: string[];
}

export const resources: Resource[] = [
  {
    slug: "canada-study-permit-checklist",
    title: "Canada Study Permit Checklist",
    excerpt:
      "The core documents Bangladeshi applicants need before starting a Canadian study permit application, and the most common gaps that slow a file down.",
    category: "immigration",
    countryTag: "Canada",
    readTime: "6 min read",
    body: [
      "A Canadian study permit application moves fastest when your file is complete on the first submission. Before you start, your coordinator will confirm you have: a valid Letter of Acceptance from a Designated Learning Institution, proof of funds covering tuition and living costs, a valid passport, and a statement of purpose.",
      "The most common gap we see is proof of funds that doesn't match the format immigration officers expect — bank statements need to show a consistent balance history, not just a snapshot. Your coordinator will flag this specifically during document review, before your file is submitted.",
      "If your case also involves a study permit refusal history, family sponsorship overlap, or a scholarship condition, those situations typically need licensed legal advice. Where that applies, your file is referred to a licensed immigration professional in Canada under our formal referral partnership — we prepare and organize the file, they advise on the legal strategy.",
      "Once submitted, your coordinator tracks your application against IRCC's published processing timelines and flags you before any decision deadline.",
    ],
  },
  {
    slug: "gulf-employment-visa-documents",
    title: "What Documents Do You Need for a Gulf Employment Visa",
    excerpt:
      "A plain-language rundown of the document preparation involved in Gulf and Malaysia employment visa applications — and what we do and don't handle for this corridor.",
    category: "immigration",
    countryTag: "Gulf & Malaysia",
    readTime: "5 min read",
    body: [
      "Overseas employment migration to the Gulf states and Malaysia is regulated in Bangladesh by BMET under the Overseas Employment and Migrants Act. For this corridor, Pioneer Trio Services provides document preparation and information support only — we do not charge placement or recruitment fees unless and until we hold a BMET manpower license.",
      "In practice, this means we help you organize and verify the documents an employer or recruitment agency will ask for: passport, medical fitness certificate, police clearance, relevant trade or education certificates, and any employer-issued offer documentation you already have.",
      "We do not source the job offer, negotiate placement terms, or act as a recruitment agency. If your situation involves an active recruitment process, we recommend confirming your recruiter's BMET license status directly before proceeding.",
      "Your coordinator will tell you plainly which parts of your case we can support and which parts sit outside our current licensing — this is a corridor where being upfront about scope matters more than moving fast.",
    ],
  },
  {
    slug: "how-referrals-work",
    title: "How Referrals to Licensed Professionals Work",
    excerpt:
      "Pioneer Trio Services prepares your file; a licensed immigration professional advises on the law. Here's exactly where that handoff happens.",
    category: "immigration",
    readTime: "4 min read",
    body: [
      "Pioneer Trio Services is not a licensed immigration law firm and does not provide legal advice. What we do is document preparation, checklist guidance, and case-tracking support — making sure your file is complete, accurate, and organized before it needs a legal review.",
      "When your case involves a matter that requires licensed advice — a complex sponsorship situation, a prior refusal, or a legal question about eligibility — your coordinator refers your file to a licensed immigration professional in your destination country, under a formal referral agreement.",
      "You are told when a referral is happening and why, before it happens. The licensed professional handles the legal advice and strategy; your coordinator continues tracking your case status and timeline alongside them.",
      "No organization can guarantee a government visa decision. What we can guarantee is that your file, process, and referrals are handled thoroughly, transparently, and on time.",
    ],
  },
  {
    slug: "intake-interview-what-to-expect",
    title: "What to Expect From Your Intake Interview",
    excerpt:
      "Every Marriage Consultancy client completes an individual intake interview before joining the active pool. Here's what it covers and why it exists.",
    category: "marriage",
    readTime: "5 min read",
    body: [
      "Before you're added to the active matching pool, you'll complete an individual intake interview with your matchmaker — separate from your written profile and questionnaire. This is a mandatory step for every client, not an optional extra.",
      "The interview covers your background, family expectations, and what you're genuinely looking for in a spouse. It also gives your matchmaker a chance to ask questions a form can't — about your comfort with cross-border matching, your timeline, and your family's involvement in the process.",
      "This step exists primarily as a safeguard: it's how we screen for genuine relationship intent and rule out status-motivated or coercive situations before any match is proposed. Every intake is reviewed by a second team member before a client goes active.",
      "If you're matched across borders, a second individual conversation happens before any introduction is arranged — you're never introduced to someone, or represented by a broker or relative, without speaking with your matchmaker directly first.",
    ],
  },
  {
    slug: "first-guided-introduction",
    title: "Your First Guided Introduction: What Happens",
    excerpt:
      "Matchmaker-proposed, matchmaker-guided — here's how a first introduction actually unfolds, from the match rationale to the follow-up check-in.",
    category: "marriage",
    readTime: "4 min read",
    body: [
      "Once your matchmaker identifies a candidate match, you'll receive the profile along with a written rationale — why this match, specifically, based on your stated values and family expectations. You're never introduced without seeing the reasoning first.",
      "For cross-border matches, the first introduction happens over video call, guided by your matchmaker rather than left to arrange informally between two strangers. For local matches, the format is agreed with both sides in advance.",
      "After the introduction, your matchmaker checks in with both of you separately — not just to ask how it went, but to listen for anything that doesn't sit right, including any sign of pressure to move faster than either side is comfortable with.",
      "If both sides want to continue, optional relationship-readiness consultation sessions are available before family or marriage discussions begin. If not, you remain active in the pool and your matchmaker continues proposing new matches.",
    ],
  },
];

export function getResourceBySlug(slug: string) {
  return resources.find((r) => r.slug === slug);
}
