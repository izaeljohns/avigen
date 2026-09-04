import { cn } from "../../lib/cn";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-sm shadow-brand-700/20",
  secondary:
    "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  outline:
    "border border-brand-700 text-brand-800 hover:bg-brand-50",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
