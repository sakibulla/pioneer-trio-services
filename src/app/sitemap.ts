import type { MetadataRoute } from "next";
import { resources } from "@/data/resources";
import { siteUrl } from "@/lib/site";

const staticRoutes = [
  "",
  "/about",
  "/immigration-consultancy",
  "/marriage-consultancy",
  "/how-it-works",
  "/trust-safety",
  "/resources",
  "/contact",
  "/coming-soon",
  "/privacy-policy",
  "/terms-of-service",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
    })),
    ...resources.map((r) => ({
      url: `${siteUrl}/resources/${r.slug}`,
      lastModified: now,
    })),
  ];
}
