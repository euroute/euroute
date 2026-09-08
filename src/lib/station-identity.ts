/**
 * Shared station identity foundation (Phase 1).
 *
 * One canonical, deterministic, dependency-free place for station-name
 * normalisation plus low-level comparison primitives that later phases can use
 * to decide whether two timetable stops describe the same physical complex.
 *
 * Pure, client-safe and server-safe: no API calls, no city-specific hardcoding.
 *
 * Phase 1 intentionally does NOT classify transfers. The primitives below are
 * building blocks only and are not wired into transfer, scoring or ranking
 * behaviour.
 */

/** Generic description of one station endpoint; only `name` is required. */
export type StationIdentityInput = {
  name: string;
  lat?: number | undefined;
  lon?: number | undefined;
  /** Upstream stop id, verbatim (never normalised or synthesised). */
  stopId?: string | undefined;
  /** Upstream parent/complex id, verbatim. Undefined when absent upstream. */
  parentId?: string | undefined;
  /** Upstream level value, verbatim. */
  level?: number | undefined;
};

/** Generic station-suffix noise words dropped by the canonical normaliser. */
const GENERIC_TOKENS = /\b(hbf|hauptbahnhof|centralstation|central|c|st|station)\b/g;
/** Extra generic tokens the connection path has always dropped as well. */
const EXTENDED_TOKENS = /\b(banegard|st\.)\b/g;

/**
 * Canonical station-name normalisation.
 *
 * Deterministic pipeline: lower-case → first comma segment → strip diacritics →
 * optional Germanic/Nordic transliteration → drop generic station words → keep
 * only [a-z0-9].
 *
 * `transliterate` reproduces the two normalisation variants that existed in the
 * codebase before Phase 1, so centralising the logic changes no behaviour:
 * - true (default): connection/journey-intelligence variant.
 * - false: the overnight candidate-key variant.
 */
export function normalizeStationName(name: string, transliterate = true): string {
  let value = (name ?? "")
    .toLowerCase()
    .split(",")[0]!
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (transliterate) {
    value = value
      .replace(/ue/g, "u")
      .replace(/oe/g, "o")
      .replace(/ae/g, "a")
      .replace(/ss/g, "s")
      .replace(/[æø]/g, "o")
      .replace(EXTENDED_TOKENS, "");
  }

  value = value.replace(GENERIC_TOKENS, "").replace(/[^a-z0-9]+/g, "");
  return transliterate ? value.trim() : value;
}

/** Canonical key used by Smart Overnight candidate merging (legacy variant). */
export function overnightStationKey(name: string): string {
  return normalizeStationName(name, false);
}

/* ------------------------------------------------------------------ *
 * Pure comparison primitives (not wired into behaviour in Phase 1)
 * ------------------------------------------------------------------ */

/** Canonical normalised name of an identity input. */
export function normalizedName(a: StationIdentityInput): string {
  return normalizeStationName(a.name);
}

/** True only when both sides carry the exact same upstream stop id. */
export function exactSameStopId(a: StationIdentityInput, b: StationIdentityInput): boolean {
  return Boolean(a.stopId && b.stopId && a.stopId === b.stopId);
}

/** True only when both sides carry the exact same upstream parent id. */
export function sameParentId(a: StationIdentityInput, b: StationIdentityInput): boolean {
  return Boolean(a.parentId && b.parentId && a.parentId === b.parentId);
}

function validCoord(a: StationIdentityInput): boolean {
  return (
    typeof a.lat === "number" &&
    typeof a.lon === "number" &&
    Number.isFinite(a.lat) &&
    Number.isFinite(a.lon) &&
    Math.abs(a.lat) <= 90 &&
    Math.abs(a.lon) <= 180
  );
}

/**
 * Great-circle distance in whole metres, or undefined when either coordinate is
 * missing or invalid. Haversine on a mean-earth-radius sphere; no API calls.
 */
export function coordinateDistanceMeters(
  a: StationIdentityInput,
  b: StationIdentityInput,
): number | undefined {
  if (!validCoord(a) || !validCoord(b)) return undefined;
  const R = 6371008.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat! - a.lat!);
  const dLon = toRad(b.lon! - a.lon!);
  const lat1 = toRad(a.lat!);
  const lat2 = toRad(b.lat!);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.min(1, Math.sqrt(h))));
}

/** Parses a stored "lat,lon" Place string into coordinates, when well-formed. */
export function parseCoords(place: string | null | undefined): { lat: number; lon: number } | null {
  if (!place) return null;
  const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(place.trim());
  if (!m) return null;
  const lat = Number(m[1]);
  const lon = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}
