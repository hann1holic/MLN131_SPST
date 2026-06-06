import type { RegimeCategory } from "@/lib/types";

export const regimeColorClasses: Record<string, string> = {
  "Liberal democracy": "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  "Electoral democracy": "border-yellow-300/40 bg-yellow-400/15 text-yellow-100",
  "Electoral autocracy": "border-orange-400/40 bg-orange-500/15 text-orange-100",
  "Closed autocracy": "border-red-400/40 bg-red-500/15 text-red-100",
  "Hybrid regime": "border-amber-300/40 bg-amber-400/15 text-amber-100",
  Unknown: "border-slate-400/30 bg-slate-500/15 text-slate-100"
};

export function getRegimeColorClass(label: string) {
  return regimeColorClasses[label] || "border-purple-400/40 bg-purple-500/15 text-purple-100";
}

export function formatNumber(value?: number) {
  if (typeof value !== "number") {
    return "Chưa có dữ liệu";
  }

  return new Intl.NumberFormat("en", {
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatPlainNumber(value?: number) {
  if (typeof value !== "number") {
    return "Chưa có dữ liệu";
  }

  return new Intl.NumberFormat("en").format(value);
}
