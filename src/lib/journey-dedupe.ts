/**
 * Phase F2.5 — passenger-visible journey deduplication.
 *
 * Pure, deterministic and route-agnostic. After Phase F1 enabled
 * `timetableView`, Transitous can return several representations of the same
 * practical itinerary (different feeds for the same train, different access-leg
 * splitting, different station spellings/ids). Those render as cards the
 * traveller cannot tell apart.
 *
 * This module defines ONE canonical journey fingerprint. Two journeys collapse
 * only when every passenger-relevant fact matches: endpoints, overall
 * timestamps and the ordered transit-leg structure (stations, times and service
 * identity). Anything the traveller could act on differently — another
 * departure, another train, another transfer structure, another routing — keeps
 * its own fingerprint and survives.
 *
 * No route-, operator- or country-specific logic.
 */

import type { Journey, Leg } from "./journey";
import { normalizeStationName } from "./station-identity";

/** Legs the traveller boards; identical to the analysis transit filter. */
function transitLegs(journey: Journey): Leg[] {
  return journey.legs.filter((leg) => leg.kind !== "walk");
}

/**
 * Service identity of one transit leg.
 *
 * Train numbers are the most stable cross-feed identity we get: the same train
 * is "FR 6645" in one feed and "TGV INOUI 6645" in another, so the digits are
 * compared when present. Without digits we fall back to the normalised service
 * name, and without a name at all to mode + operator.
 */
export function legServiceIdentity(leg: Leg): string {
  const name = (leg.trainName ?? "").trim();
  const digits = name.match(/\d{2,}/g);
  if (digits && digits.length > 0) return `n:${digits.join("-")}`;
  const normalized = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (normalized) return `s:${normalized}`;
  return `m:${leg.mode.toLowerCase()}/${(leg.operator ?? "").toLowerCase()}`;
}

/**
 * Canonical fingerprint of a passenger journey.
 *
 * Fields used, and why each is safe:
 * - normalised origin/destination of the first/last transit leg: station
 *   identity as the traveller sees it, immune to spelling and feed-id noise.
 * - journey departure/arrival timestamps: a different clock time is always a
 *   different passenger choice.
 * - ordered transit legs, each with normalised from/to station, departure,
 *   arrival and service identity: preserves different trains, different
 *   transfer structure and different intermediate routing.
 *
 * Non-transit (walk/access) legs are deliberately excluded: they are the part
 * upstream feeds represent inconsistently and they are not a bookable choice.
 */
export function journeyFingerprint(journey: Journey): string {
  const transit = transitLegs(journey);
  const legs = transit
    .map(
      (leg) =>
        `${normalizeStationName(leg.fromName)}>${normalizeStationName(leg.toName)}` +
        `@${leg.departure}-${leg.arrival}#${legServiceIdentity(leg)}`,
    )
    .join("|");
  const first = transit[0];
  const last = transit[transit.length - 1];
  const origin = first ? normalizeStationName(first.fromName) : "";
  const destination = last ? normalizeStationName(last.toName) : "";
  return `${origin}=>${destination}::${journey.departure}/${journey.arrival}::${legs}`;
}

/**
 * How much bookable detail a representation carries. Higher is better; used to
 * pick the surviving representative deterministically.
 */
export function metadataRichness(journey: Journey): number {
  let value = 0;
  for (const leg of journey.legs) {
    if (leg.trainName) value += 3;
    if (leg.operator) value += 2;
    if (leg.operatorUrl) value += 1;
    if (leg.headsign) value += 1;
    if (leg.fromStopId) value += 1;
    if (leg.toStopId) value += 1;
  }
  return value;
}

/**
 * Deterministic representative rule for a group of identical fingerprints:
 * richest booking metadata → fewer legs (least access noise) → lowest
 * journey id. Never "whichever arrived first in the upstream array".
 */
export function preferRepresentative<T extends { journey: Journey }>(a: T, b: T): T {
  const richness = metadataRichness(b.journey) - metadataRichness(a.journey);
  if (richness !== 0) return richness > 0 ? b : a;
  const legs = a.journey.legs.length - b.journey.legs.length;
  if (legs !== 0) return legs > 0 ? b : a;
  return b.journey.id < a.journey.id ? b : a;
}

/**
 * Collapse passenger-identical representations. Input order of the surviving
 * representatives is preserved; duplicates are dropped entirely so they cannot
 * occupy profile slots or inflate "show more journeys".
 */
export function dedupePassengerJourneys<T extends { journey: Journey }>(
  items: T[],
): { kept: T[]; removed: T[] } {
  const byFingerprint = new Map<string, number>();
  const kept: T[] = [];
  const removed: T[] = [];

  for (const item of items) {
    const key = journeyFingerprint(item.journey);
    const index = byFingerprint.get(key);
    if (index === undefined) {
      byFingerprint.set(key, kept.length);
      kept.push(item);
      continue;
    }
    const existing = kept[index]!;
    const winner = preferRepresentative(existing, item);
    if (winner === existing) {
      removed.push(item);
    } else {
      kept[index] = item;
      removed.push(existing);
    }
  }

  return { kept, removed };
}
