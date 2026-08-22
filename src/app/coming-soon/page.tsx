import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NotifyForm } from "@/components/forms/notify-form";

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "A vetted caregiver marketplace for children with additional needs and seniors, launching in Dhaka.",
};

export default function ComingSoonPage() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900">Coming Next From Pioneer Trio Services</h1>
        <p className="mt-4 text-stone-600">
          A vetted caregiver marketplace connecting Bangladeshi families with trusted care for
          children with additional needs and for aging parents, launching in Dhaka.
        </p>
        <p className="mt-2 text-stone-600">Leave your email to be notified when it launches.</p>
        <div className="mt-8">
          <NotifyForm />
        </div>
      </Container>
    </section>
  );
}
