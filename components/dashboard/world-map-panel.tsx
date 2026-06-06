"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { ExternalLink, LocateFixed, Minus, MousePointerClick, Move, Plus, RotateCcw } from "lucide-react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

import { ConfidenceBadge, RegimeBadge } from "@/components/ui/badges";
import { FlagBadge } from "@/components/ui/flag-badge";
import { formatNumber } from "@/lib/format";
import { displayCountryName, displayRegion, displayValue } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CountryPoliticalProfile, RegimeCategory } from "@/lib/types";

type GeoFeature = {
  id?: string | number;
  properties?: {
    name?: string;
  };
  geometry?: unknown;
};

type Transform = {
  scale: number;
  x: number;
  y: number;
};

type MapFeature = {
  d: string;
  numericId: string;
  geoName: string;
  country?: CountryPoliticalProfile;
};

const MAP_WIDTH = 960;
const MAP_HEIGHT = 520;
const MIN_SCALE = 1;
const MAX_SCALE = 7;

const regimeFill: Record<RegimeCategory, string> = {
  "Liberal democracy": "#10b981",
  "Electoral democracy": "#eab308",
  "Electoral autocracy": "#f97316",
  "Closed autocracy": "#ef4444",
  "Hybrid regime": "#a16207",
  Unknown: "#334155"
};

