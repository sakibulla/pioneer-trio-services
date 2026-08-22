"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  subscribeToConsent,
  getConsentSnapshot,
  getConsentServerSnapshot,
  acceptConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const consented = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  if (consented) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-stone-600">
          We use cookies to understand site usage and improve our services. See our{" "}
          <Link href="/privacy-policy" className="font-medium text-brand-700 hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <Button tone="brand" className="w-full sm:w-auto" onClick={acceptConsent}>
          Accept
        </Button>
      </div>
    </div>
  );
}
