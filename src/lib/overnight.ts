/**
 * Euroute Smart Overnight (Phase 2). Client-safe, pure and deterministic.
 *
 * PURPOSE
 * -------
 * A long European journey can be technically possible in one continuous
 * itinerary and still be a bad way to travel: through the night, arriving at
 * 01:40, or 18 hours of trains in one day. This module decides
 *
 *   1. whether splitting the journey into travel days could help
 *      (`shouldConsiderOvernight`)
 *   2. which stations on the ACTUAL itinerary are plausible split points
 *      (`splitCandidates`)
 *   3. how good a concrete multi-day plan is (`buildOvernightPlan`)
 *   4. whether it is meaningfully better than travelling continuously
 *      (`isMeaningfulImprovement`)
 *
 * DATA INTEGRITY
 * --------------
 * Day 1 is always a real prefix of a real itinerary from the timetable
 * source; day 2+ is always a real onward search (see overnight.server.ts).
 * Nothing here invents services, times, operators, hotels or prices.
 * An overnight STOP (traveller leaves the train and sleeps in a city) is a
 * different concept from an overnight TRAIN (traveller sleeps on board) and
 * the two are modelled separately.
 */

import { overnightStationKey } from "./station-identity";
import { formatClock, formatDuration, type Journey, type Leg } from "./journey";
import { journeyHasNightTrain } from "./night-train";
import { zoneForPlace } from "./station-timezone";
import {
  journeyFacts,
  transitLegs,
  type JourneyFacts,
  type JourneyPreferences,
  type TravelStyle,
} from "./journey-intelligence";

/* ------------------------------------------------------------------ *
 * Local time helpers (project convention: Europe/Stockholm display)
 * ------------------------------------------------------------------ */

const TZ = "Europe/Stockholm";

export function localDate(iso: string, zone: string = TZ): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** Whole local calendar days between two instants, in one zone. */
function calendarDayDelta(fromIso: string, toIso: string, zone: string = TZ): number {
  const from = localDate(fromIso, zone);
  const to = localDate(toIso, zone);
  return Math.round(
    (new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000,
  );
}

export function localHour(iso: string): number {
  return Number(
    new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, hour: "2-digit", hour12: false }).format(
      new Date(iso),
    ),
  );
}

function localMinute(iso: string): number {
  return Number(
    new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, minute: "2-digit" }).format(new Date(iso)),
  );
}

function minutesBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

/** ISO timestamp for `hour` local time on the day after `iso`. */
export function nextMorningIso(iso: string, hour: number): string {
  const start = new Date(iso).getTime();
  const minutesIntoDay = localHour(iso) * 60 + localMinute(iso);
  const delta = 24 * 60 - minutesIntoDay + hour * 60;
  return new Date(start + delta * 60000).toISOString();
}

/** Add days to a local YYYY-MM-DD date string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ *
 * Overnight station waits (the "night on a bench" pattern)
 * ------------------------------------------------------------------ *
 *
 * A continuous itinerary can be technically valid and still force the
 * traveller to spend most of the night waiting at a station. That is a real
 * comfort cost, not a neutral "long wait": it is the pattern
 *
 *   arrival late evening  ->  departure next local morning
 *
 * Detection is based on how much of the actual NIGHT the wait occupies
 * (local time), not on a raw duration threshold, so 21:57 -> 06:45 counts
 * while a 45-minute 22:30 -> 23:15 transfer does not, and an 8-hour daytime
 * wait (14:00 -> 22:00) does not either.
 */

/** Local night window used for night coverage: 23:00 -> 06:00. */
const NIGHT_START_MINUTE = 23 * 60;
const NIGHT_END_MINUTE = 30 * 60; // 06:00 the following local day

/** Minutes of the wait that fall inside the local night window. */
export function nightCoverageMinutes(arrivalIso: string, departureIso: string): number {
  const wait = minutesBetween(arrivalIso, departureIso);
  if (wait <= 0) return 0;
  const startOfDay = localHour(arrivalIso) * 60 + localMinute(arrivalIso);
  let covered = 0;
  // Look at the night before, the night of the arrival day and the next one.
  for (let day = -1; day <= 2; day += 1) {
    const from = day * 1440 + NIGHT_START_MINUTE - startOfDay;
    const to = day * 1440 + NIGHT_END_MINUTE - startOfDay;
    covered += Math.max(0, Math.min(wait, to) - Math.max(0, from));
  }
  return covered;
}

/** Wait long enough, and night-covering enough, to be a night at a station. */
const NIGHT_WAIT_MIN_MINUTES = 240;
const NIGHT_WAIT_MIN_NIGHT_MINUTES = 240;

export function isOvernightStationWait(args: { arrival: string; departure: string }): boolean {
  const wait = minutesBetween(args.arrival, args.departure);
  if (wait < NIGHT_WAIT_MIN_MINUTES) return false;
  return nightCoverageMinutes(args.arrival, args.departure) >= NIGHT_WAIT_MIN_NIGHT_MINUTES;
}

export type OvernightStationWait = {
  /** Index of the departing transit leg (day 2 would start here). */
  transitIndex: number;
  station: string;
  place: string | undefined;
  arrival: string;
  departure: string;
  waitMinutes: number;
  nightMinutes: number;
};

/** Every station wait in this itinerary that meaningfully occupies the night. */
export function overnightStationWaits(journey: Journey): OvernightStationWait[] {
  const transit = transitLegs(journey);
  const waits: OvernightStationWait[] = [];
  for (let i = 1; i < transit.length; i += 1) {
    const arriving = transit[i - 1]!;
    const departing = transit[i]!;
    if (!isOvernightStationWait({ arrival: arriving.arrival, departure: departing.departure }))
      continue;
    waits.push({
      transitIndex: i,
      station: arriving.toName,
      place: arriving.toPlace,
      arrival: arriving.arrival,
      departure: departing.departure,
      waitMinutes: minutesBetween(arriving.arrival, departing.departure),
      nightMinutes: nightCoverageMinutes(arriving.arrival, departing.departure),
    });
  }
  return waits;
}


