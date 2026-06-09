import { cn } from "@/lib/utils";
import type { CountryPoliticalProfile } from "@/lib/types";

type FlagBadgeVariant = "marker" | "card" | "hero" | "inline";

const badgeClasses: Record<FlagBadgeVariant, string> = {
  marker: "h-9 min-w-[58px] gap-1.5 rounded-md px-1.5 text-[10px] shadow-lg",
  card: "h-12 min-w-[76px] gap-2 rounded-md px-2 text-xs",
  hero: "h-16 min-w-[104px] gap-2.5 rounded-lg px-3 text-sm",
  inline: "h-8 min-w-[64px] gap-1.5 rounded-md px-2 text-xs"
};

const flagClasses: Record<FlagBadgeVariant, string> = {
  marker: "h-5 w-7 rounded-sm",
  card: "h-7 w-10 rounded",
  hero: "h-9 w-14 rounded",
  inline: "h-5 w-8 rounded-sm"
};

export function FlagBadge({
  country,
  variant = "card",
  active = false,
  className,
  showIso = true
}: {
  country: Pick<CountryPoliticalProfile, "iso2" | "iso3" | "flagEmoji" | "flagUrl" | "countryName">;
  variant?: FlagBadgeVariant;
  active?: boolean;
  className?: string;
  showIso?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border bg-slate-950/90 font-semibold uppercase tracking-[0.08em] text-slate-100 transition",
        active
          ? "border-teal-200 shadow-teal-900/40"
          : "border-slate-600 group-hover:border-teal-200 group-focus:border-teal-200",
        badgeClasses[variant],
        className
      )}
      title={`${country.countryName} (${country.iso3})`}
    >
      {country.flagUrl ? (
        <img
          src={country.flagUrl}
          alt={`Cờ ${country.countryName}`}
          className={cn("object-cover shadow-sm", flagClasses[variant])}
          loading="lazy"
        />
      ) : (
        <span className={cn("grid place-items-center text-lg", flagClasses[variant])} aria-label={`Cờ ${country.countryName}`}>
          {country.flagEmoji}
        </span>
      )}
      {showIso ? <span>{variant === "marker" ? country.iso2 : country.iso3}</span> : null}
    </span>
  );
}

