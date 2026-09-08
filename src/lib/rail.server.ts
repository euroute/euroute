// Server-only integration mot Transitous (MOTIS 2), ett öppet europeiskt
// reseplanerings-API. Kräver User-Agent och attribuering av datakällor.

import { BudgetExhausted, cached, type UpstreamBudget } from "./abuse.server";
import { upstreamError, upstreamStatus } from "./safe-error";
import {
  MAX_STOP_ID_LENGTH,
  MODE_LABELS,
  TRAIN_MODES,
  firstRailDeparture,
  trimAccessLegs,
  type Journey,
  type Leg,
  type Place,
  type PlaceIntent,
} from "./journey";
import { preAnalyseJourneys } from "./journey-intelligence";
import { journeyHasNightTrain } from "./night-train";
import {
  classifyHit,
  isRailStation,
  selectCandidates,
  stopIdOf,
  type GeocodeHitLike,
} from "./station-classify";
import { isCityEndpoint, planEndpoint, segmentRadius } from "./stop-endpoint";
import {
  CITY_RADIUS_LADDER_M,
  boundingBox,
  resolveCityStations,
  sameStationComplex,
  type CityResolution,
} from "./city-station";



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
const USER_AGENT = "Euroute/0.1 (https://euroute.app; European rail journey planner)";

const TRAIN_SET = new Set<string>(TRAIN_MODES);

export { MAX_CANDIDATE_JOURNEYS, MIN_USABLE_JOURNEYS } from "./journey-limits";
import { MAX_CANDIDATE_JOURNEYS, MIN_USABLE_JOURNEYS } from "./journey-limits";
import { applyDepartureHorizon } from "./departure-horizon";


/**
 * Recovery decision, taken on the shared pre-analysis semantics only
 * (validation → passenger dedupe → Phase E → F1.5). Score, travel-style
 * ranking and profile diversity never influence retrieval.
 */
function needsCursorRecovery(journeys: Journey[], minTransferMinutes: number): boolean {
  return preAnalyseJourneys(journeys, minTransferMinutes).usable.length < MIN_USABLE_JOURNEYS;
}

/**
 * Memory/response bound. The cap protects the response size; it must never
 * prefer an unusable candidate over a usable one, so usable journeys are kept
 * first (earliest departure first) and passenger duplicates are dropped
 * outright. Unusable candidates only fill the remaining slots, which keeps the
 * existing all-unusable UI state intact when nothing usable exists.
 */
