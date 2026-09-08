/**
 * Which Transitous identity Euroute may use as a /plan endpoint.
 *
 * Phase 1 preserved the exact upstream id of every rail station Euroute knows.
 * Phase 2 routed from that id, but pre-rejected ids whose native string looked
 * quay/platform-level (`IT::Quay:…`, DHID platforms such as
 * `de:02000:10950:11:1`). Live probes disproved the assumption behind that
 * rule: Transitous accepts many of those ids as /plan endpoints, and rejecting
 * them forced coordinate routing that snapped travellers to the wrong station
 * (Firenze S.M.N. → Firenze Campo Marte).
 *
 * Phase 3a therefore treats the upstream stop id as the routing authority:
 * whatever Transitous returned for a rail STOP is attempted as-is, exactly one
 * request, and the existing Phase-2 coordinate fallback handles the endpoint
 * related failures (400/404) that mean the id truly is unusable.
 *
 * `stopIdLevel()` is kept for diagnostics only — it no longer gates routing.
 * Ids are never synthesised, stripped, or rewritten; coordinates always stay on
 * the Place so every decision here is reversible.
 */

import type { Place } from "./journey";

export type StopIdLevel = "station" | "quay";


/** Part after the `feed_` prefix, i.e. the feed-native identity. */
function nativeId(stopId: string): string {
  const underscore = stopId.indexOf("_");
  return underscore === -1 ? stopId : stopId.slice(underscore + 1);
}

/**
 * Structural level of an upstream stop id. Diagnostic only since Phase 3a: it
 * describes what the identifier looks like, never whether Euroute may use it.
 */
export function stopIdLevel(stopId: string): StopIdLevel {
  const native = nativeId(stopId);

  // NeTEx/Transmodel style: explicit object type in the id.
  if (/(^|[:_.\-])quays?([:_.\-]|$)/i.test(native)) return "quay";
  if (/(^|[:_.\-])(platform|track|bstg|steig)/i.test(native)) return "quay";
  if (/(^|[:_.\-])(stopplace|stoparea|parent|station|stop)([:_.\-]|$)/i.test(native))
    return "station";

  // DHID (DELFI/German-speaking feeds): country:area:stop[:platform[:track]].
  // Three fields is the station, more fields address a platform or track.
  const dhid = native.match(/^[a-z]{2}:\d+(?::[^:]*){1,}$/i);
  if (dhid) {
    const fields = native.split(":");
    if (fields.length > 3) return "quay";
    return "station";
  }

  return "station";
}

/**
 * The id Euroute uses as an exact /plan endpoint: the preserved upstream string
 * whenever the Place carries one. Transitous decides routability; an
 * endpoint-related 400/404 triggers the single coordinate retry in
 * `planSegment`.
 */
export function routingStopId(place: Place): string | undefined {
  return place.stopId || undefined;
}


/** Endpoint string for a Place: exact station id when trustworthy, else coords. */
export function planEndpoint(place: Place): string {
  return isCityEndpoint(place) ? place.place : (routingStopId(place) ?? place.place);
}

/**
 * Phase 3B – city intent. When the traveller picked a city we deliberately do
 * NOT pin the route to one generic primary station: the city coordinate is sent
 * together with a bounded `radius`, so MOTIS may pick the terminal that
 * actually fits the route (St Pancras for Paris, Euston for Manchester).
 */
export const CITY_ENDPOINT_RADIUS_M = 3000;

/** True when this endpoint should be routed as a city, not as an exact stop. */
export function isCityEndpoint(place: Place): boolean {
  return place.intent === "city";
}

/** The radius a segment needs: set only when at least one endpoint is a city. */
export function segmentRadius(from: Place, to: Place): number | undefined {
  return isCityEndpoint(from) || isCityEndpoint(to) ? CITY_ENDPOINT_RADIUS_M : undefined;
}
