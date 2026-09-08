// Pure, deterministic classification of Transitous (MOTIS 2) geocode hits.
//
// Phase 1 of the rail-station-only search model: we only *classify, filter and
// rank* geocode hits. No city -> station resolution, no stop-id routing, no
// changes to the Place contract.

/** Genuine long/medium distance rail modes. A stop needs at least one. */
export const RAIL_MODES = [
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
  "RAIL",
] as const;

/** Modes that never on their own make a stop a rail endpoint. */
export const LOCAL_MODES = [
  "SUBWAY",
  "METRO",
  "TRAM",
  "BUS",
  "COACH",
  "FERRY",
  "CABLE_CAR",
  "FUNICULAR",
  "GONDOLA",
  "AERIAL_LIFT",
  "SUBURBAN",
  "OTHER",
] as const;

const RAIL_SET = new Set<string>(RAIL_MODES);

/** Ranking weight per rail mode: higher = more useful as a Euroute endpoint. */
const RAIL_MODE_WEIGHT: Record<string, number> = {
  HIGHSPEED_RAIL: 100,
  LONG_DISTANCE: 80,
  NIGHT_RAIL: 60,
  REGIONAL_FAST_RAIL: 45,
  REGIONAL_RAIL: 40,
  RAIL: 40,
};

export type GeocodeArea = {
  name: string;
  adminLevel: number;
  matched?: boolean;
  unique?: boolean;
  default?: boolean;
};

/** Subset of the Transitous geocode response Euroute relies on. */
export type GeocodeHitLike = {
  type: string;
  name: string;
  lat: number;
  lon: number;
  /** Stop identifier as returned by /api/v1/geocode. */
  id?: string;
  /** Same identifier under the name /api/v1/map/stops uses. */
  stopId?: string;
  category?: string;
  country?: string;
  modes?: string[];
  areas?: GeocodeArea[];
  importance?: number;
  score?: number;
};

/**
 * Upstream stop identifier of a hit, whichever field the endpoint used. The
 * exact upstream string is preserved: never normalised, never synthesised.
 */
export function stopIdOf(hit: GeocodeHitLike): string | undefined {
  const raw = hit.id ?? hit.stopId;
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

export type HitKind = "rail_station" | "city" | "local_transit" | "irrelevant";

export type ClassifiedHit = {
  hit: GeocodeHitLike;
  kind: HitKind;
  /** Rail modes present on the hit, if any. */
  railModes: string[];
  /** Deterministic ranking value; higher sorts first. */
  rank: number;
};

/** Transitous `category` values that indicate a settlement-like PLACE. */
const CITY_CATEGORY = /^place_(\d+)$/;

export function railModesOf(hit: GeocodeHitLike): string[] {
  return (hit.modes ?? []).filter((m) => RAIL_SET.has(m));
}

export function isRailStation(hit: GeocodeHitLike): boolean {
  return hit.type === "STOP" && railModesOf(hit).length > 0;
}

function isCityPlace(hit: GeocodeHitLike): boolean {
  if (hit.type !== "PLACE") return false;
  const category = hit.category ?? "";
  if (CITY_CATEGORY.test(category)) return true;
  // Some feeds omit category on administrative places; accept those that carry
  // an administrative area chain, which POIs generally do not resolve to.
  return category === "" && (hit.areas?.length ?? 0) > 0;
}

export function classifyHit(hit: GeocodeHitLike): ClassifiedHit {
  const railModes = railModesOf(hit);

  let kind: HitKind;
  if (hit.type === "STOP") {
    kind = railModes.length > 0 ? "rail_station" : "local_transit";
  } else if (hit.type === "PLACE") {
    kind = isCityPlace(hit) ? "city" : "irrelevant";
  } else {
    // ADDRESS and anything unknown is not selectable in Euroute.
    kind = "irrelevant";
  }

  return { hit, kind, railModes, rank: rankOf(kind, hit, railModes) };
}

function rankOf(kind: HitKind, hit: GeocodeHitLike, railModes: string[]): number {
  // Transitous returns hits already ordered by text relevance, and its `score`
  // field is a match cost rather than a quality signal, so relevance is handled
  // by preserving upstream order on ties. `importance` is a genuine hub signal.
  const importance = Number.isFinite(hit.importance) ? (hit.importance as number) : 0;

  if (kind === "rail_station") {
    const best = railModes.reduce((max, m) => Math.max(max, RAIL_MODE_WEIGHT[m] ?? 0), 0);
    const breadth = railModes.reduce((sum, m) => sum + (RAIL_MODE_WEIGHT[m] ?? 0), 0);
    return 100_000 + best * 100 + importance * 1_000 + breadth;
  }
  if (kind === "city") return 50_000;
  return 0;
}

/** Normalised station name used for conservative duplicate detection. */
export function normalizeStationName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,()]/g, " ")
    .replace(/\b(hbf|hauptbahnhof)\b/g, "hbf")
    .replace(/\b(centralstation|central station|centralen|c)\b/g, "central")
    .replace(/\b(bahnhof|station|stazione|gare|estacion|estacao)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Great-circle distance in metres. */
export function distanceMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Two hits are the same physical station only if name AND position agree. */
const DUPLICATE_RADIUS_M = 600;

export function isSamePhysicalStation(a: GeocodeHitLike, b: GeocodeHitLike): boolean {
  if ((a.country ?? "") !== (b.country ?? "")) return false;
  const nameA = normalizeStationName(a.name);
  const nameB = normalizeStationName(b.name);
  if (!nameA || nameA !== nameB) return false;
  return distanceMeters(a, b) <= DUPLICATE_RADIUS_M;
}

export type SelectOptions = { limit?: number };

/**
 * Filter, deduplicate and rank geocode hits into the selectable candidate set.
 * Deterministic: equal ranks keep the upstream order.
 */
export function selectCandidates(
  hits: GeocodeHitLike[],
  options: SelectOptions = {},
): ClassifiedHit[] {
  const limit = options.limit ?? 10;

  const kept = hits
    .map((hit, index) => ({ ...classifyHit(hit), index }))
    .filter((c) => c.kind === "rail_station" || c.kind === "city");

  // Conservative duplicate merge: same physical station keeps the best rank.
  const merged: (ClassifiedHit & { index: number })[] = [];
  for (const candidate of kept) {
    const existing = merged.find((m) => {
      if (m.kind !== candidate.kind) return false;
      if (candidate.kind === "rail_station") return isSamePhysicalStation(m.hit, candidate.hit);
      // City PLACE duplicates: same name keeps only the most relevant entry,
      // which generically suppresses same-name cities on other continents.
      return normalizeStationName(m.hit.name) === normalizeStationName(candidate.hit.name);
    });
    if (!existing) {
      merged.push(candidate);
      continue;
    }
    if (candidate.rank > existing.rank) {
      merged[merged.indexOf(existing)] = { ...candidate, index: existing.index };
    }
  }

  merged.sort((a, b) => (b.rank === a.rank ? a.index - b.index : b.rank - a.rank));

  // Cities must not push genuine rail stations out of the cap.
  const stations = merged.filter((m) => m.kind === "rail_station");
  const cities = merged.filter((m) => m.kind === "city");
  const cityBudget = Math.max(0, Math.min(cities.length, limit - Math.min(stations.length, limit - 1)));
  const allowedCities = new Set(cities.slice(0, cityBudget));

  return merged
    .filter((m) => m.kind === "rail_station" || allowedCities.has(m))
    .slice(0, limit)
    .map(({ hit, kind, railModes, rank }) => ({ hit, kind, railModes, rank }));
}