function capCandidates(journeys: Journey[], minTransferMinutes: number): Journey[] {
  const byDeparture = [...journeys].sort(
    (a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime(),
  );
  const pre = preAnalyseJourneys(byDeparture, minTransferMinutes);
  const usableIds = new Set(pre.usable.map((item) => item.journey.id));
  const unusableIds = new Set(pre.unusable.map((item) => item.journey.id));
  return [
    ...byDeparture.filter((j) => usableIds.has(j.id)),
    ...byDeparture.filter((j) => unusableIds.has(j.id)),
  ].slice(0, MAX_CANDIDATE_JOURNEYS);
}



type MotisPlace = {
  name: string;
  lat: number;
  lon: number;
  /** Upstream identity metadata observed in live Transitous plan responses. */
  stopId?: string;
  parentId?: string;
  level?: number;
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

type GeocodeHit = GeocodeHitLike;

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

  const candidates = selectCandidates(hits);
  const cityIndex = candidates.findIndex((c) => c.kind === "city");

  // Explicit station selections never go through city logic: only a genuine
  // city PLACE triggers resolution, and at most one per query (API cost).
  if (cityIndex === -1) return hitsToPlaces(candidates.map((c) => c.hit));

  const city = candidates[cityIndex]!.hit;
  let resolution: CityResolution = { primary: null, siblings: [] };
  try {
    resolution = resolveCityStations(city, await stopsNearCity(city));
  } catch (error) {
    // A failed resolution must never break autocomplete: fall back to phase 1.
    console.error("city station resolution failed", error);
  }

  const ordered: GeocodeHit[] = [];
  candidates.forEach((candidate, index) => {
    ordered.push(candidate.hit);
    // Phase 3B: the city keeps its own identity and city intent – the resolved
    // primary station is offered next to it as an explicit choice instead of
    // silently taking its place as the routing endpoint.
    if (index === cityIndex && resolution.primary) ordered.push(resolution.primary.hit);
  });
  for (const sibling of resolution.siblings) ordered.push(sibling.hit);

  // A resolved station is often also a direct geocode hit; keep the first
  // occurrence so the list never shows the same station twice.
  const unique = ordered.filter(
    (hit, index) => !ordered.slice(0, index).some((earlier) => sameStationComplex(earlier, hit)),
  );

  return hitsToPlaces(unique);
}

/** Rail-capable stops around a city centre, cached like any geocode lookup. */
async function stopsNearCity(city: GeocodeHit): Promise<GeocodeHit[]> {
  // Dense metros exceed the upstream stop cap for the widest box, so we shrink
  // the radius until the query is accepted. Every attempt is cached for 6 h.
  let lastError: unknown = null;
  for (const radius of CITY_RADIUS_LADDER_M) {
    const box = boundingBox(city.lat, city.lon, radius);
    try {
      return await cached(`stops:${box.min}:${box.max}`, GEOCODE_TTL_MS, () =>
        motisGet<GeocodeHit[]>("/api/v1/map/stops", { min: box.min, max: box.max }),
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** Pure step: classified + ranked geocode hits mapped to the Place contract. */
export function toPlaces(hits: GeocodeHit[], limit = 10): Place[] {
  return hitsToPlaces(
    selectCandidates(hits, { limit }).map((c) => c.hit),
    limit,
  );
}

/** Pure step: already-selected hits mapped to labelled, deduplicated Places. */
export function hitsToPlaces(hits: GeocodeHit[], limit = 10): Place[] {
  const seen = new Set<string>();
  const results: Place[] = [];

  for (const hit of hits) {
    const region = hit.areas?.find((a) => a.adminLevel <= 4)?.name;
    const label = region && !hit.name.includes(region) ? `${hit.name}, ${region}` : hit.name;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    // Only genuine rail endpoints carry an id: a city PLACE that never resolved
    // to a station stays coordinate-only, exactly as before.
    const rail = isRailStation(hit);
    const stopId = rail ? stopIdOf(hit) : undefined;
    // Phase 3B intent: a rail STOP is an explicit station choice, a settlement
    // PLACE is a city choice. Nothing else is ever labelled.
    const intent: PlaceIntent | undefined = rail
      ? "station"
      : classifyHit(hit).kind === "city"
        ? "city"
        : undefined;

    results.push({
      name: label,
      place: `${hit.lat.toFixed(6)},${hit.lon.toFixed(6)}`,
      country: hit.country,
      ...(stopId && stopId.length <= MAX_STOP_ID_LENGTH ? { stopId } : {}),
      ...(intent ? { intent } : {}),
    });
    if (results.length >= limit) break;
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
    fromStopId: leg.from.stopId || undefined,
    toStopId: leg.to.stopId || undefined,
    fromParentId: leg.from.parentId || undefined,
    toParentId: leg.to.parentId || undefined,
    fromLevel: typeof leg.from.level === "number" ? leg.from.level : undefined,
    toLevel: typeof leg.to.level === "number" ? leg.to.level : undefined,
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
    hasNightLeg: journeyHasNightTrain({ legs }),
    chained,
  };
}

type SegmentPage = {
  itineraries: MotisItinerary[];
  /** Opaque MOTIS cursor for the next timetable page ("LATER|<unix>"). */
  nextPageCursor?: string | undefined;
};

async function requestSegment(args: {
  fromPlace: string;
  toPlace: string;
  time: string;
  maxTransfers: number;
  numItineraries: number;
  /**
   * Phase F1: departure coverage. With timetableView=true Transitous returns
   * successive departures in the SAME request, which is why ordinary two-point
   * searches use it. Chained Via segments keep the old anchored behaviour.
   */
  timetableView?: boolean | undefined;
  /** Phase 3B: only set for city-intent endpoints. */
  radius?: number | undefined;
  /**
   * Phase F3: opaque cursor from a previous page of the SAME request. MOTIS
   * still requires every original parameter; the cursor only moves the
   * timetable window, so endpoint semantics are preserved verbatim.
   */
  pageCursor?: string | undefined;
  budget?: UpstreamBudget | undefined;
}): Promise<SegmentPage> {
  const params = {
    fromPlace: args.fromPlace,
    toPlace: args.toPlace,
    time: args.time,
    transitModes: "RAIL",
    numItineraries: String(args.numItineraries),
    maxTransfers: String(Math.max(args.maxTransfers, 0)),
    timetableView: args.timetableView ? "true" : "false",
    ...(args.radius ? { radius: String(args.radius) } : {}),
    // Appended last and only when present, so a first-page cache key is
    // byte-identical to before Phase F3 and can never collide with a
    // cursor-page response for the same search.
    ...(args.pageCursor ? { pageCursor: args.pageCursor } : {}),
  };

  // Cache key covers every parameter that materially affects the result, so an
  // exact-stop request and a coordinate request can never collide.
  const key = `plan:${Object.values(params).join("|")}`;
  const data = await cached(
    key,
    PLAN_TTL_MS,
    () =>
      motisGet<{ itineraries?: MotisItinerary[]; nextPageCursor?: string }>(
        "/api/v3/plan",
        params,
      ),
    args.budget ? () => args.budget!.consume() : undefined,
  );
  return {
    itineraries: (data.itineraries ?? []).filter((it) => it.legs.length > 0),
    nextPageCursor: data.nextPageCursor || undefined,
  };
}

/**
 * Endpoint-relaterat fel? Transitous svarar 404 för ett okänt hållplats-id och
 * 400 när ett id inte kan tolkas. Allt annat (429, 5xx, nätverksfel, tomma
 * resultat) är driftstörningar eller riktiga svar och får aldrig döljas av en
 * omkörning.
 */
function isEndpointIdFailure(error: unknown): boolean {
  const status = upstreamStatus(error);
  return status === 404 || status === 400;
}

/**
 * En delsökning: exakt stations-id när Euroute känner ett pålitligt sådant,
 * annars koordinater. Vid ett endpoint-relaterat fel görs exakt ett omtag med
 * koordinater för samma delsökning – aldrig fler.
 */
async function planSegment(args: {
  from: Place;
  to: Place;
  time: string;
  maxTransfers: number;
  numItineraries: number;
  timetableView?: boolean | undefined;
  pageCursor?: string | undefined;
  budget?: UpstreamBudget | undefined;
}): Promise<SegmentPage> {

  const { from, to, ...rest } = args;
  const fromEndpoint = planEndpoint(from);
  const toEndpoint = planEndpoint(to);
  const usesStopId = fromEndpoint !== from.place || toEndpoint !== to.place;
  // Stadsavsikt: koordinat + bounded radius, så MOTIS själv får välja den
  // terminal som passar sträckan. Explicit vald station får aldrig radius.
  const radius = segmentRadius(from, to);

  const request = (opts: { coordsOnly?: boolean; withRadius?: boolean }) =>
    requestSegment({
      ...rest,
      fromPlace: opts.coordsOnly ? from.place : fromEndpoint,
      toPlace: opts.coordsOnly ? to.place : toEndpoint,
      radius: opts.withRadius ? radius : undefined,
    });

  const empty: SegmentPage = { itineraries: [] };

  try {
    const page = await request({ withRadius: true });
    // Radiussökning utan resultat: exakt ett omtag med samma koordinater utan
    // radius. Ingen krympande radie-loop, inga extra anrop i normalfallet.
    if (page.itineraries.length === 0 && radius !== undefined) {
      try {
        return await request({});
      } catch (fallbackError) {
        if (fallbackError instanceof BudgetExhausted) return empty;
        throw fallbackError;
      }
    }
    return page;
  } catch (error) {
    // Budget exhaustion is a normal stop condition, not a failure: the caller
    // keeps whatever it has already found and simply stops exploring.
    if (error instanceof BudgetExhausted) return empty;
    if (!usesStopId || !isEndpointIdFailure(error)) throw error;
    // Transitous namnger inte vilket av ändpunkts-id:na som saknas, så omtaget
    // byter båda mot koordinater. Ett omtag, sedan vidare uppåt med felet.
    try {
      return await request({ coordsOnly: true, withRadius: true });
    } catch (fallbackError) {
      if (fallbackError instanceof BudgetExhausted) return empty;
      throw fallbackError;
    }
  }
}



/**
 * Terminal-to-terminal normalisation of a raw itinerary, per endpoint intent.
 * Runs BEFORE dedup, facts, scoring, ranking, overnight and snapshots so every
 * downstream system sees the same trimmed journey. Returns null when the
 * itinerary must be discarded (no meaningful rail anchor, or – for a city
 * origin – a rail departure earlier than the traveller's requested instant).
 */
function normalizeItinerary(args: {
  legs: Leg[];
  from: Place;
  to: Place;
  departAt: string;
  chained: boolean;
  index: number;
}): Journey | null {
  const trimmed = trimAccessLegs(args.legs, {
    trimOrigin: isCityEndpoint(args.from),
    trimDestination: isCityEndpoint(args.to),
  });
  if (!trimmed || trimmed.length === 0) return null;

  // Search-time guard: with a city origin, MOTIS optimises from the city
  // coordinate, so the first rail departure can fall before the requested
  // instant once the access leg is removed. Station semantics require the rail
  // departure itself to be at or after the requested time.
  if (isCityEndpoint(args.from)) {
    const railDeparture = firstRailDeparture(trimmed);
    if (!railDeparture) return null;
    if (new Date(railDeparture).getTime() < new Date(args.departAt).getTime()) return null;
  }

  const journey = buildJourney(trimmed, args.chained, args.index);
  return journey.legs.some((l) => l.kind === "train") ? journey : null;
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
  // Phase 3B håller Via kvar på Fas 2-modellen: mellanstopp är konkreta
  // ändpunkter (stations-id eller koordinat), aldrig stadsradius.
  const via = args.via.map((place) => ({ ...place, intent: "station" as const }));
  const stops = [args.from, ...via, args.to];

  if (stops.length === 2) {
    const normalizePage = (page: SegmentPage, offset: number): Journey[] =>
      page.itineraries
        .map((it, index) =>
          normalizeItinerary({
            legs: it.legs.map(normalizeLeg),
            from: args.from,
            to: args.to,
            departAt: args.departAt,
            chained: false,
            index: offset + index,
          }),
        )
        .filter((j): j is Journey => j !== null);

    const requestPage = (pageCursor?: string) =>
      planSegment({
        from: args.from,
        to: args.to,
        time: args.departAt,
        maxTransfers: args.maxTransfers,
        numItineraries: 6,
        // Phase F1: real departure coverage for ordinary two-point searches.
        timetableView: true,
        pageCursor,
        budget: args.budget,
      });

    const page1 = await requestPage();
    let normalized = normalizePage(page1, 0);
    let planCalls = 1;

    // Phase F3: adaptive cursor recovery. One extra timetable page, and only
    // when the first page cannot offer a sufficient passenger-usable pool.
    // Never pagination: no loop, no previous cursor, no recursion.
    if (needsCursorRecovery(normalized, args.minTransferMinutes) && page1.nextPageCursor) {
      try {
        const page2 = await requestPage(page1.nextPageCursor);
        planCalls = 2;
        normalized = [...normalized, ...normalizePage(page2, normalized.length)];
      } catch (error) {
        // Recovery is opportunistic enrichment: a failing second page must
        // never break a search that already produced results.
        console.warn("cursor recovery failed", error);
        planCalls = 2;
      }
    }

    console.info(`[plan] two-point search used ${planCalls} plan call(s)`);
    // Phase F4D: departure horizon, applied AFTER retrieval and F3 recovery so
    // the recovery decision keeps operating on the unfiltered pool, and BEFORE
    // the candidate cap so different-day noise cannot consume its slots.
    const withinHorizon = applyDepartureHorizon(
      normalized,
      args.departAt,
      args.minTransferMinutes,
    );
    return capCandidates(withinHorizon, args.minTransferMinutes);

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
      // Phase F3 does not apply to Via: chained searches keep exactly the same
      // request shape and call count as before.
      const { itineraries: options } = await planSegment({
        from: stops[s]!,
        to: stops[s + 1]!,
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

  // Via-stops carry station intent, so only the outer ends of a chain can hold
  // city access legs: trimming the assembled chain is the same operation.
  const journeys = chains
    .map((legs, index) =>
      normalizeItinerary({
        legs,
        from: args.from,
        to: args.to,
        departAt: args.departAt,
        chained: true,
        index,
      }),
    )
    .filter((j): j is Journey => j !== null);
  const unique = new Map<string, Journey>();
  for (const journey of journeys) {
    unique.set(`${journey.departure}-${journey.arrival}`, journey);
  }
  return Array.from(unique.values()).sort((a, b) => a.durationMinutes - b.durationMinutes);
}

