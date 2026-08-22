import Link from "next/link";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { footerNav, socialLinks, officeAddress } from "@/data/nav";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <Container className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-stone-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                P3
              </span>
              Pioneer Trio Services
            </Link>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-stone-600">
              <MapPin className="h-4 w-4" /> {officeAddress}
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:flex sm:gap-6">
            {footerNav.map((link) => (
              <Link key={link.href} href={link.href} className="text-stone-600 hover:text-brand-700">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-4 text-sm">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 hover:text-brand-700"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-stone-200 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Pioneer Trio Services. All rights reserved.</p>
          <p>
            Coming next: a caregiver marketplace for children with additional needs and seniors.{" "}
            <Link href="/coming-soon" className="font-medium text-brand-700 hover:underline">
              Learn more
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
