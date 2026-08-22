import type { Metadata } from "next";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/forms/contact-form";
import { socialLinks, officeAddress } from "@/data/nav";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Have a question before you start? We're happy to help — reach Pioneer Trio Services directly.",
};

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Have a question before you start? We&apos;re happy to help.
          </h1>

          <div className="mt-8 space-y-5 text-stone-700">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-semibold text-stone-900">Office</p>
                <p className="text-sm text-stone-600">{officeAddress}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-semibold text-stone-900">Phone / WhatsApp</p>
                <p className="text-sm text-stone-600">To be added by the founding partners.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="font-semibold text-stone-900">Email</p>
                <p className="text-sm text-stone-600">To be added by the founding partners.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-sm text-stone-600">We respond within one business day.</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
