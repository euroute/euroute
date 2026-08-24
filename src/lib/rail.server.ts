// Server-only integration mot Transitous (MOTIS 2), ett öppet europeiskt
// reseplanerings-API. Kräver User-Agent och attribuering av datakällor.

import { BudgetExhausted, cached, type UpstreamBudget } from "./abuse.server";
import { upstreamError } from "./safe-error";
import { MODE_LABELS, TRAIN_MODES, type Journey, type Leg, type Place } from "./journey";

const BASE = "https://api.transitous.org";

/**
 * Short-lived caches. Station names change on the scale of months, so a long
 * TTL is safe there. Timetable results carry real-time data, so their TTL is
 * deliberately short – long enough to absorb rerenders, back-navigation,
 * duplicate searches and overlapping Smart Overnight candidate evaluation,
 * short enough that a traveller never plans on stale departures.
 */
const GEOCODE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const PLAN_TTL_MS = 90 * 1000; // 90 seconds
const USER_AGENT = "Euroute/0.1 (https://euroute.lovable.app; European rail journey planner)";

const TRAIN_SET = new Set<string>(TRAIN_MODES);

type MotisPlace = {
  name: string;
  lat: number;
  lon: number;
  arrival?: string;
  departure?: string;
  scheduledArrival?: string;
  scheduledDeparture?: string;
};

type MotisLeg = {
  mode: string;
  from: MotisPlace;
  to: MotisPlace;
  startTime: string;
  endTime: string;
  duration: number;
  realTime?: boolean;
  agencyName?: string;
  agencyUrl?: string;
  routeShortName?: string;
  displayName?: string;
  headsign?: string;
};

type MotisItinerary = {
  duration: number;
  startTime: string;
  endTime: string;
  transfers: number;
  legs: MotisLeg[];
};

async function motisGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (!response.ok) {
    throw upstreamError("timetable", response.status);
  }
  return (await response.json()) as T;
}

type GeocodeHit = {
  type: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  modes?: string[];
  areas?: { name: string; adminLevel: number; default?: boolean }[];
};

/** Languages Euroute may forward to the geocoder. Never client-defined. */
export type GeocodeLanguage = "sv" | "en";

export async function geocodePlaces(
  text: string,
  language: GeocodeLanguage = "sv",
): Promise<Place[]> {
  const query = text.trim().toLowerCase();
  const lang: GeocodeLanguage = language === "en" ? "en" : "sv";
  const hits = await cached(`geocode:${lang}:${query}`, GEOCODE_TTL_MS, () =>
    motisGet<GeocodeHit[]>("/api/v1/geocode", { text, language: lang }),
  );

  const seen = new Set<string>();
  const results: Place[] = [];

  for (const hit of hits) {
    const isStop = hit.type === "STOP";
    const hasRail = (hit.modes ?? []).some((m) => TRAIN_SET.has(m));
    if (!isStop && hit.type !== "PLACE") continue;

    const region = hit.areas?.find((a) => a.adminLevel <= 4)?.name;
    const label = region && !hit.name.includes(region) ? `${hit.name}, ${region}` : hit.name;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      name: label,
      place: `${hit.lat.toFixed(6)},${hit.lon.toFixed(6)}`,
      country: hit.country,
    });

    // Ranka stationer med tågtrafik högst
    if (isStop && hasRail && results.length >= 8) break;
    if (results.length >= 10) break;
  }

  return results;
}

function legKind(mode: string): Leg["kind"] {
  if (TRAIN_SET.has(mode)) return "train";
  if (mode === "BUS" || mode === "COACH") return "bus";
  if (mode === "WALK" || mode === "BIKE") return "walk";
  return "other";
}

function normalizeLeg(leg: MotisLeg): Leg {
  const trainName = leg.displayName?.trim() || leg.routeShortName?.trim() || undefined;
  return {
    kind: legKind(leg.mode),
    mode: leg.mode,
    modeLabel: MODE_LABELS[leg.mode] ?? leg.mode,
    fromName: leg.from.name === "START" ? "Startpunkt" : leg.from.name,
    toName: leg.to.name === "END" ? "Slutpunkt" : leg.to.name,
    fromPlace:
      Number.isFinite(leg.from.lat) && Number.isFinite(leg.from.lon)
        ? `${leg.from.lat.toFixed(6)},${leg.from.lon.toFixed(6)}`
        : undefined,
    toPlace:
      Number.isFinite(leg.to.lat) && Number.isFinite(leg.to.lon)
        ? `${leg.to.lat.toFixed(6)},${leg.to.lon.toFixed(6)}`
        : undefined,
    departure: leg.startTime,
    arrival: leg.endTime,
    durationMinutes: Math.round(leg.duration / 60),
    operator: leg.agencyName || undefined,
    operatorUrl: leg.agencyUrl || undefined,
    trainName,
    headsign: leg.headsign || undefined,
    realTime: Boolean(leg.realTime),
  };
}

