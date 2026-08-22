import { ChevronDown } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
      {items.map((item) => (
        <details key={item.question} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-900">
            {item.question}
            <ChevronDown
              className="h-5 w-5 shrink-0 text-stone-400 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-stone-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
