"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Plane, HeartHandshake } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/container";
import { mainNav } from "@/data/nav";

// Shorter labels for the desktop nav only — the full service names still
// appear everywhere else (page titles, CTAs, mobile nav); repeating
// "Consultancy" twice in a single nav row is what was forcing it to overflow.
const desktopNavLabel: Record<string, string> = {
  "/immigration-consultancy": "Immigration",
  "/marriage-consultancy": "Marriage",
};

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  // Close the mobile menu on route change — adjusted during render (React's
  // recommended pattern for resetting state on a prop change), not in an effect.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Stop background scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold whitespace-nowrap text-stone-900"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            P3
          </span>
          <span className="hidden sm:inline">Pioneer Trio Services</span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium whitespace-nowrap transition-colors hover:text-brand-700",
                pathname === link.href ? "text-brand-700" : "text-stone-600"
              )}
            >
              {desktopNavLabel[link.href] ?? link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:block">
          <GetStartedMenu open={getStartedOpen} setOpen={setGetStartedOpen} />
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-stone-700 xl:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white xl:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === link.href ? "bg-brand-50 text-brand-700" : "text-stone-700 hover:bg-stone-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-stone-200 pt-4">
              <Link
                href="/immigration-consultancy#inquiry"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-immigration-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Plane className="h-4 w-4" /> Start Immigration Case
              </Link>
              <Link
                href="/marriage-consultancy#inquiry"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-marriage-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <HeartHandshake className="h-4 w-4" /> Begin Marriage Profile
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}

function GetStartedMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Get Started
        <ChevronDown className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          <Link
            href="/immigration-consultancy#inquiry"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 px-4 py-3 hover:bg-immigration-50"
          >
            <Plane className="mt-0.5 h-5 w-5 text-immigration-600" />
            <span>
              <span className="block text-sm font-semibold text-stone-900">Immigration Consultancy</span>
              <span className="block text-xs text-stone-500">Document prep, checklists, case tracking</span>
            </span>
          </Link>
          <Link
            href="/marriage-consultancy#inquiry"
            onClick={() => setOpen(false)}
            className="flex items-start gap-3 px-4 py-3 hover:bg-marriage-50"
          >
            <HeartHandshake className="mt-0.5 h-5 w-5 text-marriage-600" />
            <span>
              <span className="block text-sm font-semibold text-stone-900">Marriage Consultancy</span>
              <span className="block text-xs text-stone-500">Verified profiles, guided introductions</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