function buildJourney(legs: Leg[], chained: boolean, index: number): Journey {
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  const transit = legs.filter((l) => l.kind !== "walk");
  const gaps: number[] = [];
  for (let i = 1; i < transit.length; i += 1) {
    gaps.push(
      Math.round(
        (new Date(transit[i]!.departure).getTime() - new Date(transit[i - 1]!.arrival).getTime()) /
          60000,
      ),
    );
  }

  return {
    id: `${first.departure}-${last.arrival}-${index}`,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: Math.round(
      (new Date(last.arrival).getTime() - new Date(first.departure).getTime()) / 60000,
    ),
    transfers: Math.max(transit.length - 1, 0),
    minTransferMinutes: gaps.length ? Math.min(...gaps) : undefined,
    legs,
    operators: Array.from(new Set(transit.map((l) => l.operator).filter(Boolean) as string[])),
    hasNightLeg: transit.some((l) => l.mode === "NIGHT_RAIL" || l.durationMinutes > 240),
    chained,
  };
}

async function planSegment(args: {
  fromPlace: string;
  toPlace: string;
  time: string;
  maxTransfers: number;
  numItineraries: number;
  budget?: UpstreamBudget | undefined;
}): Promise<MotisItinerary[]> {
  const params = {
    fromPlace: args.fromPlace,
    toPlace: args.toPlace,
    time: args.time,
    transitModes: "RAIL",
    numItineraries: String(args.numItineraries),
    maxTransfers: String(Math.max(args.maxTransfers, 0)),
    timetableView: "false",
  };
  // Cache key covers every parameter that materially affects the result.
  const key = `plan:${Object.values(params).join("|")}`;
  try {
    const data = await cached(
      key,
      PLAN_TTL_MS,
      () => motisGet<{ itineraries?: MotisItinerary[] }>("/api/v3/plan", params),
      args.budget ? () => args.budget!.consume() : undefined,
    );
    return (data.itineraries ?? []).filter((it) => it.legs.length > 0);
  } catch (error) {
    // Budget exhaustion is a normal stop condition, not a failure: the caller
    // keeps whatever it has already found and simply stops exploring.
    if (error instanceof BudgetExhausted) return [];
    throw error;
  }
}

export async function planJourneys(args: {
  from: Place;
  to: Place;
  via: Place[];
  departAt: string;
  maxTransfers: number;
  minTransferMinutes: number;
  budget?: UpstreamBudget | undefined;
}): Promise<Journey[]> {
  const stops = [args.from, ...args.via, args.to];

  if (stops.length === 2) {
    const itineraries = await planSegment({
      fromPlace: args.from.place,
      toPlace: args.to.place,
      time: args.departAt,
      maxTransfers: args.maxTransfers,
      numItineraries: 6,
      budget: args.budget,
    });
    return itineraries
      .map((it, index) => buildJourney(it.legs.map(normalizeLeg), false, index))
      .filter((j) => j.legs.some((l) => l.kind === "train"));
  }

  // Med mellanstopp: kedja delsökningar och låt varje etapp utgå efter
  // föregående ankomst plus önskad bytesmarginal.
  const chains: Leg[][] = [];
  const branches = 3;

  for (let branch = 0; branch < branches; branch += 1) {
    let cursor = args.departAt;
    const legs: Leg[] = [];
    let ok = true;

    for (let s = 0; s < stops.length - 1; s += 1) {
      const options = await planSegment({
        fromPlace: stops[s]!.place,
        toPlace: stops[s + 1]!.place,
        time: cursor,
        maxTransfers: args.maxTransfers,
        numItineraries: branches + 1,
        budget: args.budget,
      });
      const pick = options[s === 0 ? Math.min(branch, options.length - 1) : 0];
      if (!pick) {
        ok = false;
        break;
      }
      legs.push(...pick.legs.map(normalizeLeg));
      const arrival = new Date(pick.endTime).getTime();
      cursor = new Date(arrival + args.minTransferMinutes * 60000).toISOString();
    }

    if (ok && legs.length > 0) chains.push(legs);
  }

  const journeys = chains.map((legs, index) => buildJourney(legs, true, index));
  const unique = new Map<string, Journey>();
  for (const journey of journeys) {
    unique.set(`${journey.departure}-${journey.arrival}`, journey);
  }
  return Array.from(unique.values()).sort((a, b) => a.durationMinutes - b.durationMinutes);
}
