# Pioneer Trio Services

Marketing website for Pioneer Trio Services — Immigration Consultancy & Marriage
Consultancy, Dhaka, Bangladesh. Built with Next.js (App Router), TypeScript, and
Tailwind CSS, from the project's `Pioneer_Trio_Services_Website_Documentation.md`
brief.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

All optional — the site runs with none of them set. Copy `.env.example` to
`.env.local` and fill in as each integration is ready:

- **Lead delivery** — emails form submissions via Gmail SMTP. Needs a Gmail
  address, an [app password](https://myaccount.google.com/apppasswords), and
  which inbox(es) leads should land in.
- **Analytics** — Plausible, only loads after a visitor accepts the cookie
  consent banner.
- **Site URL** — used in metadata, `sitemap.xml`, and `robots.txt`; falls back
  to `https://pioneertrioservices.com` if unset.

## Deploy

Deploys cleanly to [Vercel](https://vercel.com/new) — import this repo, no
extra config needed. Add the environment variables above in the Vercel
project's Settings → Environment Variables once they're ready.

## Project structure

- `src/app/` — one route per page (App Router), plus `sitemap.ts`, `robots.ts`,
  and `opengraph-image.tsx`
- `src/components/` — shared UI, the site header/footer, and the lead-capture
  forms
- `src/data/` — static content (nav, destinations, resource guides)
- `src/lib/` — form validation (Zod), the lead-notify email helper, and site
  config

## Status

Phase 1 (this site) is feature-complete: all pages, forms, and SEO metadata
are built and verified. Privacy Policy and Terms of Service carry a visible
"pending legal review" banner and should not be treated as final until
reviewed by counsel. Phase 1B (client accounts, case tracking, matchmaking
backend) is a separate, later build — not part of this repo yet.