/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type OvernightStay = {
  /** Station where the traveller leaves the railway journey. */
  station: string;
  /** "lat,lon" of that station – kept so a later phase can add lodging. */
  place: string;
  /** Arrival on the previous travel day. */
  arrival: string;
  /** Departure the following travel day. */
  departure: string;
  /** Time between arrival and next departure, in minutes. */
  waitMinutes: number;
  /** Local check-in / check-out dates (for a future accommodation phase). */
  arrivalDate: string;
  departureDate: string;
  nights: number;
};

export type OvernightBenefit = { key: string; vars?: Record<string, string | number> };

/** How exhausting a single travel day is, from the day's own facts. */
export type DayBurden = "comfortable" | "reasonable" | "long" | "veryLong" | "extreme";

/** Practical quality of the train-to-train rest window at the stop. */
export type RestWindowQuality = "veryGood" | "good" | "short" | "poor";

/**
 * How confident Euroute is that the split is better than travelling straight
 * through. Only "strong" may be presented as a more comfortable way to travel.
 */
export type OvernightConfidence = "strong" | "alternative" | "weak";

/**
 * Why this plan exists (Model 2, Phase A + C).
 *
 * - "recommended": Euroute proactively believes the overnight materially
 *   improves the journey. Governed by the comparative gates in
 *   `overnightConfidence`.
 * - "optional" (Phase C): a sensible place to split the journey if the
 *   traveller prefers two days. Does not have to beat the continuous journey,
 *   but must pass `optionalViability`. Never labelled recommended.
 * - "requested": the traveller explicitly asked to split the journey in a
 *   city. Skips the comparative gates, but must pass `requestedViability`.
 *
 * The field is OPTIONAL on purpose: saved-trip snapshots written before this
 * phase have no `mode`. Legacy plans are interpreted as "recommended", which is
 * exactly how they were produced and rendered. Old snapshots are never mutated.
 */
export type OvernightMode = "recommended" | "optional" | "requested";

/** Legacy-safe read of a plan's mode. */
export function overnightMode(plan: { mode?: OvernightMode | undefined }): OvernightMode {
  return plan.mode ?? "recommended";
}

export type OvernightDayStats = {
  /** 1-based travel day. */
  day: number;
  fromName: string;
  toName: string;
  departure: string;
  arrival: string;
  /** First departure to final arrival that day (the travel-day window). */
  windowMinutes: number;
  /** Actual time on board trains that day. */
  trainMinutes: number;
  changes: number;
  risky: number;
  tight: number;
  stationChanges: number;
  /** Day crosses local midnight or uses a night train. */
  overnight: boolean;
  burden: DayBurden;
};

export type OvernightPlan = {
  id: string;
  /** Model 2 provenance. Absent on legacy snapshots => "recommended". */
  mode?: OvernightMode;
  /** One real journey per travel day, in order. */
  days: Journey[];
  /** Per-day burden facts, used by the score and the UI copy. */
  dayStats: OvernightDayStats[];
  /** One stay per gap between travel days. */
  stays: OvernightStay[];
  /** Sum of the travel days' durations. */
  travelMinutes: number;
  longestDayMinutes: number;
  /** Longest amount of actual train time in one day. */
  longestDayTrainMinutes: number;
  /** First departure to final arrival, including the nights. */
  elapsedMinutes: number;
  /**
   * Extra time on trains/at stations compared with travelling continuously.
   * This is a TRAVEL-BURDEN measure: the nights between travel days are NOT
   * included, so it must never be used to express "how much later do I get
   * there?".
   */
  addedTravelMinutes: number;
  /**
   * Honest elapsed cost of inserting the overnight: this plan's first
   * departure -> final arrival, minus the continuous journey's own elapsed
   * duration. Includes the nights. Negative when the plan happens to arrive
   * earlier than the compared base itinerary.
   */
  addedElapsedMinutes: number;
  /**
   * Whole local calendar days between the base arrival and this plan's final
   * arrival, measured in the destination station's zone. 0 = same local day.
   */
  arrivalDayDelta: number;
  /** True when this plan arrives on a later local calendar day than the base. */
  arrivesLaterDay: boolean;
  changes: number;
  stationChanges: number;
  riskyConnections: number;
  tightConnections: number;
  hasNightTravel: boolean;
  meetsMaxPerDay: boolean;
  /**
   * True when the base continuous itinerary made the traveller spend a night
   * waiting at a station and this plan turns that into a real overnight stay.
   */
  convertsStationNightToStay: boolean;
  /** Overnight station waits this plan still forces on the traveller. */
  retainedStationNights: number;
  /** Weakest rest window across the stays. */
  restQuality: RestWindowQuality;

  /** Internal overnight quality, 0–100. Not shown as a second score. */
  score: number;
  benefits: OvernightBenefit[];
  /** Honest drawbacks of this exact itinerary. */
  warnings: OvernightBenefit[];
  /** Deterministic "why this city" explanation. */
  reason: OvernightBenefit;
  /** Set by the server once all candidates have been compared. */
  confidence: OvernightConfidence;
  /** Short trade-off line used when confidence is "alternative". */
  tradeoff: OvernightBenefit | null;
};

/* ------------------------------------------------------------------ *
 * Journey construction from real legs
 * ------------------------------------------------------------------ */

