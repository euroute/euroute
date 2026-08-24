/**
 * Server side of Smart Overnight (Phase 2).
 *
 * Day 1 is a real prefix of the continuous itinerary the traveller already
 * sees. Day 2 (and day 3) come from real onward searches against the
 * timetable source. Nothing is fabricated: if no onward service exists, the
 * candidate is dropped.
 *
 * API budget: candidates are pre-filtered in `splitCandidates` (no network),
 * then at most 3 onward searches per overnight level, and at most one extra
 * level (a second night) when the traveller's daily limit demands it.
 */

import type { Journey, Place } from "./journey";
import {
  journeyFacts,
  transitLegs,
  type JourneyPreferences,
  type TravelStyle,
} from "./journey-intelligence";
import {
  buildOvernightPlan,
  cityName,
  overnightConfidence,
  journeyPrefix,
  localHour,
  nextMorningIso,
  shouldConsiderOvernight,
  splitCandidates,
  type OvernightPlan,
  type SplitCandidate,
} from "./overnight";
import { planJourneys } from "./rail.server";
import type { UpstreamBudget } from "./abuse.server";

export type OvernightResult = {
  /** True when the continuous journey has signals worth investigating. */
  considered: boolean;
  /** Best split, only set when it is meaningfully better than continuous. */
  recommended: OvernightPlan | null;
  /** Up to two other genuinely good splits. */
  alternatives: OvernightPlan[];
  /** Daily travel limit the traveller asked for, in hours (null = none). */
  maxHoursPerDay: number | null;
  /** False when no realistic plan keeps every travel day under that limit. */
  maxPerDayAchievable: boolean;
  /** Longest travel day of the closest plan, in minutes (0 when no plans). */
  closestLongestDayMinutes: number;
  /** Set when the traveller named a city we could not build a journey around. */
  requestedStopUnavailable: string | null;
  /** How many distinct overnight cities were actually compared. */
  comparedCities: number;
};

const MORNING_SEARCH_HOUR = 6;
/**
 * Onward itineraries kept per candidate city. One timetable search returns
 * them all, so a higher number costs no extra API calls but lets the
 * overnight quality model pick a sensible morning departure instead of just
 * the fastest one.
 */
const MAX_DAY2_OPTIONS = 4;

/** Extra overnight cities we build with a dedicated day-1 search. */
const MAX_SEARCHED_CITIES = 2;

/**
 * Explicit API budget (Pre-Launch Fix 1, 3E). No user-controlled parameter can
 * raise these, so expansion is bounded and never recursive:
 * - at most MAX_LEVEL1_CANDIDATES overnight candidates, one onward search each
 * - at most MAX_LEVEL2_CANDIDATES extra searches for a second night
 * - at most MAX_OVERNIGHT_LEVELS nights (2), i.e. three travel days
 */
const MAX_LEVEL1_CANDIDATES = 6;
const MAX_LEVEL2_CANDIDATES = 2;
export const MAX_OVERNIGHT_LEVELS = 2;

async function onwardOptions(args: {
  fromPlace: string;
  fromName: string;
  to: Place;
  afterIso: string;
  prefs: JourneyPreferences;
  maxTransfers: number;
  budget?: UpstreamBudget | undefined;
}): Promise<Journey[]> {
  const journeys = await planJourneys({
    from: { place: args.fromPlace, name: args.fromName },
    to: args.to,
    via: [],
    departAt: nextMorningIso(args.afterIso, MORNING_SEARCH_HOUR),
    maxTransfers: args.maxTransfers,
    minTransferMinutes: args.prefs.minTransferMinutes,
    budget: args.budget,
  });

  return journeys
    .filter((j) => {
      const hour = localHour(j.departure);
      return hour >= 5 && hour <= 14;
    })
    .sort((a, b) => a.durationMinutes - b.durationMinutes)
    .slice(0, MAX_DAY2_OPTIONS);
}

/** Day-1 candidates for a stop the traveller named themselves. */
async function requestedCandidate(args: {
  from: Place;
  stop: Place;
  departAt: string;
  prefs: JourneyPreferences;
  maxTransfers: number;
  budget?: UpstreamBudget | undefined;
}): Promise<{ day1: Journey; candidate: SplitCandidate } | null> {
  const journeys = await planJourneys({
    from: args.from,
    to: args.stop,
    via: [],
    departAt: args.departAt,
    maxTransfers: args.maxTransfers,
    minTransferMinutes: args.prefs.minTransferMinutes,
    budget: args.budget,
  });

  const usable = journeys
    .filter((j) => {
      const hour = localHour(j.arrival);
      return hour >= 13 || hour <= 1;
    })
    .sort((a, b) => a.durationMinutes - b.durationMinutes);
  const day1 = usable[0] ?? journeys[0];
  if (!day1) return null;

  return {
    day1,
    candidate: {
      station: args.stop.name,
      place: args.stop.place,
      transitIndex: -1,
      arrival: day1.arrival,
      arrivalHour: localHour(day1.arrival),
      travelBeforeMinutes: day1.durationMinutes,
      travelAfterMinutes: 0,
      fitness: 0,
    },
  };
}

