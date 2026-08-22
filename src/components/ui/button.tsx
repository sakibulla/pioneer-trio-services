import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import clsx from "clsx";

type Tone = "brand" | "immigration" | "marriage" | "neutral";
type Variant = "solid" | "outline";

const toneSolid: Record<Tone, string> = {
  brand: "bg-brand-600 text-white hover:bg-brand-700",
  immigration: "bg-immigration-600 text-white hover:bg-immigration-700",
  marriage: "bg-marriage-600 text-white hover:bg-marriage-700",
  neutral: "bg-stone-900 text-white hover:bg-stone-700",
};

const toneOutline: Record<Tone, string> = {
  brand: "border-brand-600 text-brand-700 hover:bg-brand-50",
  immigration: "border-immigration-600 text-immigration-700 hover:bg-immigration-50",
  marriage: "border-marriage-600 text-marriage-700 hover:bg-marriage-50",
  neutral: "border-stone-300 text-stone-800 hover:bg-stone-50",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

interface CommonProps {
  tone?: Tone;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Button({
  tone = "brand",
  variant = "solid",
  children,
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        base,
        variant === "solid" ? toneSolid[tone] : clsx("border-2 bg-transparent", toneOutline[tone]),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  tone = "brand",
  variant = "solid",
  children,
  className,
  href,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        base,
        variant === "solid" ? toneSolid[tone] : clsx("border-2 bg-transparent", toneOutline[tone]),
        className
      )}
    >
      {children}
    </Link>
  );
}
