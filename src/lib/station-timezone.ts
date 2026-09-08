/**
 * Station → IANA timezone resolution. Client-safe, pure and deterministic.
 *
 * WHY
 * ---
 * Transitous returns offset-aware absolute instants (e.g. 2026-06-01T06:04Z).
 * A traveller does not read absolute instants: a London departure must read as
 * London civil time, a Paris arrival as Paris civil time. A single journey can
 * therefore mix several timezones.
 *
 * ARCHITECTURE RULE
 * -----------------
 * This module is DISPLAY ONLY. All durations, ordering and scoring keep using
 * the absolute instants from the timetable source; nothing here rewrites a
 * timestamp. It only answers "in which zone should this clock be rendered?".
 *
 * The lookup is coordinate based (`"lat,lon"` as delivered by MOTIS/Transitous)
 * via the offline tz-lookup dataset, so it needs no network and never changes
 * between server and client render.
 */

import tzlookup from "tz-lookup";

import type { Journey, Leg } from "./journey";

/**
 * Fallback zone when a stop has no usable coordinates (older saved-trip
 * snapshots, hand-built test fixtures). Europe/Stockholm keeps the previous
 * behaviour for those rare cases instead of falling back to UTC.
 */
export const FALLBACK_TIME_ZONE = "Europe/Stockholm";

const cache = new Map<string, string>();

/** Parses `"59.330000,18.058000"` into coordinates. */
function parseLatLon(place: string): [number, number] | null {
  const [latRaw, lonRaw] = place.split(",", 2);
  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return [lat, lon];
}

/** IANA zone for a `"lat,lon"` place string, or the fallback zone. */
export function zoneForPlace(place: string | null | undefined): string {
  if (!place) return FALLBACK_TIME_ZONE;
  const cached = cache.get(place);
  if (cached) return cached;
  const coords = parseLatLon(place);
  if (!coords) return FALLBACK_TIME_ZONE;
  let zone: string;
  try {
    zone = tzlookup(coords[0], coords[1]);
  } catch {
    return FALLBACK_TIME_ZONE;
  }
  cache.set(place, zone);
  return zone;
}

/** Zone of the station the traveller boards at. */
export function legDepartureZone(leg: Pick<Leg, "fromPlace">): string {
  return zoneForPlace(leg.fromPlace);
}

/** Zone of the station the traveller alights at. */
export function legArrivalZone(leg: Pick<Leg, "toPlace">): string {
  return zoneForPlace(leg.toPlace);
}

function transitLegsOf(journey: Pick<Journey, "legs">): Leg[] {
  const transit = journey.legs.filter((leg) => leg.kind !== "walk");
  return transit.length > 0 ? transit : journey.legs;
}

/** Zone of the journey's first boarding station. */
export function journeyDepartureZone(journey: Pick<Journey, "legs">): string {
  const first = transitLegsOf(journey)[0];
  return first ? legDepartureZone(first) : FALLBACK_TIME_ZONE;
}

/** Zone of the journey's final arrival station. */
export function journeyArrivalZone(journey: Pick<Journey, "legs">): string {
  const legs = transitLegsOf(journey);
  const last = legs[legs.length - 1];
  return last ? legArrivalZone(last) : FALLBACK_TIME_ZONE;
}
