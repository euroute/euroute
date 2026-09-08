/**
 * Phase 3C: URL round-trip for endpoint intent (city vs explicit station) and
 * the Transitous stop id.
 *
 * The existing `Name|lat,lon` parameters stay untouched and remain the
 * coordinate fallback. Intent and stop id travel as additive, optional
 * parameters so every legacy /sok link keeps working exactly as before –
 * legacy links parse to a Place without `intent`, which routing treats the
 * old way (never as city intent).
 *
 * All values are untrusted URL input: intent is an enum, stop ids are length
 * checked, and anything unrecognised is dropped without throwing.
 */

import { MAX_STOP_ID_LENGTH, parsePlace, placeToString, type Place, type PlaceIntent } from "./journey";

/** Serialized endpoint metadata for one place. Empty string means "absent". */
export type EndpointParams = {
  /** `Name|lat,lon` – the existing parameter, unchanged. */
  value: string;
  intent: string;
  id: string;
};

/** Accepts only the known intents; anything else is legacy/undefined intent. */
export function parseIntentParam(value: unknown): PlaceIntent | undefined {
  const raw = typeof value === "string" ? value : value == null ? "" : String(value);
  return raw === "city" || raw === "station" ? raw : undefined;
}

/** Stop ids round-trip byte-for-byte; invalid or oversized values are ignored. */
export function parseStopIdParam(value: unknown): string | undefined {
  const raw = typeof value === "string" ? value : value == null ? "" : String(value);
  if (raw.length < 1 || raw.length > MAX_STOP_ID_LENGTH) return undefined;
  return raw;
}

/** Builds the URL parameters for one endpoint. */
export function encodeEndpoint(place: Place | null | undefined): EndpointParams {
  if (!place) return { value: "", intent: "", id: "" };
  const intent = place.intent ?? "";
  // A city routes by coordinate + radius, so its stop id is irrelevant and is
  // deliberately not persisted.
  const id = intent === "city" ? "" : (place.stopId ?? "");
  return {
    value: placeToString(place),
    intent,
    id: id.length >= 1 && id.length <= MAX_STOP_ID_LENGTH ? id : "",
  };
}

/** Rebuilds a Place from the URL, applying the Phase 3C precedence rules. */
export function placeFromParams(
  value: string | undefined,
  intentRaw?: unknown,
  idRaw?: unknown,
): Place | null {
  const place = parsePlace(value);
  if (!place) return null;

  const intent = parseIntentParam(intentRaw);
  if (!intent) return place; // legacy link: no intent, coordinate behaviour

  if (intent === "city") {
    // City intent wins over any stop id that happens to be in the URL.
    return { ...place, intent: "city" };
  }

  const stopId = parseStopIdParam(idRaw);
  // Station without a usable stop id keeps station intent and its coordinates.
  return stopId ? { ...place, intent: "station", stopId } : { ...place, intent: "station" };
}

export function encodeViaList(places: readonly Place[]): {
  via: string[];
  viaIntent: string[];
  viaId: string[];
} {
  const encoded = places.map((place) => encodeEndpoint(place));
  return {
    via: encoded.map((e) => e.value),
    viaIntent: encoded.map((e) => e.intent),
    viaId: encoded.map((e) => e.id),
  };
}

export function parseViaList(
  via: readonly string[],
  viaIntent: readonly string[] = [],
  viaId: readonly string[] = [],
): Place[] {
  return via
    .map((value, index) => placeFromParams(value, viaIntent[index], viaId[index]))
    .filter((place): place is Place => Boolean(place));
}

/** Normalises a repeatable string search param into an array of strings. */
export function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => (item == null ? "" : String(item)));
  if (value == null || value === "") return [];
  return [String(value)];
}