/** Rebuilds a Journey from a real slice of legs. No values are invented. */
export function journeyFromLegs(legs: Leg[], id: string): Journey {
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  const transit = legs.filter((l) => l.kind !== "walk");
  const gaps: number[] = [];
  for (let i = 1; i < transit.length; i += 1) {
    gaps.push(minutesBetween(transit[i - 1]!.arrival, transit[i]!.departure));
  }
  return {
    id,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: minutesBetween(first.departure, last.arrival),
    transfers: Math.max(transit.length - 1, 0),
    minTransferMinutes: gaps.length ? Math.min(...gaps) : undefined,
    legs,
    operators: Array.from(new Set(transit.map((l) => l.operator).filter(Boolean) as string[])),
    hasNightLeg: journeyHasNightTrain({ legs }),
    chained: true,
  };
}

/** Journey made of the transit legs up to (excluding) `transitIndex`. */
export function journeyPrefix(journey: Journey, transitIndex: number): Journey {
  const transit = transitLegs(journey);
  return journeyFromLegs(transit.slice(0, transitIndex), `${journey.id}-d1-${transitIndex}`);
}

/* ------------------------------------------------------------------ *
 * 1. Should we even look at overnight stops?
 * ------------------------------------------------------------------ */

export type OvernightTrigger =
  | "longJourney"
  | "nightTravel"
  | "nightTrain"
  | "lateArrival"
  | "earlyDeparture"
  | "nightWait"
  | "lateRiskyConnection"
  | "overDailyLimit"
  | "requested";

/** Minimum continuous journey length before a stop is even considered. */
const STYLE_MIN_DURATION: Record<string, number> = {
  fastest: 900,
  recommended: 600,
  comfortable: 480,
};

/** Absolute floor – short journeys must never mention overnight planning. */
const ABSOLUTE_MIN_DURATION = 360;

export function shouldConsiderOvernight(args: {
  journey: Journey;
  facts: JourneyFacts;
  preferences: JourneyPreferences;
  style: TravelStyle;
  /** User explicitly named a city to stay in. */
  requested?: boolean;
}): { consider: boolean; triggers: OvernightTrigger[] } {
  const { journey, facts, preferences: prefs, style } = args;
  const triggers: OvernightTrigger[] = [];

  const limit = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
  const overLimit = limit !== null && facts.longestTravelDayMinutes > limit;

  if (args.requested) triggers.push("requested");
  if (overLimit) triggers.push("overDailyLimit");
  if (journey.durationMinutes >= (STYLE_MIN_DURATION[style] ?? 600)) triggers.push("longJourney");
  if (facts.overnight && !facts.hasNightTrain) triggers.push("nightTravel");
  if (facts.hasNightTrain) triggers.push("nightTrain");
  if (facts.arrivalHour >= 23 || facts.arrivalHour <= 5) triggers.push("lateArrival");
  if (facts.departureHour <= 5) triggers.push("earlyDeparture");
  if (
    facts.connections.some(
      (c) => c.longWait && (localHour(journey.departure) >= 0 ? true : true) && c.minutes >= 180,
    ) &&
    facts.overnight
  )
    triggers.push("nightWait");
  if (facts.connections.some((c) => c.level !== "comfortable" && !c.longWait))
    triggers.push("lateRiskyConnection");

  // A stop needs at least two transit legs to split at, and a journey long
  // enough that a second travel day is plausible at all.
  const splittable = transitLegs(journey).length >= 2;
  const longEnough = journey.durationMinutes >= ABSOLUTE_MIN_DURATION;
  const styleLongEnough = journey.durationMinutes >= (STYLE_MIN_DURATION[style] ?? 600);

  // "Fastest" only looks at overnight stops when the traveller asked for one
  // or the journey breaks their own daily limit.
  const allowedByStyle =
    style === "fastest"
      ? Boolean(args.requested) || prefs.allowOvernightStop || overLimit
      : styleLongEnough || overLimit || Boolean(args.requested) || prefs.allowOvernightStop;

  return {
    consider: splittable && longEnough && allowedByStyle && triggers.length > 0,
    triggers,
  };
}

/* ------------------------------------------------------------------ *
 * 2. Plausible split points (cheap – no API calls)
 * ------------------------------------------------------------------ */

export type SplitCandidate = {
  station: string;
  place: string;
  /** Index in the transit-leg list where day 2 would start. */
  transitIndex: number;
  arrival: string;
  arrivalHour: number;
  travelBeforeMinutes: number;
  travelAfterMinutes: number;
  /** Cheap pre-score used to pick which candidates are worth an API call. */
  fitness: number;
};


/**
 * Arrival-time quality at the overnight city: enough of the evening left to
 * leave the station, reach accommodation and eat. 0–20.
 */
export function arrivalHourScore(hour: number): number {
  if (hour >= 16 && hour <= 21) return 20;
  if (hour === 22) return 14;
  if (hour === 15) return 16;
  if (hour === 14) return 12;
  if (hour === 13) return 9;
  if (hour === 23) return 7;
  if (hour === 0 || hour === 1) return 2;
  return 0; // 02–12: either the middle of the night or far too early to stop
}

/** Next-morning departure quality. 0–15. */
export function departureHourScore(hour: number): number {
  if (hour >= 7 && hour <= 10) return 15;
  if (hour === 11 || hour === 12) return 11;
  if (hour === 6) return 8;
  if (hour === 13) return 8;
  if (hour === 5) return 3;
  return 0;
}

/** Even travel days score highest. 0–20. */
export function balanceScore(dayMinutes: number[]): number {
  const max = Math.max(...dayMinutes);
  const min = Math.min(...dayMinutes);
  if (max <= 0) return 0;
  return Math.round(20 * (min / max));
}

