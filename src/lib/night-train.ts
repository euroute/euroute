/**
 * Night-train classification. Client-safe, pure and deterministic.
 *
 * PRODUCT RULE
 * ------------
 * A journey contains a night train only when at least one genuine RAIL leg
 * carries the traveller through normal sleeping hours. Crossing midnight, a
 * long daytime train, an overnight wait at a station, an overnight bus/ferry or
 * a Smart Overnight hotel split must never produce the badge.
 *
 * TIMEZONES
 * ---------
 * Local civil time comes from the existing station timezone system
 * (`station-timezone.ts` + `civilTime`). Absolute instants are never rewritten:
 * the leg's real elapsed interval is projected onto the local clock of the
 * boarding station and of the alighting station, and the more conservative
 * (smaller) overnight overlap of the two is used.
 */

import { civilTime, type Journey, type Leg } from "./journey";
import { legArrivalZone, legDepartureZone } from "./station-timezone";

/** Local overnight window, in minutes from local midnight (00:00–05:00). */
const NIGHT_START_MIN = 0;
const NIGHT_END_MIN = 5 * 60;

/** A leg shorter than this can never be meaningful overnight travel. */
export const MIN_NIGHT_LEG_MINUTES = 240;

/** Required overlap with the local overnight window. */
export const MIN_NIGHT_OVERLAP_MINUTES = 180;

/**
 * Modes that are rail vehicles on paper but never operate night trains.
 * Urban transit legs must not create a night-train classification.
 */
const NON_NIGHT_RAIL_MODES = new Set(["METRO", "SUBWAY", "TRAM"]);

/** True when the leg is a long-distance-capable rail service. */
export function isRailLeg(leg: Pick<Leg, "kind" | "mode">): boolean {
  if (leg.kind !== "train") return false;
  return !NON_NIGHT_RAIL_MODES.has(leg.mode.toUpperCase());
}

function minutesOfDay(iso: string, zone: string): number {
  const [h, m] = civilTime(iso, zone).split(":");
  return Number(h) * 60 + Number(m);
}

/** Elapsed minutes of the leg, from its actual instants. */
function elapsedMinutes(leg: Pick<Leg, "departure" | "arrival">): number {
  return Math.round(
    (new Date(leg.arrival).getTime() - new Date(leg.departure).getTime()) / 60000,
  );
}

/**
 * Minutes the interval `[startMin, startMin + duration]` (local clock, minutes
 * from midnight of the departure day) spends inside the 00:00–05:00 window of
 * any local day it touches.
 */
function nightOverlapMinutes(startMin: number, duration: number): number {
  const end = startMin + duration;
  let overlap = 0;
  for (let day = -1; day * 1440 <= end + 1440; day += 1) {
    const windowStart = day * 1440 + NIGHT_START_MIN;
    const windowEnd = day * 1440 + NIGHT_END_MIN;
    overlap += Math.max(0, Math.min(end, windowEnd) - Math.max(startMin, windowStart));
  }
  return overlap;
}

/** True when this single leg genuinely operates overnight. */
export function isNightTrainLeg(
  leg: Pick<Leg, "kind" | "mode" | "departure" | "arrival" | "fromPlace" | "toPlace">,
): boolean {
  if (!isRailLeg(leg)) return false;
  const duration = elapsedMinutes(leg);
  if (duration < MIN_NIGHT_LEG_MINUTES) return false;

  // Project the real interval onto both stations' local clocks and stay
  // conservative by requiring the overlap in both.
  const fromDep = minutesOfDay(leg.departure, legDepartureZone(leg));
  const toArr = minutesOfDay(leg.arrival, legArrivalZone(leg));
  const overlap = Math.min(
    nightOverlapMinutes(fromDep, duration),
    nightOverlapMinutes(toArr - duration, duration),
  );
  return overlap >= MIN_NIGHT_OVERLAP_MINUTES;
}

/** The qualifying overnight rail legs of a journey, in order. */
export function nightTrainLegs(journey: Pick<Journey, "legs">): Leg[] {
  return journey.legs.filter((leg) => isNightTrainLeg(leg));
}

/** True when the itinerary contains at least one genuine night train. */
export function journeyHasNightTrain(journey: Pick<Journey, "legs">): boolean {
  return journey.legs.some((leg) => isNightTrainLeg(leg));
}
