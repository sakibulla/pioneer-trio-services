import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist — find your way back to Pioneer Trio Services.",
};

export default function NotFound() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Compass className="h-6 w-6" />
        </div>
        <p className="mt-6 font-mono text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
          This page took a wrong turn.
        </h1>
        <p className="mt-4 text-stone-600">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved. Here are a few
          places to pick back up.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" tone="brand">
            Back to Home
          </ButtonLink>
          <ButtonLink href="/immigration-consultancy" tone="immigration" variant="outline">
            Immigration Consultancy
          </ButtonLink>
          <ButtonLink href="/marriage-consultancy" tone="marriage" variant="outline">
            Marriage Consultancy
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
