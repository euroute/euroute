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

import { formatClock, formatDuration, type Journey, type Leg } from "./journey";
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

export function localDate(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
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
  /** Extra time on trains/at stations compared with travelling continuously. */
  addedTravelMinutes: number;
  changes: number;
  stationChanges: number;
  riskyConnections: number;
  tightConnections: number;
  hasNightTravel: boolean;
  meetsMaxPerDay: boolean;
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
    hasNightLeg: transit.some((l) => l.mode === "NIGHT_RAIL"),
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

function normStation(name: string): string {
  return name
    .toLowerCase()
    .split(",")[0]!
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(hbf|hauptbahnhof|centralstation|central|c|st|station)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

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

    const key = normStation(arriving.toName);
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
 */
export function restWindowQuality(args: {
  arrivalHour: number;
  departureHour: number;
  waitMinutes: number;
}): RestWindowQuality {
  const { arrivalHour: a, departureHour: d, waitMinutes: wait } = args;
  const lateArrival = a >= 23 || a <= 4;
  const earlyDeparture = d <= 5;
  if (lateArrival || earlyDeparture || wait < 420) return "poor";
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

  const risky = dayStats.reduce((n, d) => n + d.risky, 0);
  const tight = dayStats.reduce((n, d) => n + d.tight, 0);
  const stationChanges = dayStats.reduce((n, d) => n + d.stationChanges, 0);
  const hasNightTravel = dayStats.some((d) => d.overnight);
  const changes = dayStats.reduce((n, d) => n + d.changes, 0);

  const limitMinutes = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
  const meetsMaxPerDay = limitMinutes === null || longestDayMinutes <= limitMinutes;

  /* ---- rest windows ------------------------------------------------ */
  const restQualities = stays.map((s) =>
    restWindowQuality({
      arrivalHour: localHour(s.arrival),
      departureHour: localHour(s.departure),
      waitMinutes: s.waitMinutes,
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
        stationPenalty,
    ),
  );

  /* ---- benefits: only statements true for THIS itinerary ----------- */
  const benefits: OvernightBenefit[] = [];
  if (!hasNightTravel && (baseFacts.overnight || baseFacts.hasNightTrain))
    benefits.push({ key: "on.benefit.noNightTravel" });
  if (longestDayMinutes <= baseFacts.longestTravelDayMinutes - 90)
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
          arrival: formatClock(stay.arrival),
          departure: formatClock(stay.departure),
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
    id: `${days[0]!.id}-on-${stays.map((s) => normStation(s.station)).join("-")}`,
    days,
    dayStats,
    stays,
    travelMinutes,
    longestDayMinutes,
    longestDayTrainMinutes,
    elapsedMinutes,
    addedTravelMinutes,
    changes,
    stationChanges,
    riskyConnections: risky,
    tightConnections: tight,
    hasNightTravel,
    meetsMaxPerDay,
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
  const muchShorterDays = plan.longestDayMinutes <= baseFacts.longestTravelDayMinutes - 180;
  const betterArrival =
    (baseFacts.arrivalHour >= 23 || baseFacts.arrivalHour <= 5) &&
    plan.days.every((d) => localHour(d.arrival) < 23 && localHour(d.arrival) > 5);
  const fewerChanges = plan.changes < baseFacts.connections.filter((c) => !c.longWait).length;

  const improvements = [
    removesNight,
    satisfiesLimit,
    saferConnections,
    muchShorterDays,
    betterArrival,
    fewerChanges,
  ].filter(Boolean).length;

  // A stop the traveller asked for is always built, but still labelled honestly.
  if (improvements === 0 && !args.requested) return { confidence: "weak", tradeoff: null };

  const extraRatio = plan.addedTravelMinutes / Math.max(1, base.durationMinutes);
  const maxExtraRatio = style === "comfortable" ? 0.45 : style === "fastest" ? 0.15 : 0.3;
  if (extraRatio > maxExtraRatio && !args.requested) return { confidence: "weak", tradeoff: null };

  const hardestDay = plan.dayStats.reduce(
    (worst, d) => (d.windowMinutes > worst.windowMinutes ? d : worst),
    plan.dayStats[0]!,
  );
  const drawbacks: OvernightBenefit[] = [];
  if (hardestDay.burden === "veryLong" || hardestDay.burden === "extreme")
    drawbacks.push({
      key: "on.tradeoff.longDay",
      vars: { n: hardestDay.day, time: formatDuration(hardestDay.windowMinutes) },
    });
  if (plan.riskyConnections > 0) drawbacks.push({ key: "on.tradeoff.risky" });
  if (plan.restQuality === "poor") drawbacks.push({ key: "on.tradeoff.rest" });
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
  const longDayForgiven =
    removesNight &&
    (plan.longestDayMinutes <= baseFacts.longestTravelDayMinutes - 360 ||
      plan.longestDayMinutes <= base.durationMinutes / 2);
  const blocking = longDayForgiven
    ? drawbacks.filter((d) => d.key !== "on.tradeoff.longDay")
    : drawbacks;

  if (blocking.length === 0 && plan.score >= strongMin && improvements >= 1)
    return { confidence: "strong", tradeoff: null };

  // A plan can still be a useful alternative below the score threshold when
  // it delivers several real gains (typically: the night train disappears and
  // the longest travel day shrinks), as long as the drawbacks are stated.
  const clearGains =
    improvements >= 2 &&
    !plan.hasNightTravel &&
    plan.longestDayMinutes < baseFacts.longestTravelDayMinutes;

  if (plan.score >= altMin || clearGains || args.requested)
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
