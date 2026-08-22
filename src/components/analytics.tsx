"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import {
  subscribeToConsent,
  getConsentSnapshot,
  getConsentServerSnapshot,
} from "@/lib/cookie-consent";

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function Analytics() {
  const consented = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getConsentServerSnapshot
  );

  if (!plausibleDomain || !consented) return null;

  return (
    <Script
      src="https://plausible.io/js/script.js"
      data-domain={plausibleDomain}
      strategy="afterInteractive"
    />
  );
}
