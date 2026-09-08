/**
 * OPTIONAL overnight candidates (Smart Overnight Model 2, Phase C).
 *
 * PRINCIPLE
 * ---------
 * Three separate product concepts, never mixed:
 *
 * - RECOMMENDED: "splitting here materially improves this journey."
 *   Governed by `overnightConfidence` (unchanged by this module).
 * - OPTIONAL (this module): "this is a sensible place to split the journey if
 *   you would rather travel over two days." It does NOT have to beat the
 *   continuous journey and may take substantially longer. It must, however,
 *   produce two genuinely usable travel days and a real overnight rest.
 * - REQUESTED: "you asked to stop here." Governed by `requestedViability`,
 *   untouched here.
 *
 * COST
 * ----
 * Optional candidates are selected from the multi-day plans the proactive
 * pipeline has ALREADY built and scored. This module performs no network calls
 * and requests none: it is pure, deterministic and free.
 */

import type { Journey, Place } from "./journey";
import { transitLegs } from "./journey-intelligence";
import { overnightStationKey } from "./station-identity";
import {
  arrivalHourScore,
  balanceScore,
  cityName,
  departureHourScore,
  localHour,
  nightCoverageMinutes,
  type OvernightPlan,
  type RestWindowQuality,
} from "./overnight";
import {
  ARRIVAL_HARD_LIMIT_MINUTE,
  ARRIVAL_PREFERRED_FROM_MINUTE,
  ARRIVAL_PREFERRED_TO_MINUTE,
  DEPARTURE_FROM_MINUTE,
  DEPARTURE_TO_MINUTE,
  DETOUR_REJECT_RATIO,
  DETOUR_WARN_RATIO,
  MAX_REST_MINUTES,
  MIN_DAY1_SHARE,
  MIN_DAY1_TRAIN_MINUTES,
  MIN_REST_MINUTES,
  localMinuteOfDay,
} from "./overnight-viability";
import { journeyArrivalZone, journeyDepartureZone, zoneForPlace } from "./station-timezone";

export type OptionalRejectionReason =
  | "missingRailDay"
  | "insufficientDay1"
  | "insufficientDay2"
  | "arrivalTooLate"
  | "noUsableDeparture"
  | "restTooShort"
  | "restTooLong"
  | "restNotAtNight"
  | "extremeTravelDay"
  | "materialDetour";

export type OptionalWarning =
  | "lateArrival"
  | "veryLongTravelDay"
  | "nightTravel"
  | "moderateDetour"
  | "addedElapsed";

export type OptionalViability = {
  viable: boolean;
  reasons: OptionalRejectionReason[];
  warnings: OptionalWarning[];
};

/* ---------------- optional-specific thresholds ---------------------------- */

/**
 * Day 2 must also carry a meaningful share of the journey, so the stop really
 * divides it (10 h + 45 min is not a split). Symmetrical with the Day 1 rule,
 * with a lower floor because an onward search is rarely a perfect half.
 */
export const MIN_DAY2_TRAIN_MINUTES = 120;
export const MIN_DAY2_SHARE = 0.2;

/** A rest window must actually cover the night, not just be long. */
export const MIN_REST_NIGHT_MINUTES = 240;

/** Absolute usefulness floor, and how far below the best a candidate may sit. */
export const MIN_USEFULNESS = 30;
export const USEFULNESS_SPREAD = 20;

/** Never more than three optional suggestions. */
export const MAX_OPTIONAL_CANDIDATES = 3;

const REST_USEFULNESS: Record<RestWindowQuality, number> = {
  veryGood: 20,
  good: 15,
  short: 7,
  poor: 0,
};

/* ------------------------------ helpers ---------------------------------- */

function railMinutes(journey: Journey): number {
  return transitLegs(journey)
    .filter((l) => l.kind === "train")
    .reduce((sum, l) => sum + l.durationMinutes, 0);
}

function hasRailLeg(journey: Journey): boolean {
  return transitLegs(journey).some((l) => l.kind === "train" && l.durationMinutes > 0);
}

/* ---------------------------- the evaluator ------------------------------ */