/**
 * Plausible split points, taken only from stations the itinerary actually
 * calls at. Filtered by route position and arrival time so we spend API
 * calls on a handful of realistic candidates instead of every station.
 */
export type SplitCandidateOptions = {
  /**
   * Accept split points that are not ideal overnight arrivals (late morning
   * through midday). Only used when the traveller's daily travel limit forces
   * a split that a purely comfort-driven filter would reject.
   */
  relaxArrival?: boolean;
  /** Day 1 must not exceed this many minutes (the daily travel limit). */
  maxDayMinutes?: number | null;
};

export function splitCandidates(
  journey: Journey,
  maxCandidates = 3,
  opts: SplitCandidateOptions = {},
): SplitCandidate[] {
  const transit = transitLegs(journey);
  if (transit.length < 2) return [];
  const total = journey.durationMinutes;

  const found: SplitCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < transit.length; i += 1) {
    const arriving = transit[i - 1]!;
    const place = arriving.toPlace;
    if (!place) continue;

    const before = minutesBetween(journey.departure, arriving.arrival);
    const after = total - before;
    // A travel day shorter than 2 h either way is not a real travel day.
    if (before < 120 || after < 120) continue;
    if (opts.maxDayMinutes && before > opts.maxDayMinutes) continue;
    if (!opts.maxDayMinutes) {
      const fraction = before / total;
      if (fraction < 0.15 || fraction > 0.85) continue;
    }

    const hour = localHour(arriving.arrival);
    const raw = arrivalHourScore(hour);
    // Relaxed mode still refuses the middle of the night (02–08): stopping
    // there is not an overnight stay.
    const arrival = raw > 0 ? raw : opts.relaxArrival && hour >= 9 && hour <= 13 ? 1 : 0;
    if (arrival === 0) continue;

    const key = overnightStationKey(arriving.toName);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    found.push({
      station: arriving.toName,
      place,
      transitIndex: i,
      arrival: arriving.arrival,
      arrivalHour: hour,
      travelBeforeMinutes: before,
      travelAfterMinutes: after,
      fitness: arrival + balanceScore([before, after]),
    });
  }

  return found.sort((a, b) => b.fitness - a.fitness).slice(0, maxCandidates);
}

/* ------------------------------------------------------------------ *
 * 3. Overnight quality model (Phase 2B)
 * ------------------------------------------------------------------ *
 *
 * Phase 2B does not ask "did we remove the night train?" but "how good is
 * the COMPLETE multi-day journey?". Every travel day is judged on its own
 * facts, the rest window is judged on what we actually know (arrival time,
 * next departure, the gap between them) and every connection on every day
 * runs through the Phase 1 risk model.
 *
 *   Daily burden (worst day)   max 35  – travel-day window, adjusted for
 *                                        changes and connection risk
 *   Rest window quality        max 20  – arrival, gap, next departure
 *   No travel through night    max 15
 *   Connection quality         max 15  – risky −8, tight −4 each
 *   Balanced days              max  5  – a tie-breaker, never a goal
 *   Extra travel time         −25..0   – vs travelling straight through
 *   Preference fit            −18..+5
 *   Station changes            −5
 */

