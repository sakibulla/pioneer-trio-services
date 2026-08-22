import clsx from "clsx";

export function ProcessSteps({
  steps,
  tone = "brand",
}: {
  steps: string[];
  tone?: "brand" | "immigration" | "marriage";
}) {
  const numberColor = {
    brand: "bg-brand-600",
    immigration: "bg-immigration-600",
    marriage: "bg-marriage-600",
  }[tone];

  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step} className="flex gap-4">
          <span
            className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
              numberColor
            )}
          >
            {i + 1}
          </span>
          <p className="pt-1 text-stone-700">{step}</p>
        </li>
      ))}
    </ol>
  );
}
