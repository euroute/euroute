// Phase 2 of the rail-station-only search model: pure, deterministic
// city -> primary railway station resolution.
//
// Input is a legitimate city PLACE hit (classified in phase 1) plus the set of
// stops that Transitous reports inside a bounding box around that city. Output
// is one primary railway station plus useful sibling stations, all expressed
// with the unchanged Place contract (name + "lat,lon").
//
// No city-specific rules, names, radii or blacklists exist in this file. All
// signals are generic: rail modes, upstream importance, distance from the city
// centre, and name relevance to the city.

import {
  classifyHit,
  distanceMeters,
  isSamePhysicalStation,
  normalizeStationName,
  type GeocodeHitLike,
} from "./station-classify";

/**
 * Hard geographic guard. A station further than this from the city centre is
 * never considered part of the city, no matter how strong its rail modes are.
 * 15 km covers edge terminals of large metropolitan areas while excluding
 * neighbouring towns, and keeps the upstream bounding-box query within the
 * limit Transitous imposes on dense metros.
 */
export const CITY_RADIUS_M = 15_000;

/** Fallback radii used when a metro area is too dense for the larger box. */
export const CITY_RADIUS_LADDER_M = [15_000, 8_000, 4_000] as const;

/**
 * Soft distance decay scale. Score is multiplied by 1 / (1 + (km / 6)^1.5), so
 * a station 6 km out keeps ~50 % of its score and a genuinely dominant hub can
 * still win from the edge of the city, while a suburban regional halt cannot.
 */
const DECAY_SCALE_KM = 6;

const MODE_WEIGHT: Record<string, number> = {
  HIGHSPEED_RAIL: 100,
  LONG_DISTANCE: 80,
  NIGHT_RAIL: 60,
  REGIONAL_FAST_RAIL: 45,
  REGIONAL_RAIL: 30,
  RAIL: 30,
};

/** Modes that make a station useful as an intercity/international endpoint. */
const INTERCITY_MODES = new Set([
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
]);

/** Sibling stations must stay within this fraction of the primary's score. */
const SIBLING_SCORE_RATIO = 0.12;
const MAX_SIBLINGS = 5;

export type CityStationCandidate = {
  hit: GeocodeHitLike;
  distanceMeters: number;
  score: number;
  intercity: boolean;
};

export type CityResolution = {
  primary: CityStationCandidate | null;
  siblings: CityStationCandidate[];
};

/** Bounding box (min/max "lat,lon") around a city centre for /map/stops. */
export function boundingBox(
  lat: number,
  lon: number,
  radiusMeters = CITY_RADIUS_M,
): { min: string; max: string } {
  const dLat = radiusMeters / 111_320;
  const cos = Math.max(Math.cos((lat * Math.PI) / 180), 0.15);
  const dLon = radiusMeters / (111_320 * cos);
  const fmt = (v: number) => v.toFixed(6);
  return {
    min: `${fmt(lat - dLat)},${fmt(lon - dLon)}`,
    max: `${fmt(lat + dLat)},${fmt(lon + dLon)}`,
  };
}

/**
 * Merge key for feed duplicates of one physical station: parenthesised operator
 * or country qualifiers and platform/hall suffixes are irrelevant to identity.
 */
export function stationMergeKey(name: string): string {
  return normalizeStationName(
    name.replace(/\([^)]*\)/g, " ").replace(/\b(hall|track|platform|gleis|perrong?)\b.*$/i, " "),
  );
}

/**
 * Two entries closer than this are treated as one station complex. Kept tight
 * on purpose: genuinely distinct neighbours (London Kings Cross vs St Pancras)
 * are only a few hundred metres apart and must stay separately selectable.
 */
const COMPLEX_RADIUS_M = 120;

function nameRelevance(city: GeocodeHitLike, station: GeocodeHitLike): number {
  const cityName = normalizeStationName(city.name);
  const stationName = normalizeStationName(station.name);
  if (!cityName || !stationName) return 0;
  const tokens = cityName.split(" ").filter((t) => t.length > 2);
  if (!tokens.length) return 0;
  const hits = tokens.filter((t) => stationName.includes(t)).length;
  return (hits / tokens.length) * 30;
}

function scoreOf(city: GeocodeHitLike, station: GeocodeHitLike, meters: number): number {
  const modes = (station.modes ?? []).filter((m) => MODE_WEIGHT[m] !== undefined);
  const best = modes.reduce((max, m) => Math.max(max, MODE_WEIGHT[m]!), 0);
  const breadth = modes.reduce((sum, m) => sum + MODE_WEIGHT[m]!, 0);
  const importance = Number.isFinite(station.importance) ? (station.importance as number) : 0;
  const base = best + breadth * 0.2 + importance * 400 + nameRelevance(city, station);
  const km = meters / 1000;
  const decay = 1 / (1 + Math.pow(km / DECAY_SCALE_KM, 1.5));
  return base * decay;
}

/** True when two hits describe the same physical station complex. */
export function sameStationComplex(a: GeocodeHitLike, b: GeocodeHitLike): boolean {
  return (
    isSamePhysicalStation(a, b) ||
    distanceMeters(a, b) <= COMPLEX_RADIUS_M ||
    (stationMergeKey(a.name) === stationMergeKey(b.name) && distanceMeters(a, b) <= 2_000)
  );
}

function mergePass(candidates: CityStationCandidate[]): CityStationCandidate[] {
  const merged: CityStationCandidate[] = [];
  for (const candidate of candidates) {
    const existing = merged.find((m) => sameStationComplex(m.hit, candidate.hit));
    if (!existing) {
      merged.push(candidate);
      continue;
    }
    if (candidate.score > existing.score) merged[merged.indexOf(existing)] = candidate;
  }
  return merged;
}

export function resolveCityStations(
  city: GeocodeHitLike,
  stops: GeocodeHitLike[],
  options: { radiusMeters?: number; maxSiblings?: number } = {},
): CityResolution {
  const radius = options.radiusMeters ?? CITY_RADIUS_M;
  const maxSiblings = options.maxSiblings ?? MAX_SIBLINGS;

  const candidates: CityStationCandidate[] = [];
  for (const raw of stops) {
    const hit: GeocodeHitLike = {
      ...raw,
      type: raw.type || "STOP",
      ...(raw.country ?? city.country ? { country: raw.country ?? city.country! } : {}),
    };
    if (classifyHit(hit).kind !== "rail_station") continue;
    const meters = distanceMeters(city, hit);
    if (meters > radius) continue;
    candidates.push({
      hit,
      distanceMeters: meters,
      score: scoreOf(city, hit, meters),
      intercity: (hit.modes ?? []).some((m) => INTERCITY_MODES.has(m)),
    });
  }

  // Duplicate merging: one logical station per physical station complex. Two
  // passes collapse feed duplicates that are only linked through an
  // intermediate platform entry, without chaining across distinct stations.
  const merged = mergePass(mergePass(candidates));

  merged.sort((a, b) =>
    b.score === a.score ? a.distanceMeters - b.distanceMeters : b.score - a.score,
  );

  const primary = merged[0] ?? null;
  if (!primary) return { primary: null, siblings: [] };

  const siblings = merged
    .slice(1)
    .filter((c) => c.intercity && c.score >= primary.score * SIBLING_SCORE_RATIO)
    .slice(0, maxSiblings);

  return { primary, siblings };
}
