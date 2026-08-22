"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900">
          Something went wrong.
        </h1>
        <p className="mt-4 text-stone-600">
          This is on us, not you — please try again. If it keeps happening, reach out through the
          Contact page and we&apos;ll take a look.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button tone="brand" onClick={() => retry()}>
            Try Again
          </Button>
          <ButtonLink href="/" tone="brand" variant="outline">
            Back to Home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
