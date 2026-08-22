import { type ReactNode } from "react";
import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "brand",
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "brand" | "immigration" | "marriage";
}) {
  const eyebrowColor = {
    brand: "text-brand-700",
    immigration: "text-immigration-700",
    marriage: "text-marriage-700",
  }[tone];

  return (
    <div className={clsx("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={clsx("mb-3 text-sm font-semibold tracking-wide uppercase", eyebrowColor)}>
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-stone-600">{description}</p>}
    </div>
  );
}