export async function planOvernightOptions(args: {
  base: Journey;
  from: Place;
  to: Place;
  departAt: string;
  preferences: JourneyPreferences;
  style: TravelStyle;
  requestedStop?: Place | null;
  maxTransfers: number;
  budget?: UpstreamBudget | undefined;
}): Promise<OvernightResult> {
  const { base, preferences: prefs, style } = args;
  const baseFacts = journeyFacts(base, prefs.minTransferMinutes);
  const requested = Boolean(args.requestedStop);

  const empty: OvernightResult = {
    considered: false,
    recommended: null,
    alternatives: [],
    maxHoursPerDay: prefs.maxTravelHoursPerDay,
    maxPerDayAchievable: true,
    closestLongestDayMinutes: 0,
    requestedStopUnavailable: null,
    comparedCities: 0,
  };

  const { consider } = shouldConsiderOvernight({
    journey: base,
    facts: baseFacts,
    preferences: prefs,
    style,
    requested,
  });
  if (!consider) return empty;

  const plans: OvernightPlan[] = [];

  // ---- Level 1: one overnight stop -------------------------------------
  type Leg1 = { day1: Journey; candidate: SplitCandidate };
  const level1: Leg1[] = [];

  if (args.requestedStop) {
    const built = await requestedCandidate({
      from: args.from,
      stop: args.requestedStop,
      departAt: args.departAt,
      prefs,
      maxTransfers: args.maxTransfers,
      budget: args.budget,
    });
    if (!built) {
      return { ...empty, considered: true, requestedStopUnavailable: args.requestedStop.name };
    }
    level1.push(built);
  } else {
    const limit = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
    const candidates = [...splitCandidates(base, 4)];
    // When the traveller set a daily limit, also look at split points that
    // keep day 1 inside that limit even if the arrival time is less ideal.
    if (limit !== null) {
      for (const extra of splitCandidates(base, 4, { maxDayMinutes: limit, relaxArrival: true })) {
        if (!candidates.some((c) => c.transitIndex === extra.transitIndex)) candidates.push(extra);
      }
    }
    for (const candidate of candidates) {
      level1.push({ day1: journeyPrefix(base, candidate.transitIndex), candidate });
    }

    // Cities on the route whose prefix arrival is at a poor hour (typical for
    // a base journey that runs through the night) are still worth comparing:
    // we build day 1 with one real search each so the arrival can be an
    // evening one. Capped so the API budget stays predictable.
    const covered = new Set(level1.map((l) => cityName(l.candidate.station).toLowerCase()));
    const transit = transitLegs(base);
    const extraCities = transit
      .slice(0, -1)
      .map((leg) => ({ name: leg.toName, place: leg.toPlace, arrival: leg.arrival }))
      .filter((c): c is { name: string; place: string; arrival: string } => Boolean(c.place))
      .filter((c) => {
        const before = Math.round(
          (new Date(c.arrival).getTime() - new Date(base.departure).getTime()) / 60000,
        );
        const after = base.durationMinutes - before;
        return before >= 240 && after >= 180 && !covered.has(cityName(c.name).toLowerCase());
      })
      .slice(0, MAX_SEARCHED_CITIES);

    for (const city of extraCities) {
      // Extra day-1 searches are the lowest-value exploration: skip them first.
      if (args.budget && args.budget.remaining() <= 3) break;
      const built = await requestedCandidate({
        from: args.from,
        stop: { name: city.name, place: city.place },
        departAt: args.departAt,
        prefs,
        maxTransfers: args.maxTransfers,
        budget: args.budget,
      });
      if (built) level1.push(built);
    }
  }

  // Hard ceiling on API expansion: each level-1 candidate costs exactly one
  // onward timetable search, so the number of candidates is the budget.
  if (level1.length > MAX_LEVEL1_CANDIDATES) level1.length = MAX_LEVEL1_CANDIDATES;

  if (level1.length === 0) return { ...empty, considered: true };

  // Number of distinct overnight cities we actually build and compare. Used
  // so the copy never claims a comparison that did not happen.
  const comparedCities = new Set(level1.map((l) => cityName(l.candidate.station))).size;

  for (const { day1, candidate } of level1) {
    // Never loop past the budget: keep the plans already built.
    if (args.budget && args.budget.remaining() <= 0 && plans.length > 0) break;
    const day2s = await onwardOptions({
      fromPlace: candidate.place,
      fromName: candidate.station,
      to: args.to,
      afterIso: day1.arrival,
      prefs,
      maxTransfers: args.maxTransfers,
      budget: args.budget,
    });

    for (const day2 of day2s) {
      plans.push(
        buildOvernightPlan({
          days: [day1, day2],
          stays: [
            {
              station: candidate.station,
              place: candidate.place,
              arrival: day1.arrival,
              departure: day2.departure,
            },
          ],
          base,
          baseFacts,
          preferences: prefs,
          comparedCities,
        }),
      );
    }
  }

  if (plans.length === 0) {
    return {
      ...empty,
      considered: true,
      requestedStopUnavailable: args.requestedStop?.name ?? null,
    };
  }

  // ---- Level 2: a second night, only when the daily limit demands it ----
  const limitMinutes = prefs.maxTravelHoursPerDay ? prefs.maxTravelHoursPerDay * 60 : null;
  const everyPlanExhausting = plans.every((p) =>
    p.dayStats.some((d) => d.burden === "veryLong" || d.burden === "extreme"),
  );
  if (
    (limitMinutes !== null && !plans.some((p) => p.meetsMaxPerDay)) ||
    (style === "comfortable" && everyPlanExhausting)
  ) {
    const bestSoFar = [...plans].sort((a, b) => b.score - a.score)[0]!;
    const longDay = bestSoFar.days[1]!;
    const relaxed = [
      ...splitCandidates(longDay, 2),
      ...splitCandidates(longDay, 2, { maxDayMinutes: limitMinutes, relaxArrival: true }),
    ].filter((c, i, all) => all.findIndex((o) => o.transitIndex === c.transitIndex) === i);
    for (const candidate of relaxed.slice(0, MAX_LEVEL2_CANDIDATES)) {
      if (args.budget && args.budget.remaining() <= 0) break;
      const dayA = journeyPrefix(longDay, candidate.transitIndex);
      const dayBs = await onwardOptions({
        fromPlace: candidate.place,
        fromName: candidate.station,
        to: args.to,
        afterIso: dayA.arrival,
        prefs,
        maxTransfers: args.maxTransfers,
        budget: args.budget,
      });
      const dayB = dayBs[0];
      if (!dayB) continue;
      plans.push(
        buildOvernightPlan({
          days: [bestSoFar.days[0]!, dayA, dayB],
          stays: [
            { ...bestSoFar.stays[0]! },
            {
              station: candidate.station,
              place: candidate.place,
              arrival: dayA.arrival,
              departure: dayB.departure,
            },
          ],
          base,
          baseFacts,
          preferences: prefs,
          comparedCities,
        }),
      );
    }
  }

  // Keep the strongest plan per overnight city, then rank by quality.
  const bestPerCity = new Map<string, OvernightPlan>();
  for (const plan of plans) {
    const key = plan.stays.map((s) => s.station.toLowerCase()).join("|");
    const existing = bestPerCity.get(key);
    if (!existing || plan.score > existing.score) bestPerCity.set(key, plan);
  }
  const ranked = Array.from(bestPerCity.values()).sort((a, b) => b.score - a.score);

  // When the traveller set a daily travel limit that no realistic plan can
  // meet, lead with the plan that comes closest instead of the highest score.
  if (limitMinutes !== null && !ranked.some((p) => p.meetsMaxPerDay)) {
    ranked.sort((a, b) => a.longestDayMinutes - b.longestDayMinutes || b.score - a.score);
  }

  const scored = ranked.map((plan) => {
    const { confidence, tradeoff } = overnightConfidence({
      plan,
      base,
      baseFacts,
      preferences: prefs,
      style,
      requested,
    });
    return { ...plan, confidence, tradeoff };
  });

  // Strong plans first, then useful alternatives, each by quality.
  const rank = (c: OvernightPlan["confidence"]) =>
    c === "strong" ? 0 : c === "alternative" ? 1 : 2;
  const worthwhile = scored
    .filter((p) => p.confidence !== "weak")
    .sort((a, b) => rank(a.confidence) - rank(b.confidence) || b.score - a.score);

  const closest = ranked.reduce(
    (min, p) => Math.min(min, p.longestDayMinutes),
    Number.POSITIVE_INFINITY,
  );

  return {
    considered: true,
    recommended: worthwhile[0] ?? null,
    alternatives: worthwhile.slice(1, 3),
    maxHoursPerDay: prefs.maxTravelHoursPerDay,
    maxPerDayAchievable: limitMinutes === null || ranked.some((p) => p.meetsMaxPerDay),
    closestLongestDayMinutes: Number.isFinite(closest) ? closest : 0,
    requestedStopUnavailable: null,
    comparedCities,
  };
}
