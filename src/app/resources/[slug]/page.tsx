import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/container";
import { resources, getResourceBySlug } from "@/data/resources";

const categoryLabel = { immigration: "Immigration", marriage: "Marriage" } as const;
const categoryTone = {
  immigration: "bg-immigration-100 text-immigration-700",
  marriage: "bg-marriage-100 text-marriage-700",
} as const;

export function generateStaticParams() {
  return resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};
  return {
    title: resource.title,
    description: resource.excerpt,
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  return (
    <article className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Resources
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-semibold", categoryTone[resource.category])}>
            {categoryLabel[resource.category]}
          </span>
          {resource.countryTag && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
              {resource.countryTag}
            </span>
          )}
          <span className="text-xs font-medium text-stone-400">{resource.readTime}</span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {resource.title}
        </h1>

        <div className="mt-8 space-y-5 text-base leading-7 text-stone-700">
          {resource.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
