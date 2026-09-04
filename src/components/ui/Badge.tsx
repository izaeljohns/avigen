import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "teal" | "amber" | "rose" | "violet" | "sky" | "emerald";
}) {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-800",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-800",
    sky: "bg-sky-50 text-sky-800",
    emerald: "bg-emerald-50 text-emerald-800",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", map[tone])}>
      {children}
    </span>
  );
}