export function WorldMapPanel({ countries }: { countries: CountryPoliticalProfile[] }) {
  const countriesByNumeric = useMemo(() => {
    return new Map(countries.map((country) => [country.numericCode?.padStart(3, "0"), country]));
  }, [countries]);

  const countriesByIso3 = useMemo(() => new Map(countries.map((country) => [country.iso3, country])), [countries]);

  const mapFeatures = useMemo(() => {
    const collection = feature(
      worldAtlas as never,
      (worldAtlas.objects as Record<string, never>).countries
    ) as unknown as { features: GeoFeature[] };

    const projection = geoNaturalEarth1().fitSize([MAP_WIDTH, MAP_HEIGHT], collection as never);
    const path = geoPath(projection);

    const paths: MapFeature[] = [];
    for (const geo of collection.features) {
      const numericId = String(geo.id ?? "").padStart(3, "0");
      const d = path(geo as never);
      if (!d) {
        continue;
      }

      paths.push({
        d,
        numericId,
        geoName: geo.properties?.name ?? numericId,
        country: countriesByNumeric.get(numericId)
      });
    }

    return paths;
  }, [countriesByNumeric]);

  const [activeIso3, setActiveIso3] = useState(
    countriesByIso3.get("VNM")?.iso3 ?? mapFeatures.find((item) => item.country)?.country?.iso3
  );
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; transform: Transform } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeCountry =
    (activeIso3 ? countriesByIso3.get(activeIso3) : undefined) ?? mapFeatures.find((item) => item.country)?.country;

  function setActiveCountry(country?: CountryPoliticalProfile) {
    if (country) {
      setActiveIso3(country.iso3);
    }
  }

  function zoomBy(delta: number, anchor = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 }) {
    setTransform((current) => {
      const nextScale = clamp(current.scale + delta, MIN_SCALE, MAX_SCALE);
      return zoomAtPoint(current, nextScale, anchor);
    });
  }

  function resetMap() {
    setTransform({ scale: 1, x: 0, y: 0 });
  }

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const listener = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const anchor = {
        x: ((event.clientX - rect.left) / rect.width) * MAP_WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT
      };
      const direction = event.deltaY > 0 ? -0.35 : 0.35;
      zoomBy(direction, anchor);
    };
    el.addEventListener("wheel", listener as EventListener, { passive: false });
    return () => el.removeEventListener("wheel", listener as EventListener);
  }, []);

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      transform
    };
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!dragStartRef.current) {
      return;
    }

    const next = {
      scale: dragStartRef.current.transform.scale,
      x: dragStartRef.current.transform.x + ((event.clientX - dragStartRef.current.x) / event.currentTarget.clientWidth) * MAP_WIDTH,
      y: dragStartRef.current.transform.y + ((event.clientY - dragStartRef.current.y) / event.currentTarget.clientHeight) * MAP_HEIGHT
    };
    setTransform(limitTransform(next));
  }

  function handlePointerUp(event: PointerEvent<SVGSVGElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsPanning(false);
    dragStartRef.current = null;
  }

  return (
    <section id="map" className="atlas-surface overflow-hidden rounded-lg">
      <div className="flex flex-col gap-4 border-b border-slate-700/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Bản đồ phân mảnh theo quốc gia</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Bản đồ chính trị thế giới</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-md border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          <MousePointerClick className="h-4 w-4" aria-hidden="true" />
          Di chuột vào từng quốc gia để xem dữ liệu
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative min-h-[560px] overflow-hidden bg-[#07101f]">
          <div className="absolute left-5 top-5 z-20 flex flex-wrap items-center gap-2">
            <button className="map-control" type="button" onClick={() => zoomBy(0.5)} aria-label="Phóng to bản đồ">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button className="map-control" type="button" onClick={() => zoomBy(-0.5)} aria-label="Thu nhỏ bản đồ">
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button className="map-control" type="button" onClick={resetMap} aria-label="Đặt lại bản đồ">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-600 bg-slate-950/85 px-3 text-xs text-slate-300">
              <Move className="h-3.5 w-3.5 text-teal-200" aria-hidden="true" />
              Kéo để di chuyển · Cuộn để zoom
            </span>
          </div>

          <svg
            ref={svgRef}
            className={cn("h-[560px] w-full select-none", isPanning ? "cursor-grabbing" : "cursor-grab")}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-label="Bản đồ thế giới phân tách theo quốc gia"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <defs>
              <pattern id="atlas-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(148,163,184,0.11)" strokeWidth="1" />
              </pattern>
              <filter id="country-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2dd4bf" floodOpacity="0.45" />
              </filter>
            </defs>

            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#07101f" />
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#atlas-grid)" opacity="0.85" />

            <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
              {mapFeatures.map((item, index) => {
                const country = item.country;
                const isActive = country?.iso3 === activeCountry?.iso3;
                const fill = regimeFill[country?.regimeCategory ?? "Unknown"];

                return (
                  <Link
                    key={`${item.numericId}-${index}`}
                    href={country ? `/countries/${country.iso3}` : "#map"}
                    aria-label={country ? `Mở hồ sơ ${displayCountryName(country)}` : `Không có hồ sơ cho ${item.geoName}`}
                    onClick={(event) => {
                      if (!country) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <path
                      d={item.d}
                      tabIndex={country ? 0 : -1}
                      className={cn(
                        "outline-none transition duration-150",
                        country ? "cursor-pointer hover:brightness-125 focus:brightness-125" : "cursor-not-allowed opacity-40"
                      )}
                      fill={country ? fill : "#1f2937"}
                      fillOpacity={isActive ? 0.96 : country ? 0.78 : 0.36}
                      stroke={isActive ? "#f8fafc" : "#0f172a"}
                      strokeWidth={isActive ? 1.8 / transform.scale : 0.65 / transform.scale}
                      filter={isActive ? "url(#country-glow)" : undefined}
                      vectorEffect="non-scaling-stroke"
                      onMouseEnter={() => setActiveCountry(country)}
                      onFocus={() => setActiveCountry(country)}
                    >
                      <title>
                        {country
                          ? `${displayCountryName(country)} · ${displayValue(country.governmentSystem)}`
                          : `${item.geoName} · chưa có hồ sơ`}
                      </title>
                    </path>
                  </Link>
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="border-t border-slate-700/60 bg-slate-950/45 p-5 lg:border-l lg:border-t-0" aria-live="polite">
          {activeCountry ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <FlagBadge country={activeCountry} variant="hero" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-teal-200">{activeCountry.iso3}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{displayCountryName(activeCountry)}</h3>
                  <p className="text-sm text-slate-400">{displayRegion(activeCountry.region)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <RegimeBadge value={activeCountry.regimeCategory} />
                <ConfidenceBadge value={activeCountry.confidenceLevel} />
                <span className="inline-flex min-h-7 items-center rounded-md border border-slate-600 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                  Zoom: {Math.round(transform.scale * 100)}%
                </span>
              </div>

              <dl className="grid gap-3 text-sm">
                <MapFact label="Thủ đô" value={activeCountry.capital} />
                <MapFact label="Dân số" value={formatNumber(activeCountry.population)} />
                <MapFact label="Hệ tư tưởng chính thức" value={activeCountry.officialIdeology} />
                <MapFact label="Hình thức nhà nước" value={activeCountry.stateForm} />
                <MapFact label="Mô hình chính phủ" value={activeCountry.governmentSystem} />
                <MapFact label="Cấu trúc quyền lực" value={activeCountry.powerStructure} />
              </dl>

              <Link href={`/countries/${activeCountry.iso3}`} className="atlas-button focus-ring w-full px-4">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Mở hồ sơ chi tiết
              </Link>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-700 text-center text-sm text-slate-400">
              Di chuột lên một quốc gia để xem dữ liệu.
            </div>
          )}
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-5">
        <span className="mr-1 text-sm text-slate-400">Chú giải chế độ:</span>
        <RegimeBadge value="Liberal democracy" />
        <RegimeBadge value="Electoral democracy" />
        <RegimeBadge value="Electoral autocracy" />
        <RegimeBadge value="Closed autocracy" />
        <RegimeBadge value="Unknown" />
        <span className="ml-auto inline-flex items-center gap-2 text-xs text-slate-500">
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          Ranh giới quốc gia được hiển thị để quan sát và so sánh trực quan
        </span>
      </div>
    </section>
  );
}

function MapFact({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/55 p-3">
      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-1 leading-6 text-slate-100">{displayValue(value)}</dd>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function limitTransform(transform: Transform): Transform {
  if (transform.scale <= 1) {
    return {
      scale: 1,
      x: 0,
      y: 0
    };
  }

  const minX = MAP_WIDTH - MAP_WIDTH * transform.scale;
  const minY = MAP_HEIGHT - MAP_HEIGHT * transform.scale;

  return {
    scale: transform.scale,
    x: clamp(transform.x, minX, 0),
    y: clamp(transform.y, minY, 0)
  };
}

function zoomAtPoint(current: Transform, nextScale: number, anchor: { x: number; y: number }) {
  if (nextScale <= MIN_SCALE) {
    return {
      scale: MIN_SCALE,
      x: 0,
      y: 0
    };
  }

  const ratio = nextScale / current.scale;
  return limitTransform({
    scale: nextScale,
    x: anchor.x - (anchor.x - current.x) * ratio,
    y: anchor.y - (anchor.y - current.y) * ratio
  });
}
