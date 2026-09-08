/**
 * Requested-overnight viability (Smart Overnight Model 2, Phase B).
 *
 * PRINCIPLE
 * ---------
 * A RECOMMENDED overnight must beat the continuous journey (comparative gates
 * in `overnightConfidence`). A REQUESTED overnight does not: the traveller has
 * decided they want to sleep in a city, and a slower journey is a legitimate
 * personal choice.
 *
 * But "requested" must not mean "accept any buildable plan". This module is
 * the single place where a requested split is checked for being a viable
 * two-day rail journey: two real travel days, a genuine night's rest, no
 * absurd day, and a usable onward departure.
 *
 * Pure and deterministic. No API calls, no new metrics: everything is derived
 * from the plan the existing requestedCandidate pipeline already produced.
 * Local times use the station's own zone (`zoneForPlace`), never a fixed one.
 */

import { transitLegs } from "./journey-intelligence";
import type { Journey } from "./journey";
import type { OvernightPlan } from "./overnight";
import { zoneForPlace, journeyArrivalZone, journeyDepartureZone } from "./station-timezone";

export type RequestedViabilityReason =
  | "arrivalTooLate"
  | "noUsableDeparture"
  | "restTooShort"
  | "restTooLong"
  | "insufficientDay1"
  | "extremeTravelDay"
  | "missingRailDay"
  | "materialDetour";

export type RequestedViabilityWarning =
  | "lateArrival"
  | "veryLongTravelDay"
  | "nightTravel"
  | "moderateDetour";

export type RequestedViability = {
  viable: boolean;
  reasons: RequestedViabilityReason[];
  warnings: RequestedViabilityWarning[];
};

/* ---------------- thresholds (all generic, no city knowledge) ------------- */

/** Day 1 arrival: preferred window at the stop, local civil time. */
export const ARRIVAL_PREFERRED_FROM_MINUTE = 12 * 60; // 12:00
export const ARRIVAL_PREFERRED_TO_MINUTE = 23 * 60; // 23:00
/** Arrivals after this local minute-of-day (next day) are rejected. */
export const ARRIVAL_HARD_LIMIT_MINUTE = 30; // 00:30

/** Day 2 must leave inside this local window at the stop. */
export const DEPARTURE_FROM_MINUTE = 5 * 60 + 30; // 05:30
export const DEPARTURE_TO_MINUTE = 12 * 60; // 12:00

/** Genuine overnight rest window at the stop. */
export const MIN_REST_MINUTES = 9 * 60;
export const MAX_REST_MINUTES = 20 * 60;

/** Day 1 must be a real travel day. */
export const MIN_DAY1_SHARE = 0.25;
export const MIN_DAY1_TRAIN_MINUTES = 180;

/**
 * Detour guard. The only signals available without new API calls are the
 * plan's own travel minutes versus the continuous journey. A moderate excess
 * is normal (a stop rarely sits exactly on the fastest path), so only a gross
 * excess is treated as material backtracking.
 */
export const DETOUR_WARN_RATIO = 1.5;
export const DETOUR_REJECT_RATIO = 2.5;

/* ------------------------------ helpers ---------------------------------- */

/** Local minute-of-day of an instant in a given zone. */
export function localMinuteOfDay(iso: string, zone: string): number {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  const [h, m] = parts.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes actually spent on board rail services in a journey. */
function railMinutes(journey: Journey): number {
  return transitLegs(journey)
    .filter((l) => l.kind === "train")
    .reduce((sum, l) => sum + l.durationMinutes, 0);
}

function hasRailLeg(journey: Journey): boolean {
  return transitLegs(journey).some((l) => l.kind === "train" && l.durationMinutes > 0);
}

/* ---------------------------- the evaluator ------------------------------ */

export function requestedViability(args: {
  plan: OvernightPlan;
  /** The continuous itinerary the traveller is splitting. */
  base: Journey;
}): RequestedViability {
  const { plan, base } = args;
  const reasons: RequestedViabilityReason[] = [];
  const warnings: RequestedViabilityWarning[] = [];

  const stay = plan.stays[0];
  const day1 = plan.days[0];
  const day2 = plan.days[1];

  // Degenerate shapes can never be a two-day split.
  if (!stay || !day1 || !day2) {
    return { viable: false, reasons: ["missingRailDay"], warnings };
  }

  const stayZone = zoneForPlace(stay.place) || journeyArrivalZone(day1);

  /* RULE 1 — day 1 arrival at the stop -------------------------------- */
  const arrivalMinute = localMinuteOfDay(stay.arrival, stayZone);
  const arrivalOk =
    arrivalMinute >= ARRIVAL_PREFERRED_FROM_MINUTE || arrivalMinute <= ARRIVAL_HARD_LIMIT_MINUTE;
  if (!arrivalOk) reasons.push("arrivalTooLate");
  else if (arrivalMinute >= ARRIVAL_PREFERRED_TO_MINUTE || arrivalMinute <= ARRIVAL_HARD_LIMIT_MINUTE)
    warnings.push("lateArrival");

  /* RULE 2 — usable next-day departure -------------------------------- */
  const departureZone = zoneForPlace(stay.place) || journeyDepartureZone(day2);
  const departureMinute = localMinuteOfDay(stay.departure, departureZone);
  if (departureMinute < DEPARTURE_FROM_MINUTE || departureMinute > DEPARTURE_TO_MINUTE)
    reasons.push("noUsableDeparture");

  /* RULE 3 — rest window ---------------------------------------------- */
  if (stay.waitMinutes < MIN_REST_MINUTES) reasons.push("restTooShort");
  else if (stay.waitMinutes > MAX_REST_MINUTES) reasons.push("restTooLong");

  /* RULE 4 — meaningful day 1 ----------------------------------------- */
  const baseRail = railMinutes(base);
  const day1Rail = railMinutes(day1);
  const meaningfulDay1 =
    day1Rail >= MIN_DAY1_TRAIN_MINUTES ||
    (baseRail > 0 && day1Rail / baseRail >= MIN_DAY1_SHARE);
  if (!meaningfulDay1) reasons.push("insufficientDay1");

  /* RULE 5 — extreme travel days (reuse existing day-burden logic) ----- */
  if (plan.dayStats.some((d) => d.burden === "extreme")) reasons.push("extremeTravelDay");
  else if (plan.dayStats.some((d) => d.burden === "veryLong")) warnings.push("veryLongTravelDay");

  /* RULE 6 — both days must be real rail days -------------------------- */
  if (!hasRailLeg(day1) || !hasRailLeg(day2)) reasons.push("missingRailDay");

  /* RULE 7 — residual night travel: honest warning, never a rejection -- */
  if (plan.hasNightTravel) warnings.push("nightTravel");

  /* RULE 8 — detour / backtracking ------------------------------------- */
  const travelRatio = base.durationMinutes > 0 ? plan.travelMinutes / base.durationMinutes : 1;
  if (travelRatio >= DETOUR_REJECT_RATIO) reasons.push("materialDetour");
  else if (travelRatio >= DETOUR_WARN_RATIO) warnings.push("moderateDetour");

  return { viable: reasons.length === 0, reasons, warnings };
}