/** Consumer-facing city name: "Hamburg Hbf" -> "Hamburg". */
export function cityName(station: string): string {
  const first = station.split(",")[0]!.trim();
  return (
    first
      .replace(
        /\s+(Hbf|Hauptbahnhof|Centralstation|Central(?:en)?|C|Hb|Termini|(?:Santa|S\.?)\s*Maria Novella|Gare\s+(?:de|du|des)\s+[\p{L}'\s-]+|SBB|CFF|FFS|SNCB|NMBS|H|St\.?|Station|Banegård|Bahnhof|Nord|Sud|Süd|Est|Ouest|Centrale|Central Station)$/iu,
        "",
      )
      .trim() || first
  );
}

/** Travel-day window adjusted for how much work the day contains. */
function effortMinutes(stats: {
  windowMinutes: number;
  changes: number;
  risky: number;
  tight: number;
  stationChanges: number;
}): number {
  return (
    stats.windowMinutes +
    stats.changes * 15 +
    stats.risky * 30 +
    stats.tight * 15 +
    stats.stationChanges * 15
  );
}

export function dayBurden(effort: number): DayBurden {
  if (effort <= 480) return "comfortable";
  if (effort <= 600) return "reasonable";
  if (effort <= 720) return "long";
  if (effort <= 840) return "veryLong";
  return "extreme";
}

/**
 * Rest window quality from the facts we have: when the traveller arrives,
 * how long the train-to-train gap is and when they must leave again. No
 * fictional sleep duration, no assumptions about hotels.
 *
 * `nightMinutes` (how much of the local night 23:00–06:00 the stay covers) is
 * the primary signal when available: a stay from 21:57 to 06:45 covers the
 * whole night and is a real overnight opportunity even though it is a few
 * minutes short of a raw 9-hour threshold. Raw duration is only the fallback.
 */
export function restWindowQuality(args: {
  arrivalHour: number;
  departureHour: number;
  waitMinutes: number;
  /** Minutes of the stay inside the local night window, when known. */
  nightMinutes?: number;
}): RestWindowQuality {
  const { arrivalHour: a, departureHour: d, waitMinutes: wait } = args;
  const night = args.nightMinutes ?? 0;
  const lateArrival = a >= 23 || a <= 4;
  const earlyDeparture = d <= 5;
  if (lateArrival || earlyDeparture) return "poor";
  // Full or near-full night coverage with a civilised arrival and departure.
  if (night >= 420 && a <= 22 && d >= 6) return "veryGood";
  if (night >= 300 && a <= 22 && d >= 6) return "good";
  if (wait < 420) return "poor";
  if (wait >= 660 && a <= 21 && d >= 8) return "veryGood";
  if (wait >= 540 && a <= 22 && d >= 7) return "good";
  return "short";
}


const REST_POINTS: Record<RestWindowQuality, number> = {
  veryGood: 20,
  good: 15,
  short: 7,
  poor: 0,
};

const BURDEN_POINTS: Record<DayBurden, number> = {
  comfortable: 35,
  reasonable: 29,
  long: 20,
  veryLong: 10,
  extreme: 0,
};

function dayStatsFor(day: Journey, index: number, minTransferMinutes: number): OvernightDayStats {
  const facts = journeyFacts(day, minTransferMinutes);
  const transit = transitLegs(day);
  const changes = facts.connections.filter((c) => !c.longWait).length;
  const stats = {
    windowMinutes: day.durationMinutes,
    changes,
    risky: facts.connections.filter((c) => c.level === "risky" && !c.longWait).length,
    tight: facts.connections.filter((c) => c.level === "tight" && !c.longWait).length,
    stationChanges: facts.stationChanges,
  };
  return {
    day: index + 1,
    fromName: transit[0]?.fromName ?? "",
    toName: transit[transit.length - 1]?.toName ?? "",
    departure: day.departure,
    arrival: day.arrival,
    windowMinutes: stats.windowMinutes,
    trainMinutes: transit.reduce((sum, l) => sum + l.durationMinutes, 0),
    changes: stats.changes,
    risky: stats.risky,
    tight: stats.tight,
    stationChanges: stats.stationChanges,
    overnight: facts.overnight || facts.hasNightTrain,
    burden: dayBurden(effortMinutes(stats)),
  };
}

export function buildOvernightPlan(args: {
  days: Journey[];
  stays: Omit<OvernightStay, "waitMinutes" | "arrivalDate" | "departureDate" | "nights">[];
  base: Journey;
  baseFacts: JourneyFacts;
  preferences: JourneyPreferences;
  /** How many overnight cities were actually compared (for honest copy). */
  comparedCities?: number;
  /** Provenance of this plan. Defaults to the proactive path. */
  mode?: OvernightMode;
}): OvernightPlan {
  const { days, base, baseFacts, preferences: prefs } = args;

  const stays: OvernightStay[] = args.stays.map((stay) => {
    const arrivalDate = localDate(stay.arrival);
    const departureDate = localDate(stay.departure);
    const nights = Math.max(
      1,
      Math.round(
        (new Date(`${departureDate}T12:00:00Z`).getTime() -
          new Date(`${arrivalDate}T12:00:00Z`).getTime()) /
          86400000,
      ),
    );
    return {
      ...stay,
      waitMinutes: minutesBetween(stay.arrival, stay.departure),
      arrivalDate,
      departureDate,
      nights,
    };
  });

  const dayStats = days.map((day, index) => dayStatsFor(day, index, prefs.minTransferMinutes));
  const dayMinutes = dayStats.map((d) => d.windowMinutes);
  const travelMinutes = dayMinutes.reduce((sum, m) => sum + m, 0);
  const longestDayMinutes = Math.max(...dayMinutes);
  const longestDayTrainMinutes = Math.max(...dayStats.map((d) => d.trainMinutes));
  const elapsedMinutes = minutesBetween(days[0]!.departure, days[days.length - 1]!.arrival);
  const addedTravelMinutes = Math.max(0, travelMinutes - base.durationMinutes);
  /**
   * Honest elapsed cost. Both sides are absolute instants (ISO timestamps
   * subtracted as epoch milliseconds), so DST transitions and zone changes
   * along the route cannot distort it. `base.durationMinutes` is the same
   * departure->arrival instant difference for the continuous itinerary.
   */
  const finalArrival = days[days.length - 1]!.arrival;
  const addedElapsedMinutes = elapsedMinutes - base.durationMinutes;
  // Calendar-day comparison happens in the destination station's own zone when
  // we know it, so "later day" means later day where the traveller arrives.
  const destinationLegs = transitLegs(days[days.length - 1]!);
  const destinationZone = zoneForPlace(destinationLegs[destinationLegs.length - 1]?.toPlace);
  const arrivalDayDelta = calendarDayDelta(base.arrival, finalArrival, destinationZone);
  const arrivesLaterDay = arrivalDayDelta >= 1;

  const risky = dayStats.reduce((n, d) => n + d.risky, 0);
  const tight = dayStats.reduce((n, d) => n + d.tight, 0);
  const stationChanges = dayStats.reduce((n, d) => n + d.stationChanges, 0);
  const hasNightTravel = dayStats.some((d) => d.overnight);
  const changes = dayStats.reduce((n, d) => n + d.changes, 0);

  const limitMinutes = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
  const meetsMaxPerDay = limitMinutes === null || longestDayMinutes <= limitMinutes;

  /* ---- station nights: base drawback vs. this plan ----------------- */
  const baseStationNights = overnightStationWaits(base);
  const retainedStationNights = days.reduce((n, d) => n + overnightStationWaits(d).length, 0);
  // The base forced a night at a station and this plan does not: that is a
  // genuine comfort improvement even when nothing gets shorter.
  const convertsStationNightToStay =
    baseStationNights.length > 0 && retainedStationNights < baseStationNights.length;

  /* ---- rest windows ------------------------------------------------ */
  const restQualities = stays.map((s) =>
    restWindowQuality({
      arrivalHour: localHour(s.arrival),
      departureHour: localHour(s.departure),
      waitMinutes: s.waitMinutes,
      nightMinutes: nightCoverageMinutes(s.arrival, s.departure),
    }),
  );
  const order: RestWindowQuality[] = ["poor", "short", "good", "veryGood"];
  const restQuality =
    restQualities.length === 0
      ? "poor"
      : restQualities.reduce((worst, q) => (order.indexOf(q) < order.indexOf(worst) ? q : worst));

  /* ---- score ------------------------------------------------------- */
  const worstBurden = dayStats.reduce(
    (min, d) => Math.min(min, BURDEN_POINTS[d.burden]),
    BURDEN_POINTS.comfortable,
  );
  // A day beyond the traveller's own limit is worse than the generic tiers.
  const limitPenalty =
    limitMinutes !== null && longestDayMinutes > limitMinutes
      ? Math.min(15, Math.round(((longestDayMinutes - limitMinutes) / 60) * 6))
      : 0;
  const burdenPoints = Math.max(0, worstBurden - limitPenalty);
  const restPoints = Math.round(
    restQualities.reduce((sum, q) => sum + REST_POINTS[q], 0) / Math.max(1, restQualities.length),
  );
  const nightFree = hasNightTravel ? 0 : 15;
  const connectionQuality = Math.max(0, 15 - risky * 8 - tight * 4);
  const balance = Math.round(balanceScore(dayMinutes) / 4); // max 5, tie-breaker only
  const extra = -Math.min(25, Math.round(addedTravelMinutes / 12));
  // A station night is its own comfort cost, separate from risky connections:
  // relief when it becomes a bed, a real penalty when the plan keeps it.
  const stationNightRelief = convertsStationNightToStay ? 12 : 0;
  const stationNightPenalty = -Math.min(20, retainedStationNights * 12);
  let preferenceFit = 0;
  if (prefs.allowOvernightStop) preferenceFit += 5;
  if (!meetsMaxPerDay) preferenceFit -= 10;
  if (prefs.avoidNightTrains && dayStats.some((d) => d.overnight)) preferenceFit -= 8;
  if (prefs.maxTransfers !== null && days.some((d) => d.transfers > prefs.maxTransfers!))
    preferenceFit -= 5;
  const stationPenalty = stationChanges > 0 ? -5 : 0;

  const score = Math.max(
    0,
    Math.min(
      100,
      burdenPoints +
        restPoints +
        nightFree +
        connectionQuality +
        balance +
        extra +
        preferenceFit +
        stationPenalty +
        stationNightRelief +
        stationNightPenalty,
    ),
  );


  /* ---- benefits: only statements true for THIS itinerary ----------- */
  const benefits: OvernightBenefit[] = [];
  if (!hasNightTravel && (baseFacts.overnight || baseFacts.hasNightTrain))
    benefits.push({ key: "on.benefit.noNightTravel" });
  if (convertsStationNightToStay) {
    const night = baseStationNights[0]!;
    benefits.push({
      key: "on.benefit.stationNightToStay",
      vars: {
        city: cityName(night.station),
        time: formatDuration(night.waitMinutes),
      },
    });
  }
  // Unit note: both sides are onboard/travel minutes per day, so the
  // comparison is like-with-like (see `muchShorterDays`).
  if (longestDayTrainMinutes <= baseFacts.longestTravelDayMinutes - 90)
    benefits.push({
      key: "on.benefit.shorterDays",
      vars: { time: formatDuration(longestDayMinutes) },
    });
  if (risky === 0 && tight === 0 && changes > 0)
    benefits.push({ key: "on.benefit.comfortableConnections" });
  if (stationChanges === 0 && baseFacts.stationChanges > 0)
    benefits.push({ key: "on.benefit.noStationChange" });
  if (limitMinutes !== null && meetsMaxPerDay)
    benefits.push({ key: "on.benefit.withinLimit", vars: { h: prefs.maxTravelHoursPerDay ?? 0 } });
  if (restQuality === "veryGood" || restQuality === "good")
    benefits.push({ key: `on.benefit.rest.${restQuality}` });
  if (dayStats.every((d) => d.burden === "comfortable" || d.burden === "reasonable"))
    benefits.push({
      key: "on.benefit.manageableDays",
      vars: { time: formatDuration(longestDayMinutes) },
    });

  /* ---- warnings: the honest downsides ------------------------------ */
  const warnings: OvernightBenefit[] = [];
  // The elapsed cost is the headline drawback, so it leads the list (the card
  // shows the first three warnings).
  if (addedElapsedMinutes >= MATERIAL_DELAY_MINUTES)
    warnings.push({
      key: "on.warn.addedElapsed",
      vars: { time: formatDuration(addedElapsedMinutes) },
    });
  if (retainedStationNights > 0) warnings.push({ key: "on.warn.stationNight" });

  for (const d of dayStats) {
    if (d.burden === "veryLong" || d.burden === "extreme")
      warnings.push({
        key: d.burden === "extreme" ? "on.warn.extremeDay" : "on.warn.longDay",
        vars: { n: d.day, time: formatDuration(d.windowMinutes) },
      });
  }
  for (const d of dayStats) {
    for (const c of journeyFacts(days[d.day - 1]!, prefs.minTransferMinutes).connections) {
      if (c.longWait) continue;
      if (c.level === "risky")
        warnings.push({
          key: "on.warn.riskyConnection",
          vars: { city: cityName(c.arriveStation), min: c.minutes },
        });
      else if (c.level === "tight")
        warnings.push({
          key: "on.warn.tightConnection",
          vars: { city: cityName(c.arriveStation), min: c.minutes },
        });
    }
  }
  if (restQuality === "poor" || restQuality === "short") {
    const stay = stays[0];
    if (stay)
      warnings.push({
        key: `on.warn.rest.${restQuality}`,
        vars: {
          arrival: formatClock(stay.arrival, zoneForPlace(stay.place)),
          departure: formatClock(stay.departure, zoneForPlace(stay.place)),
        },
      });
  }
  if (hasNightTravel) warnings.push({ key: "on.warn.stillNightTravel" });
  if (addedTravelMinutes >= 120)
    warnings.push({
      key: "on.warn.addedTime",
      vars: { time: formatDuration(addedTravelMinutes) },
    });
  if (stationChanges > 0)
    warnings.push({ key: "on.warn.stationChange", vars: { n: stationChanges } });
  if (limitMinutes !== null && !meetsMaxPerDay)
    warnings.push({
      key: "on.warn.overLimit",
      vars: { h: prefs.maxTravelHoursPerDay ?? 0, time: formatDuration(longestDayMinutes) },
    });

  /* ---- why this city ---------------------------------------------- */
  const city = cityName(stays[0]?.station ?? "");
  const baseRisk = baseFacts.connections.filter(
    (c) => c.level !== "comfortable" && !c.longWait,
  ).length;
  const compared = args.comparedCities ?? 1;
  let reason: OvernightBenefit;
  if (limitMinutes !== null && meetsMaxPerDay && baseFacts.longestTravelDayMinutes > limitMinutes) {
    reason = {
      key: "on.reason.withinLimit",
      vars: { city, h: prefs.maxTravelHoursPerDay ?? 0, time: formatDuration(longestDayMinutes) },
    };
  } else if (compared > 1) {
    reason = {
      key: "on.reason.bestOfCompared",
      vars: { city, n: compared },
    };
  } else if (!hasNightTravel && (baseFacts.overnight || baseFacts.hasNightTrain)) {
    reason = { key: "on.reason.noNight", vars: { city } };
  } else if (baseRisk > risky + tight) {
    reason = { key: "on.reason.saferConnections", vars: { city, n: baseRisk - risky - tight } };
  } else {
    reason = {
      key: "on.reason.shorterDays",
      vars: { city, time: formatDuration(longestDayMinutes) },
    };
  }

  return {
    mode: args.mode ?? "recommended",
    id: `${days[0]!.id}-on-${stays.map((s) => overnightStationKey(s.station)).join("-")}`,
    days,
    dayStats,
    stays,
    travelMinutes,
    longestDayMinutes,
    longestDayTrainMinutes,
    elapsedMinutes,
    addedTravelMinutes,
    addedElapsedMinutes,
    arrivalDayDelta,
    arrivesLaterDay,
    changes,
    stationChanges,
    riskyConnections: risky,
    tightConnections: tight,
    hasNightTravel,
    meetsMaxPerDay,
    convertsStationNightToStay,
    retainedStationNights,
    restQuality,

    score,
    benefits,
    warnings,
    reason,
    confidence: "weak",
    tradeoff: null,
  };
}

/* ------------------------------------------------------------------ *
 * 4. Is the split actually better than travelling continuously?
 * ------------------------------------------------------------------ *
 *
 * Three outcomes, so the UI can be honest:
 *   strong      – clearly better; may be sold as a more comfortable way
 *   alternative – improves some things, real trade-offs remain
 *   weak        – not worth recommending; keep the continuous journey
 */

/**
 * Smallest elapsed delay worth telling the traveller about. Reuses the
 * existing added-time threshold (`on.warn.addedTime`) so ordinary timetable
 * variation never produces a warning.
 */
export const MATERIAL_DELAY_MINUTES = 120;

/**
 * How much longer than the continuous journey a split may take before it stops
 * being a normal recommendation. Same style-dependent architecture as before –
 * only the quantity it measures became honest.
 */
export function maxExtraRatio(style: TravelStyle): number {
  return style === "comfortable" ? 0.45 : style === "fastest" ? 0.15 : 0.3;
}


export function overnightConfidence(args: {
  plan: OvernightPlan;
  base: Journey;
  baseFacts: JourneyFacts;
  preferences: JourneyPreferences;
  style: TravelStyle;
  requested?: boolean;
}): { confidence: OvernightConfidence; tradeoff: OvernightBenefit | null } {
  const { plan, base, baseFacts, preferences: prefs, style } = args;

  const limitMinutes = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
  const baseRisk = baseFacts.connections.filter(
    (c) => c.level !== "comfortable" && !c.longWait,
  ).length;

  const removesNight = !plan.hasNightTravel && (baseFacts.overnight || baseFacts.hasNightTrain);
  const satisfiesLimit =
    limitMinutes !== null &&
    plan.meetsMaxPerDay &&
    baseFacts.longestTravelDayMinutes > limitMinutes;
  const saferConnections = baseRisk > plan.riskyConnections + plan.tightConnections;
  /**
   * Unit fix: `baseFacts.longestTravelDayMinutes` is onboard/travel minutes per
   * calendar day, so it must be compared with the plan's own onboard minutes
   * (`longestDayTrainMinutes`), never with the travel-day window. Onboard
   * minutes are the representation used here because they express the burden
   * that actually belongs to the day on both sides of the comparison.
   */
  const muchShorterDays =
    plan.longestDayTrainMinutes <= baseFacts.longestTravelDayMinutes - 180;
  const betterArrival =
    (baseFacts.arrivalHour >= 23 || baseFacts.arrivalHour <= 5) &&
    plan.days.every((d) => localHour(d.arrival) < 23 && localHour(d.arrival) > 5);
  const fewerChanges = plan.changes < baseFacts.connections.filter((c) => !c.longWait).length;
  // C -> D: a night on a station bench becomes an intentional overnight stay.
  const convertsStationNightToStay = plan.convertsStationNightToStay;

  const improvements = [
    removesNight,
    satisfiesLimit,
    saferConnections,
    muchShorterDays,
    betterArrival,
    fewerChanges,
    convertsStationNightToStay,
  ].filter(Boolean).length;

  // A stop the traveller asked for is always built, but still labelled honestly.
  if (improvements === 0 && !args.requested) return { confidence: "weak", tradeoff: null };


  /**
   * Cost guard (Phase 1). The question here is "how much longer does choosing
   * this overnight make the trip?", so the honest elapsed delta is used, not
   * the travel-burden delta: the night at the stop is exactly the part that
   * `addedTravelMinutes` cannot see.
   *
   * A plan that solves a real problem in the base itinerary (a night on a
   * station bench, unavoidable night travel, a broken daily limit) is not
   * suppressed by the guard – it is only barred from being sold as a clearly
   * better way to travel, and keeps its honest drawbacks. `arrivesLaterDay` is
   * supporting evidence: paying more than the ratio allows AND landing on a
   * later local day is the excessive-cost case we saw live.
   */
  const excessiveCost = plan.addedElapsedMinutes / Math.max(1, base.durationMinutes) > maxExtraRatio(style);
  const solvesRealProblem = removesNight || satisfiesLimit || convertsStationNightToStay;
  if (excessiveCost && !args.requested && !solvesRealProblem)
    return { confidence: "weak", tradeoff: null };


  const hardestDay = plan.dayStats.reduce(
    (worst, d) => (d.windowMinutes > worst.windowMinutes ? d : worst),
    plan.dayStats[0]!,
  );
  const drawbacks: OvernightBenefit[] = [];
  // An excessive elapsed cost that survived the guard (because the plan solves
  // a real problem) is still a drawback, so it can never be sold as "strong".
  if (excessiveCost && plan.addedElapsedMinutes >= MATERIAL_DELAY_MINUTES)
    drawbacks.push({
      key: "on.tradeoff.addedElapsed",
      vars: { time: formatDuration(plan.addedElapsedMinutes) },
    });
  if (hardestDay.burden === "veryLong" || hardestDay.burden === "extreme")
    drawbacks.push({
      key: "on.tradeoff.longDay",
      vars: { n: hardestDay.day, time: formatDuration(hardestDay.windowMinutes) },
    });
  if (plan.riskyConnections > 0) drawbacks.push({ key: "on.tradeoff.risky" });
  if (plan.restQuality === "poor") drawbacks.push({ key: "on.tradeoff.rest" });
  if (plan.retainedStationNights > 0) drawbacks.push({ key: "on.tradeoff.stationNight" });
  if (limitMinutes !== null && !plan.meetsMaxPerDay)
    drawbacks.push({
      key: "on.tradeoff.overLimit",
      vars: { h: prefs.maxTravelHoursPerDay ?? 0, time: formatDuration(plan.longestDayMinutes) },
    });
  if (plan.addedTravelMinutes >= 180)
    drawbacks.push({
      key: "on.tradeoff.addedTime",
      vars: { time: formatDuration(plan.addedTravelMinutes) },
    });

  const strongMin = style === "comfortable" ? 62 : style === "fastest" ? 78 : 70;
  const altMin = style === "comfortable" ? 45 : style === "fastest" ? 60 : 52;

  // Trade-off wording combines what you gain with what you accept.
  const worst = drawbacks[0] ?? null;
  const tradeoff: OvernightBenefit | null =
    worst && removesNight && worst.key === "on.tradeoff.longDay"
      ? { key: "on.tradeoff.nightVsLongDay", ...(worst.vars ? { vars: worst.vars } : {}) }
      : worst;

  // A long day is not a real drawback when it is dramatically shorter than
  // travelling straight through and the night on a train disappears.
  // Both sides are onboard/travel minutes per day (unit-consistent).
  const longDayForgiven =
    removesNight &&
    (plan.longestDayTrainMinutes <= baseFacts.longestTravelDayMinutes - 360 ||
      plan.longestDayTrainMinutes <= base.durationMinutes / 2);
  const blocking = longDayForgiven
    ? drawbacks.filter((d) => d.key !== "on.tradeoff.longDay")
    : drawbacks;

  // A requested split is the traveller's own preference, never a Euroute
  // recommendation: it can never be labelled "strong".
  if (blocking.length === 0 && plan.score >= strongMin && improvements >= 1 && !args.requested)
    return { confidence: "strong", tradeoff: null };

  // A plan can still be a useful alternative below the score threshold when
  // it delivers several real gains (typically: the night train disappears and
  // the longest travel day shrinks), as long as the drawbacks are stated.
  const clearGains =
    improvements >= 2 &&
    !plan.hasNightTravel &&
    plan.longestDayTrainMinutes < baseFacts.longestTravelDayMinutes;

  // Turning a night at a station into a bed is a gain on its own, but the plan
  // still has to be a sane itinerary: no extreme travel day, no risky
  // connections, and it must not keep another station night.
  const stationNightGain =
    convertsStationNightToStay &&
    plan.retainedStationNights === 0 &&
    plan.riskyConnections === 0 &&
    !plan.dayStats.some((d) => d.burden === "extreme") &&
    (limitMinutes === null || plan.meetsMaxPerDay);

  if (plan.score >= altMin || clearGains || stationNightGain || args.requested)
    return { confidence: "alternative", tradeoff: tradeoff ?? drawbacks[0] ?? null };


  return { confidence: "weak", tradeoff: null };
}

/** Kept for compatibility: any plan we would show at all. */
export function isMeaningfulImprovement(args: {
  plan: OvernightPlan;
  base: Journey;
  baseFacts: JourneyFacts;
  preferences: JourneyPreferences;
  style: TravelStyle;
  requested?: boolean;
}): boolean {
  return overnightConfidence(args).confidence !== "weak";
}
