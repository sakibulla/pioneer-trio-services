// `||` (not `??`) so an empty-string env var — e.g. an unfilled field left in
// the Vercel dashboard — falls back too, not just an unset one.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pioneertrioservices.com";
export const siteName = "Pioneer Trio Services";