export function optionalViability(args: {
  plan: OvernightPlan;
  /** The continuous itinerary the traveller would otherwise take. */
  base: Journey;
}): OptionalViability {
  const { plan, base } = args;
  const reasons: OptionalRejectionReason[] = [];
  const warnings: OptionalWarning[] = [];

  const stay = plan.stays[0];
  const day1 = plan.days[0];
  const day2 = plan.days[plan.days.length - 1];

  if (!stay || !day1 || !day2 || plan.days.length < 2) {
    return { viable: false, reasons: ["missingRailDay"], warnings };
  }

  /* A — both days must be real rail days (metro/bus/walk never count). */
  if (!hasRailLeg(day1) || !hasRailLeg(day2)) reasons.push("missingRailDay");

  const baseRail = railMinutes(base);

  /* B — meaningful day 1: >=180 min onboard rail OR >=25% of base rail. */
  const day1Rail = railMinutes(day1);
  if (
    !(day1Rail >= MIN_DAY1_TRAIN_MINUTES || (baseRail > 0 && day1Rail / baseRail >= MIN_DAY1_SHARE))
  )
    reasons.push("insufficientDay1");

  /* C — meaningful day 2: >=120 min onboard rail OR >=20% of base rail. */
  const day2Rail = railMinutes(day2);
  if (
    !(day2Rail >= MIN_DAY2_TRAIN_MINUTES || (baseRail > 0 && day2Rail / baseRail >= MIN_DAY2_SHARE))
  )
    reasons.push("insufficientDay2");

  /* D — sensible arrival at the stop, local time there. */
  const stayZone = zoneForPlace(stay.place) || journeyArrivalZone(day1);
  const arrivalMinute = localMinuteOfDay(stay.arrival, stayZone);
  const arrivalOk =
    arrivalMinute >= ARRIVAL_PREFERRED_FROM_MINUTE || arrivalMinute <= ARRIVAL_HARD_LIMIT_MINUTE;
  if (!arrivalOk) reasons.push("arrivalTooLate");
  else if (
    arrivalMinute >= ARRIVAL_PREFERRED_TO_MINUTE ||
    arrivalMinute <= ARRIVAL_HARD_LIMIT_MINUTE
  )
    warnings.push("lateArrival");

  /* E — sensible next-day departure (shared 05:30–12:00 window). */
  const departureZone = zoneForPlace(stay.place) || journeyDepartureZone(day2);
  const departureMinute = localMinuteOfDay(stay.departure, departureZone);
  if (departureMinute < DEPARTURE_FROM_MINUTE || departureMinute > DEPARTURE_TO_MINUTE)
    reasons.push("noUsableDeparture");

  /* F — real rest: 9–20 h, and it must genuinely cover the night. */
  if (stay.waitMinutes < MIN_REST_MINUTES) reasons.push("restTooShort");
  else if (stay.waitMinutes > MAX_REST_MINUTES) reasons.push("restTooLong");
  else if (nightCoverageMinutes(stay.arrival, stay.departure) < MIN_REST_NIGHT_MINUTES)
    reasons.push("restNotAtNight");

  /* G — day burden: reuse dayStats. Extreme rejects, veryLong warns. */
  if (plan.dayStats.some((d) => d.burden === "extreme")) reasons.push("extremeTravelDay");
  else if (plan.dayStats.some((d) => d.burden === "veryLong")) warnings.push("veryLongTravelDay");

  /* H — residual night travel is a warning, never a rejection. */
  if (plan.hasNightTravel) warnings.push("nightTravel");

  /* I — detour: only the travel-time inflation signal we can safely derive. */
  const travelRatio = base.durationMinutes > 0 ? plan.travelMinutes / base.durationMinutes : 1;
  if (travelRatio >= DETOUR_REJECT_RATIO) reasons.push("materialDetour");
  else if (travelRatio >= DETOUR_WARN_RATIO) warnings.push("moderateDetour");

  /* Honest cost note: optional candidates are allowed to be slower. */
  if (plan.addedElapsedMinutes >= 120) warnings.push("addedElapsed");

  return { viable: reasons.length === 0, reasons, warnings };
}

/* --------------------------- usefulness ranking --------------------------- */

/**
 * Internal usefulness score for optional candidates only. It never touches the
 * Euroute Score or the overnight `score`, and is not shown to the traveller.
 *
 *   balanced travel days            0..20   balanceScore(day windows)
 * + arrival hour at the stop        0..20   arrivalHourScore
 * + next-morning departure hour     0..15   departureHourScore
 * + rest window quality            0..20   veryGood 20 / good 15 / short 7
 * - risky connections              8 each
 * - tight connections              4 each
 * - station changes                4 each
 * - day burden penalty             veryLong 10 / long 4 (worst day)
 * - added elapsed time             2 per whole hour, capped at 20
 */
export function optionalUsefulness(plan: OvernightPlan): number {
  const stay = plan.stays[0];
  if (!stay) return 0;
  const windows = plan.dayStats.map((d) => d.windowMinutes);
  const worst = plan.dayStats.reduce(
    (acc, d) => Math.max(acc, d.burden === "veryLong" ? 10 : d.burden === "long" ? 4 : 0),
    0,
  );
  const raw =
    balanceScore(windows) +
    arrivalHourScore(localHour(stay.arrival)) +
    departureHourScore(localHour(stay.departure)) +
    REST_USEFULNESS[plan.restQuality] -
    plan.riskyConnections * 8 -
    plan.tightConnections * 4 -
    plan.stationChanges * 4 -
    worst -
    Math.min(20, Math.floor(Math.max(0, plan.addedElapsedMinutes) / 60) * 2);
  return Math.max(0, Math.min(100, raw));
}

export type OptionalCandidate = {
  plan: OvernightPlan;
  usefulness: number;
  warnings: OptionalWarning[];
};

/** City identity used to avoid showing the same city twice. */
function planCityKey(plan: OvernightPlan): string {
  return plan.stays.map((s) => overnightStationKey(s.station) || cityName(s.station)).join("|");
}

/**
 * Pick up to three optional candidates from plans that are already built.
 *
 * `exclude` holds the plans already presented as recommended / alternatives:
 * recommended always wins, so a city can never appear in both sections.
 */
export function selectOptionalCandidates(args: {
  plans: OvernightPlan[];
  base: Journey;
  exclude?: OvernightPlan[];
}): OptionalCandidate[] {
  const taken = new Set((args.exclude ?? []).map(planCityKey));

  const bestPerCity = new Map<string, OptionalCandidate>();
  for (const plan of args.plans) {
    const key = planCityKey(plan);
    if (!key || taken.has(key)) continue;
    const viability = optionalViability({ plan, base: args.base });
    if (!viability.viable) continue;
    const candidate: OptionalCandidate = {
      plan: { ...plan, mode: "optional" },
      usefulness: optionalUsefulness(plan),
      warnings: viability.warnings,
    };
    const existing = bestPerCity.get(key);
    if (!existing || candidate.usefulness > existing.usefulness) bestPerCity.set(key, candidate);
  }

  const ranked = Array.from(bestPerCity.values()).sort(
    (a, b) =>
      b.usefulness - a.usefulness ||
      a.plan.addedElapsedMinutes - b.plan.addedElapsedMinutes ||
      a.plan.id.localeCompare(b.plan.id),
  );
  const best = ranked[0]?.usefulness ?? 0;
  return ranked
    .filter((c) => c.usefulness >= MIN_USEFULNESS && c.usefulness >= best - USEFULNESS_SPREAD)
    .slice(0, MAX_OPTIONAL_CANDIDATES);
}

/* ----------------------- selecting an optional stop ----------------------- */

/**
 * The traveller's explicit choice built from an optional candidate's stay.
 * It feeds the EXISTING requested-stop flow – no second routing mechanism.
 * The stay is a real timetable station, so the intent is "station".
 */
export function optionalStopPlace(stay: { station: string; place: string }): Place {
  return { name: stay.station, place: stay.place, intent: "station" };
}

/**
 * The URL only carries `name|lat,lon`, so richer endpoint metadata (intent,
 * stopId) would be lost on the way to the server. Within the session we keep
 * the selected Place and reuse it whenever it refers to the same coordinates
 * as the URL stop, so intent + stopId survive the transition.
 */
export function reconcileRequestedStop(
  fromUrl: Place | null,
  selected: Place | null,
): Place | null {
  if (!fromUrl) return null;
  if (selected && selected.place === fromUrl.place) return { ...selected, name: fromUrl.name };
  return fromUrl;
}
