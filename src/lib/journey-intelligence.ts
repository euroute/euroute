/**
 * Euroute journey intelligence (Phase 1). Client-safe, pure and deterministic.
 *
 * Pipeline (see `analyseJourneys`):
 *   raw journeys → validate → evaluate connections → connection risk
 *   → apply preferences → Euroute Score → deduplicate → journey types → rank
 *
 * DATA INTEGRITY
 * --------------
 * Everything here is derived from data the timetable source (Transitous /
 * MOTIS 2) actually returns: times, durations, station names, modes and
 * operators. We never invent prices, delays, historical reliability,
 * platforms or scenic attributes. Where a signal is unavailable
 * (price, scenic value, delay statistics) the corresponding feature is
 * reported as unavailable rather than estimated.
 */

import {
  normalizeStationName,
  parseCoords,
  type StationIdentityInput,
} from "./station-identity";
import {
  WALKABLE_METERS,
  classifyStationRelation,
  type StationRelation,
} from "./station-relation";
import { formatDuration, transferMinutes, type Journey, type Leg } from "./journey";
import { dedupePassengerJourneys } from "./journey-dedupe";
import { MIN_USABLE_JOURNEYS } from "./journey-limits";
import { journeyHasNightTrain } from "./night-train";

/* ------------------------------------------------------------------ *
 * Travel style & preferences
 * ------------------------------------------------------------------ */

export const TRAVEL_STYLES = [
  "recommended",
  "fastest",
  "comfortable",
  "scenic",
  "cheapest",
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number];

/**
 * Styles we cannot support with the current data source.
 * Scenic needs a curated/route-geometry dataset, cheapest needs comparable
 * fares. Neither exists in the timetable feed, so the styles stay in the
 * architecture but are surfaced as unavailable.
 */
export const UNAVAILABLE_STYLES: TravelStyle[] = ["scenic", "cheapest"];

/** Styles shown in the UI as one simple control. */
export const VISIBLE_STYLES: TravelStyle[] = ["recommended", "fastest", "comfortable"];

export function isStyleAvailable(style: TravelStyle): boolean {
  return !UNAVAILABLE_STYLES.includes(style);
}

export type JourneyPreferences = {
  /** Minimum connection time in minutes (single source of truth). */
  minTransferMinutes: number;
  /** null = any number of changes */
  maxTransfers: number | null;
  avoidNightTrains: boolean;
  avoidOvernightTravel: boolean;
  avoidStationChange: boolean;
  preferDirect: boolean;
  preferHighSpeed: boolean;
  avoidBuses: boolean;
  /** Maximum hours of travel per calendar day, null = no limit. */
  maxTravelHoursPerDay: number | null;
  /** Architecture hook for a later phase – not used for ranking yet. */
  allowOvernightStop: boolean;
};

export const DEFAULT_PREFERENCES: JourneyPreferences = {
  minTransferMinutes: 15,
  maxTransfers: null,
  avoidNightTrains: false,
  avoidOvernightTravel: false,
  avoidStationChange: false,
  preferDirect: false,
  preferHighSpeed: false,
  avoidBuses: false,
  maxTravelHoursPerDay: null,
  allowOvernightStop: false,
};

/* ------------------------------------------------------------------ *
 * Connection evaluation
 * ------------------------------------------------------------------ */

export type ConnectionRiskLevel = "comfortable" | "tight" | "risky";

export type Connection = {
  /** Index of the arriving transit leg. */
  index: number;
  arriveStation: string;
  departStation: string;
  /**
   * True only for a genuine change between separate stations (Phase 3):
   * DIFFERENT_STATION, or UNCERTAIN with differing station names (the
   * conservative pre-Phase-3 fallback).
   */
  stationChange: boolean;
  /**
   * Physical relation between the arriving and departing stop, from the shared
   * station-relation classifier. Derived at view/scoring time, so old saved
   * snapshots without stop ids fall back to names and coordinates.
   */
  stationRelation: StationRelation;
  /** True for SAME_COMPLEX / CONNECTED_COMPLEX – one station complex, two names. */
  sameComplex: boolean;
  /** True when the two stop names differ after canonical normalisation. */
  namesDiffer: boolean;
  /** True when the operator differs between the two legs. */
  operatorChange: boolean;
  minutes: number;
  /**
   * Phase F4A: minutes of movement the timetable source explicitly modelled
   * between the two transit legs (access/walk legs inside the gap). 0 when the
   * source models no movement at all.
   */
  accessMinutes: number;
  /**
   * Phase F4A: the timetable source explicitly modelled the movement between
   * the two stops, that movement fits inside the gap the itinerary offers, and
   * the two stops are not a genuine separate-station change. In other words the
   * interchange is a planned movement inside/through one station complex whose
   * cost is already accounted for in the itinerary timeline.
   */
  plannedAccess: boolean;
  /** Minutes we consider a safe margin for this specific connection. */
  recommendedMinutes: number;
  level: ConnectionRiskLevel;
  /** Very long stop between legs (3 h or more) – a wait, not a change. */
  longWait: boolean;
};


const HIGH_SPEED_MODES = new Set(["HIGHSPEED_RAIL", "LONG_DISTANCE", "NIGHT_RAIL"]);


/** A connection this long is a wait, not a change. */
const LONG_WAIT_MINUTES = 180;

/* ------------------------------------------------------------------ *
 * Relation-aware margin supplements (Phase 3)
 * ------------------------------------------------------------------ *
 * Named, explicit and additive on top of the unchanged base margin:
 * - SAME_STATION: nothing extra; the traveller stays inside one station.
 * - SAME_COMPLEX: +5, two names for one complex still means walking between
 *   halls/levels (e.g. Paris-Nord ↔ Gare du Nord).
 * - CONNECTED_COMPLEX: +10, two adjacent buildings joined on foot – more than
 *   an internal walk, clearly less than crossing a city.
 * - DIFFERENT_STATION / conservative UNCERTAIN: +15, the pre-existing
 *   cross-city station-change supplement (unchanged).
 */
export const SAME_COMPLEX_MARGIN_MINUTES = 5;
export const CONNECTED_COMPLEX_MARGIN_MINUTES = 10;
export const STATION_CHANGE_MARGIN_MINUTES = 15;

/** Station identity input for the alighting stop of a leg. */
function arrivalIdentity(leg: Leg): StationIdentityInput {
  const coords = parseCoords(leg.toPlace);
  return {
    name: leg.toName,
    lat: coords?.lat,
    lon: coords?.lon,
    stopId: leg.toStopId,
    parentId: leg.toParentId,
    level: leg.toLevel,
  };
}

/** Station identity input for the boarding stop of a leg. */
function departureIdentity(leg: Leg): StationIdentityInput {
  const coords = parseCoords(leg.fromPlace);
  return {
    name: leg.fromName,
    lat: coords?.lat,
    lon: coords?.lon,
    stopId: leg.fromStopId,
    parentId: leg.fromParentId,
    level: leg.fromLevel,
  };
}

/* ------------------------------------------------------------------ *
 * Explicit access movement (Phase F4A)
 * ------------------------------------------------------------------ *
 * Timetable sources model the movement between two stops of an interchange as
 * explicit access (walk) legs inside the gap. Those legs are journey facts, not
 * assumptions: they say how much movement the source itself accounted for, and
 * therefore how much of the gap is already spent.
 *
 * Euroute uses them as evidence only when they are internally consistent with
 * the itinerary (they lie inside the gap and fit in it) and the two stops are
 * not a genuine separate-station change. Then the relation-derived *guess* of
 * walking time is replaced by the source's own figure, instead of being added
 * on top of a movement the timeline already contains.
 */

export type ConnectionAccess = {
  /** Explicit access minutes the source modelled between the two transit legs. */
  minutes: number;
  /** Number of explicit access legs found in the gap. */
  legCount: number;
  /** The modelled movement lies inside the gap and fits in it. */
  fits: boolean;
};

const NO_ACCESS: ConnectionAccess = { minutes: 0, legCount: 0, fits: false };

/** Explicit access legs strictly between two transit legs of one itinerary. */
export function connectionAccess(
  legs: Leg[],
  fromIndex: number,
  toIndex: number,
  gapMinutes: number,
): ConnectionAccess {
  const prev = legs[fromIndex];
  const next = legs[toIndex];
  if (!prev || !next || toIndex <= fromIndex) return NO_ACCESS;
  const gapStart = new Date(prev.arrival).getTime();
  const gapEnd = new Date(next.departure).getTime();
  let minutes = 0;
  let legCount = 0;
  let inside = true;
  for (let i = fromIndex + 1; i < toIndex; i += 1) {
    const leg = legs[i]!;
    if (leg.kind !== "walk") continue;
    legCount += 1;
    minutes += Math.max(0, leg.durationMinutes);
    const start = new Date(leg.departure).getTime();
    const end = new Date(leg.arrival).getTime();
    if (!(Number.isFinite(start) && Number.isFinite(end) && start >= gapStart && end <= gapEnd)) {
      inside = false;
    }
  }
  if (legCount === 0) return NO_ACCESS;
  return { minutes, legCount, fits: inside && minutes <= gapMinutes && gapMinutes >= 0 };
}

/** Relation-derived facts for one connection. */
type RelationFacts = {
  relation: StationRelation;
  stationChange: boolean;
  sameComplex: boolean;
  namesDiffer: boolean;
  /** Extra minutes the relation adds to the recommended margin. */
  marginSupplement: number;
  /** Explicit, fitting, in-complex access movement (Phase F4A). */
  plannedAccess: boolean;
  accessMinutes: number;
};

function relationSupplement(relation: StationRelation, namesDiffer: boolean): number {
  switch (relation) {
    case "SAME_STATION":
      return 0;
    case "SAME_COMPLEX":
      return SAME_COMPLEX_MARGIN_MINUTES;
    case "CONNECTED_COMPLEX":
      return CONNECTED_COMPLEX_MARGIN_MINUTES;
    case "DIFFERENT_STATION":
      return STATION_CHANGE_MARGIN_MINUTES;
    default:
      // UNCERTAIN: keep exactly the pre-Phase-3, name-only behaviour.
      return namesDiffer ? STATION_CHANGE_MARGIN_MINUTES : 0;
  }
}

function relationFacts(prev: Leg, next: Leg, access: ConnectionAccess): RelationFacts {
  const result = classifyStationRelation(arrivalIdentity(prev), departureIdentity(next));
  const relation = result.relation;
  const namesDiffer = normalizeStationName(prev.toName) !== normalizeStationName(next.fromName);
  const supplement = relationSupplement(relation, namesDiffer);
  const stationChange =
    relation === "DIFFERENT_STATION" || (relation === "UNCERTAIN" && namesDiffer);
  const sameComplex = relation === "SAME_COMPLEX" || relation === "CONNECTED_COMPLEX";

  // Explicit movement is only evidence when it fits and the stops are not a
  // genuine separate-station change: a fitting walk between stops that far
  // apart would be data we cannot trust.
  const withinWalkingDistance =
    result.distanceMeters === undefined || result.distanceMeters <= WALKABLE_METERS;
  const plannedAccess =
    access.fits && relation !== "DIFFERENT_STATION" && withinWalkingDistance;

  return {
    relation,
    stationChange,
    sameComplex,
    namesDiffer,
    plannedAccess,
    accessMinutes: access.minutes,
    // Known movement replaces the relation's guess. When the movement is not
    // usable as evidence, the pre-F4A supplement stands, and a longer explicit
    // walk is never discounted.
    marginSupplement: plannedAccess
      ? access.minutes
      : access.fits
        ? Math.max(supplement, access.minutes)
        : supplement,
  };
}

/**
 * Recommended safe margin for one connection, built only from known facts:
 *   base 10 min in a station
 *   +5  operator change (separate ticket, no through-protection guaranteed)
 *   +5  long-distance/high-speed arrival or departure (bigger stations)
 *   + movement supplement: the source's own explicit access minutes when it
 *     provided them for an in-complex interchange, otherwise the relation
 *     supplement (0 / 5 / 10 / 15, see the constants above)
 * The result is never below the traveller's own minimum connection time.
 */
function recommendedMargin(prev: Leg, next: Leg, userMinimum: number, facts: RelationFacts): number {
  let minutes = 10;
  if (prev.operator && next.operator && prev.operator !== next.operator) minutes += 5;
  if (HIGH_SPEED_MODES.has(prev.mode) || HIGH_SPEED_MODES.has(next.mode)) minutes += 5;
  minutes += facts.marginSupplement;
  return Math.max(minutes, userMinimum);
}

function riskLevel(minutes: number, recommended: number): ConnectionRiskLevel {
  if (minutes >= recommended) return "comfortable";
  if (minutes >= Math.round(recommended * 0.6)) return "tight";
  return "risky";
}

export function transitLegs(journey: Journey): Leg[] {
  return journey.legs.filter((leg) => leg.kind !== "walk");
}

export function evaluateConnections(journey: Journey, userMinimum: number): Connection[] {
  const transitIndices = journey.legs
    .map((leg, index) => ({ leg, index }))
    .filter((entry) => entry.leg.kind !== "walk");
  const gaps = transferMinutes(journey);
  const connections: Connection[] = [];

  for (let i = 1; i < transitIndices.length; i += 1) {
    const prevEntry = transitIndices[i - 1]!;
    const nextEntry = transitIndices[i]!;
    const prev = prevEntry.leg;
    const next = nextEntry.leg;
    const minutes = gaps[i - 1] ?? 0;
    const access = connectionAccess(journey.legs, prevEntry.index, nextEntry.index, minutes);
    const relation = relationFacts(prev, next, access);
    const recommended = recommendedMargin(prev, next, userMinimum, relation);
    connections.push({
      index: i,
      arriveStation: prev.toName,
      departStation: next.fromName,
      stationChange: relation.stationChange,
      stationRelation: relation.relation,
      sameComplex: relation.sameComplex,
      namesDiffer: relation.namesDiffer,
      operatorChange: Boolean(prev.operator && next.operator && prev.operator !== next.operator),
      minutes,
      accessMinutes: relation.accessMinutes,
      plannedAccess: relation.plannedAccess,
      recommendedMinutes: recommended,
      level: riskLevel(minutes, recommended),
      longWait: minutes >= LONG_WAIT_MINUTES,
    });
  }

  return connections;
}



/* ------------------------------------------------------------------ *
 * Journey facts
 * ------------------------------------------------------------------ */

export type JourneyFacts = {
  connections: Connection[];
  worstConnection: ConnectionRiskLevel | null;
  stationChanges: number;
  hasBusLeg: boolean;
  hasNightTrain: boolean;
  /** Travel that crosses local midnight (a genuine overnight journey). */
  overnight: boolean;
  hasHighSpeed: boolean;
  /** Longest amount of travel within one calendar day, in minutes. */
  longestTravelDayMinutes: number;
  /** Distinct operators on transit legs. */
  operatorCount: number;
  /** Total minutes spent waiting in long stops (3 h or more). */
  longWaitMinutes: number;
  /** Local hour of departure / arrival (Europe/Stockholm), for later phases. */
  departureHour: number;
  arrivalHour: number;
  /**
   * Stations where the journey could reasonably be split into an overnight
   * stop: long waits, or a change that happens late in the evening.
   * Exposed for a later phase — not used for ranking or shown in the UI yet.
   */
  overnightStopCandidates: string[];
  /** Price data is not available from the timetable source. */
  priceAvailable: false;
  /** Scenic data is not available from the timetable source. */
  scenicAvailable: false;
};

function localDayKey(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function localHour(iso: string): number {
  return Number(
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(iso)),
  );
}

function crossesNight(journey: Journey): boolean {
  return localDayKey(journey.departure) !== localDayKey(journey.arrival);
}

export function journeyFacts(journey: Journey, userMinimum: number): JourneyFacts {
  const transit = transitLegs(journey);
  const connections = evaluateConnections(journey, userMinimum);

  const perDay = new Map<string, number>();
  for (const leg of transit) {
    const key = localDayKey(leg.departure);
    perDay.set(key, (perDay.get(key) ?? 0) + leg.durationMinutes);
  }

  const worst: ConnectionRiskLevel | null = connections.length
    ? connections.some((c) => c.level === "risky")
      ? "risky"
      : connections.some((c) => c.level === "tight")
        ? "tight"
        : "comfortable"
    : null;

  const candidates = connections
    .filter((c) => {
      if (c.longWait) return true;
      const arriveIso = transit[c.index - 1]?.arrival;
      return arriveIso ? localHour(arriveIso) >= 21 : false;
    })
    .map((c) => c.arriveStation);

  return {
    connections,
    worstConnection: worst,
    stationChanges: connections.filter((c) => c.stationChange).length,
    hasBusLeg: transit.some((leg) => leg.kind === "bus"),
    hasNightTrain: journeyHasNightTrain(journey),
    overnight: crossesNight(journey),
    hasHighSpeed: transit.some((leg) => leg.mode === "HIGHSPEED_RAIL"),
    longestTravelDayMinutes: perDay.size ? Math.max(...perDay.values()) : journey.durationMinutes,
    operatorCount: journey.operators.length,
    longWaitMinutes: connections.filter((c) => c.longWait).reduce((sum, c) => sum + c.minutes, 0),
    departureHour: localHour(journey.departure),
    arrivalHour: localHour(journey.arrival),
    overnightStopCandidates: candidates,
    priceAvailable: false,
    scenicAvailable: false,
  };
}

/* ------------------------------------------------------------------ *
 * Euroute Score (hybrid model)
 * ------------------------------------------------------------------ *
 *
 * The score answers: how good is this journey compared with realistic
 * train journeys for THIS search and THIS traveller's preferences?
 *
 * It mixes an absolute part (connection quality, simplicity, comfort,
 * preference fit — the same for every search) with a relative part
 * (travel time and number of changes compared with the best realistic
 * option in the same search).
 *
 *   Travel time      max 30  – relative to the fastest option
 *   Changes          max 20  – compared with what the distance requires
 *   Connections      max 25  – comfortable 25, tight −6, risky −12, wait −4
 *   Simplicity       max 10  – station changes, bus legs, operator count
 *   Day comfort      max 10  – overnight travel and very long travel days
 *   Preference fit   ±10     – how well it matches the traveller's toggles
 *   Extreme detour   −35..0  – journeys far longer than the fastest option
 *
 * Total is clamped to 0–100. A high score means "genuinely good", not
 * "best of a bad set": 85+ strong, 70–84 good, 50–69 usable with
 * drawbacks, below 50 poor. Rank and score are separate — a low-scoring
 * journey can still be the top result if nothing better exists.
 */

export type Highlight = {
  tone: "good" | "warn";
  key: string;
  vars?: Record<string, string | number>;
};

export type ScoreBreakdown = {
  time: number;
  changes: number;
  connections: number;
  simplicity: number;
  dayComfort: number;
  preferenceFit: number;
  /** Negative penalty for journeys far longer than the fastest option. */
  extreme: number;
};

export type ScoredJourney = {
  journey: Journey;
  facts: JourneyFacts;
  usability: JourneyUsability;
  score: number;
  breakdown: ScoreBreakdown;
  highlights: Highlight[];
  /** True when the journey breaks a hard preference (kept, but ranked down). */
  violatesPreferences: boolean;
};

/* ------------------------------------------------------------------ *
 * Absolute journey usability
 * ------------------------------------------------------------------ *
 *
 * Risk labels and usability are intentionally different product decisions:
 * a 19/20-minute connection should remain visible as tight, while a 2/30-minute
 * station change should not be presented as a bookable Euroute option.
 *
 * The floor is derived from the already computed recommended margin and only
 * removes the clearest impossible cases: under 25% of the required margin AND
 * five minutes or less available. It is generic, station-independent and keeps
 * ordinary shortfalls in the normal ranking pipeline.
 */

export type JourneyUsabilityReason = "implausibleConnection" | "pathologicalDeadTime";

export type JourneyUsability = {
  usable: boolean;
  reasons: JourneyUsabilityReason[];
  worstConnection?: Connection | undefined;
};

export const CONNECTION_PLAUSIBILITY_RATIO_FLOOR = 0.25;
export const CONNECTION_PLAUSIBILITY_ABSOLUTE_FLOOR_MINUTES = 5;

export const PATHOLOGICAL_LONGEST_WAIT_MINUTES = 12 * 60;
export const PATHOLOGICAL_TOTAL_WAIT_MINUTES = 12 * 60;
export const PATHOLOGICAL_RELATIVE_DURATION_RATIO = 1.35;
export const EXTREME_LONGEST_WAIT_MINUTES = 18 * 60;
export const EXTREME_TOTAL_WAIT_MINUTES = 18 * 60;
export const EXTREME_RELATIVE_DURATION_RATIO = 1.75;
export const MATERIAL_DEAD_TIME_MINUTES = 8 * 60;

/**
 * Phase F4E — minimal ABSOLUTE dead-time guard.
 *
 * The F1.5 rules above are almost entirely relative: on a corridor where every
 * option is long, the elapsed-ratio denominator rises and a candidate made
 * mostly of waiting survives. These three route-independent quantities identify
 * that extreme tail candidate without any elapsed-ratio, time-of-day, route,
 * station or operator condition.
 *
 * Identification alone never removes a journey: removal is decided at pool
 * level by the survivor guard in `preAnalyseJourneys`.
 */
export const EXTREME_ABSOLUTE_LONGEST_WAIT_MINUTES = 10 * 60;
export const EXTREME_ABSOLUTE_TOTAL_WAIT_MINUTES = 10 * 60;
export const EXTREME_ABSOLUTE_WAIT_SHARE = 0.35;

export type JourneyDeadTimeMetrics = {
  elapsedMinutes: number;
  onboardMinutes: number;
  totalWaitMinutes: number;
  longestWaitMinutes: number;
  waitShare: number;
  elapsedRatioToBest: number | null;
  longestWaitIsOvernight: boolean;
};

function isImplausibleConnection(connection: Connection): boolean {
  if (connection.longWait) return false;
  if (connection.recommendedMinutes <= 0) return false;
  // Phase F4A: the physical floor exists for movement the itinerary does NOT
  // account for. When the timetable source itself modelled the movement between
  // the two stops of one station complex, and that movement fits inside the gap
  // it published, the interchange is not physically impossible – it stays in
  // the pipeline and remains visible as tight or risky.
  if (connection.plannedAccess) return false;
  return (
    connection.minutes <= CONNECTION_PLAUSIBILITY_ABSOLUTE_FLOOR_MINUTES &&
    connection.minutes / connection.recommendedMinutes < CONNECTION_PLAUSIBILITY_RATIO_FLOOR
  );
}


export function evaluateJourneyUsability(connections: Connection[]): JourneyUsability {
  const implausible = connections.filter(isImplausibleConnection);
  const worstConnection = implausible.sort((a, b) => {
    const ratioA = a.recommendedMinutes > 0 ? a.minutes / a.recommendedMinutes : 1;
    const ratioB = b.recommendedMinutes > 0 ? b.minutes / b.recommendedMinutes : 1;
    return ratioA - ratioB || a.minutes - b.minutes || b.recommendedMinutes - a.recommendedMinutes;
  })[0];

  if (!worstConnection) return { usable: true, reasons: [] };
  return { usable: false, reasons: ["implausibleConnection"], worstConnection };
}

function waitSpansOvernight(arrival: string | undefined, departure: string | undefined): boolean {
  if (!arrival || !departure) return false;
  return localDayKey(arrival) !== localDayKey(departure) || localHour(arrival) >= 20 || localHour(departure) <= 6;
}

export function journeyDeadTimeMetrics(
  journey: Journey,
  facts: JourneyFacts,
  bestElapsedMinutes: number | null,
): JourneyDeadTimeMetrics {
  const transit = transitLegs(journey);
  const waits = facts.connections.filter((connection) => connection.minutes > 0);
  const totalWaitMinutes = waits.reduce((sum, connection) => sum + connection.minutes, 0);
  const longest = waits.reduce<Connection | null>(
    (current, connection) => (!current || connection.minutes > current.minutes ? connection : current),
    null,
  );
  const onboardMinutes = transit.reduce((sum, leg) => sum + Math.max(0, leg.durationMinutes), 0);
  const elapsed = elapsedMinutes(journey);
  const elapsedRatioToBest = bestElapsedMinutes && bestElapsedMinutes > 0 ? elapsed / bestElapsedMinutes : null;

  return {
    elapsedMinutes: elapsed,
    onboardMinutes,
    totalWaitMinutes,
    longestWaitMinutes: longest?.minutes ?? 0,
    waitShare: elapsed > 0 ? totalWaitMinutes / elapsed : 0,
    elapsedRatioToBest,
    longestWaitIsOvernight: longest
      ? waitSpansOvernight(transit[longest.index - 1]?.arrival, transit[longest.index]?.departure)
      : false,
  };
}

function isPathologicalDeadTime(metrics: JourneyDeadTimeMetrics): boolean {
  const hasExtremeStandaloneDeadTime =
    metrics.longestWaitMinutes >= EXTREME_LONGEST_WAIT_MINUTES &&
    metrics.totalWaitMinutes >= EXTREME_TOTAL_WAIT_MINUTES &&
    metrics.waitShare >= 0.25;
  if (hasExtremeStandaloneDeadTime) return true;

  const ratio = metrics.elapsedRatioToBest;
  if (ratio === null) return false;

  const hasLongDeadTime =
    metrics.longestWaitMinutes >= PATHOLOGICAL_LONGEST_WAIT_MINUTES &&
    metrics.totalWaitMinutes >= PATHOLOGICAL_TOTAL_WAIT_MINUTES;
  if (hasLongDeadTime && ratio >= PATHOLOGICAL_RELATIVE_DURATION_RATIO) return true;

  const hasMaterialDeadTime =
    metrics.totalWaitMinutes >= MATERIAL_DEAD_TIME_MINUTES &&
    metrics.longestWaitMinutes >= LONG_WAIT_MINUTES * 2 &&
    metrics.waitShare >= 0.25;
  return hasMaterialDeadTime && ratio >= EXTREME_RELATIVE_DURATION_RATIO;
}

export function evaluateJourneyDeadTimeUsability(
  journey: Journey,
  facts: JourneyFacts,
  bestElapsedMinutes: number | null,
): JourneyUsability {
  const metrics = journeyDeadTimeMetrics(journey, facts, bestElapsedMinutes);
  if (!isPathologicalDeadTime(metrics)) return { usable: true, reasons: [] };
  return { usable: false, reasons: ["pathologicalDeadTime"] };
}

/**
 * Phase F4E identification predicate. Pure, per-journey, pool-independent:
 * it answers "is this candidate made mostly of one enormous block of waiting",
 * never "should it be removed".
 */
export function isExtremeAbsoluteDeadTime(metrics: JourneyDeadTimeMetrics): boolean {
  return (
    metrics.longestWaitMinutes >= EXTREME_ABSOLUTE_LONGEST_WAIT_MINUTES &&
    metrics.totalWaitMinutes >= EXTREME_ABSOLUTE_TOTAL_WAIT_MINUTES &&
    metrics.waitShare >= EXTREME_ABSOLUTE_WAIT_SHARE
  );
}

/**
 * Deterministic worst-dead-time-first ordering used when more candidates
 * qualify than the survivor guard may remove: highest wait share, then total
 * wait, then longest wait, then longest elapsed, then journey id.
 */
function compareDeadTimeBurden(
  a: { journey: Journey; metrics: JourneyDeadTimeMetrics },
  b: { journey: Journey; metrics: JourneyDeadTimeMetrics },
): number {
  return (
    b.metrics.waitShare - a.metrics.waitShare ||
    b.metrics.totalWaitMinutes - a.metrics.totalWaitMinutes ||
    b.metrics.longestWaitMinutes - a.metrics.longestWaitMinutes ||
    b.metrics.elapsedMinutes - a.metrics.elapsedMinutes ||
    String(a.journey.id).localeCompare(String(b.journey.id))
  );
}


/* ------------------------------------------------------------------ *
 * Shared pre-analysis (Phase F3)
 * ------------------------------------------------------------------ *
 * The single implementation of "which journeys may a traveller actually
 * use": validation, passenger-visible dedupe (F2.5), the Phase E connection
 * floor and the F1.5 dead-time gate. `analyseJourneys` builds on it, and the
 * retrieval layer reuses it to decide whether the first timetable page gave a
 * sufficient usable pool. There is deliberately no second implementation of
 * these gates anywhere else.
 */

export type PreAnalysedJourney = {
  journey: Journey;
  facts: JourneyFacts;
  usability: JourneyUsability;
};

export type JourneyPreAnalysis = {
  /** Passenger-usable journeys, in input order. */
  usable: PreAnalysedJourney[];
  /** Valid but rejected by Phase E or the F1.5 dead-time gate. */
  unusable: PreAnalysedJourney[];
  /** Journeys collapsed as passenger-identical duplicates of a kept journey. */
  duplicates: Journey[];
  /** Journeys without usable times or transit legs. */
  invalid: Journey[];
};

export function preAnalyseJourneys(
  journeys: Journey[],
  minTransferMinutes: number,
): JourneyPreAnalysis {
  const invalid: Journey[] = [];
  const validRaw = journeys.filter((j) => {
    const ok =
      Boolean(j.departure) && Boolean(j.arrival) && Number.isFinite(j.durationMinutes) &&
      transitLegs(j).length > 0;
    if (!ok) invalid.push(j);
    return ok;
  });

  const deduped = dedupePassengerJourneys(validRaw.map((journey) => ({ journey })));
  const duplicates = deduped.removed.map((item) => item.journey);

  const evaluated = deduped.kept.map(({ journey }) => {
    const facts = journeyFacts(journey, minTransferMinutes);
    return { journey, facts, usability: evaluateJourneyUsability(facts.connections) };
  });

  const connectionUsable = evaluated.filter((item) => item.usability.usable);
  const bestReferenceMinutes = connectionUsable.length
    ? Math.min(...connectionUsable.map((item) => elapsedMinutes(item.journey)))
    : null;

  const gated = evaluated.map((item) => {
    if (!item.usability.usable) return item;
    const deadTimeUsability = evaluateJourneyDeadTimeUsability(
      item.journey,
      item.facts,
      bestReferenceMinutes,
    );
    return deadTimeUsability.usable ? item : { ...item, usability: deadTimeUsability };
  });

  /* Phase F4E — absolute extreme-dead-time survivor filter.
   *
   * STEP A: the baseline usable pool is `gated`, i.e. everything the existing
   * rules already accept (validate → F2.5 dedupe → Phase E → F1.5). Nothing
   * above this line changed.
   *
   * STEP B: identify qualifying journeys independently of one another and of
   * input order, from the metrics F1.5 already computes.
   *
   * STEP C: apply the survivor guard against that fixed baseline count, never
   * against a count mutated while iterating. At most
   * `baselineUsableCount - MIN_USABLE_JOURNEYS` journeys may be removed, taken
   * worst-dead-time-first, so the outcome depends only on the set of
   * candidates and never on the order they arrived in.
   */
  const baselineUsable = gated.filter((item) => item.usability.usable);
  const qualifying = baselineUsable
    .map((item) => ({
      item,
      journey: item.journey,
      metrics: journeyDeadTimeMetrics(item.journey, item.facts, bestReferenceMinutes),
    }))
    .filter((entry) => isExtremeAbsoluteDeadTime(entry.metrics));

  const removableCount = Math.max(0, baselineUsable.length - MIN_USABLE_JOURNEYS);
  const removedIds = new Set(
    [...qualifying]
      .sort(compareDeadTimeBurden)
      .slice(0, removableCount)
      .map((entry) => entry.journey.id),
  );

  const final = removedIds.size
    ? gated.map((item) =>
        item.usability.usable && removedIds.has(item.journey.id)
          ? { ...item, usability: { usable: false, reasons: ["pathologicalDeadTime" as const] } }
          : item,
      )
    : gated;

  return {
    usable: final.filter((item) => item.usability.usable),
    unusable: final.filter((item) => !item.usability.usable),
    duplicates,
    invalid,
  };
}


/** Changes a journey of this length can reasonably be expected to need. */
function expectedChanges(durationMinutes: number): number {
  return Math.max(1, Math.round(durationMinutes / 300));
}

function scoreJourney(
  journey: Journey,
  facts: JourneyFacts,
  fastestMinutes: number,
  prefs: JourneyPreferences,
): { score: number; breakdown: ScoreBreakdown; highlights: Highlight[]; violates: boolean } {
  const highlights: Highlight[] = [];

  // Travel time, relative to the fastest journey in the same search.
  const ratio = fastestMinutes > 0 ? journey.durationMinutes / fastestMinutes : 1;
  const time = Math.max(0, Math.round(30 - (ratio - 1) * 45));

  // Changes, compared with what a journey of this length normally needs.
  const excess = Math.max(0, journey.transfers - expectedChanges(journey.durationMinutes));
  const changes = Math.max(0, 20 - excess * 7);
  if (journey.transfers === 0) highlights.push({ tone: "good", key: "hl.direct" });
  else if (journey.transfers <= 2)
    highlights.push({ tone: "good", key: "hl.fewChanges", vars: { n: journey.transfers } });

  // Connection quality — the strongest quality signal we have.
  const tight = facts.connections.filter((c) => c.level === "tight" && !c.longWait);
  const risky = facts.connections.filter((c) => c.level === "risky" && !c.longWait);
  const longWaits = facts.connections.filter((c) => c.longWait);
  const connections = Math.max(0, 25 - tight.length * 6 - risky.length * 12 - longWaits.length * 4);
  if (facts.connections.length > 0 && tight.length === 0 && risky.length === 0)
    highlights.push({ tone: "good", key: "hl.comfortableConnections" });
  for (const c of risky)
    highlights.push({
      tone: "warn",
      key: "hl.riskyAt",
      vars: { station: c.arriveStation, min: c.minutes },
    });
  for (const c of tight)
    highlights.push({
      tone: "warn",
      key: "hl.tightAt",
      vars: { station: c.arriveStation, min: c.minutes },
    });
  for (const c of longWaits)
    highlights.push({
      tone: "warn",
      key: "hl.longWaitAt",
      vars: { station: c.arriveStation, time: formatDuration(c.minutes) },
    });

  // Simplicity.
  let simplicity = 10;
  if (facts.stationChanges > 0) {
    simplicity -= Math.min(6, facts.stationChanges * 4);
    highlights.push(
      facts.stationChanges === 1
        ? { tone: "warn", key: "hl.stationChange1" }
        : { tone: "warn", key: "hl.stationChanges", vars: { n: facts.stationChanges } },
    );
  } else if (facts.connections.length > 0) {
    highlights.push({ tone: "good", key: "hl.noStationChange" });
  }
  if (facts.hasBusLeg) {
    simplicity -= 4;
    highlights.push({ tone: "warn", key: "hl.hasBus" });
  }
  if (facts.operatorCount > 3) simplicity -= 2;
  simplicity = Math.max(0, simplicity);

  // Day comfort.
  let dayComfort = 10;
  if (facts.hasNightTrain) {
    highlights.push({ tone: "good", key: "hl.nightTrain" });
  } else if (facts.overnight) {
    dayComfort -= 4;
    highlights.push({ tone: "warn", key: "hl.overnight" });
  } else {
    highlights.push({ tone: "good", key: "hl.dayTrains" });
  }
  if (facts.longestTravelDayMinutes > 720) dayComfort -= 3;
  dayComfort = Math.max(0, dayComfort);

  // Preference fit.
  let preferenceFit = 0;
  let violates = false;
  if (prefs.maxTransfers !== null && journey.transfers > prefs.maxTransfers) {
    preferenceFit -= 6;
    violates = true;
  }
  if (prefs.avoidNightTrains && facts.hasNightTrain) {
    preferenceFit -= 5;
    violates = true;
  }
  if (prefs.avoidOvernightTravel && facts.overnight && !facts.hasNightTrain) {
    preferenceFit -= 4;
    violates = true;
  }
  if (prefs.avoidStationChange && facts.stationChanges > 0) {
    preferenceFit -= 5;
    violates = true;
  }
  if (prefs.avoidBuses && facts.hasBusLeg) {
    preferenceFit -= 5;
    violates = true;
  }
  if (prefs.preferDirect) preferenceFit += journey.transfers === 0 ? 5 : -2;
  if (prefs.preferHighSpeed && facts.hasHighSpeed) preferenceFit += 3;
  if (
    prefs.maxTravelHoursPerDay !== null &&
    facts.longestTravelDayMinutes > prefs.maxTravelHoursPerDay * 60
  ) {
    preferenceFit -= 5;
    violates = true;
  }
  preferenceFit = Math.max(-10, Math.min(10, preferenceFit));
  if (!violates && preferenceFit >= 0)
    highlights.push({ tone: "good", key: "hl.matchesPreferences" });

  // Extreme duration: a journey much longer than the fastest realistic one
  // is a poor journey in absolute terms, even if it has fine connections.
  const extreme = ratio > 1.4 ? -Math.min(35, Math.round((ratio - 1.4) * 60)) : 0;
  if (extreme < 0)
    highlights.push({
      tone: "warn",
      key: "hl.muchLonger",
      vars: { time: formatDuration(journey.durationMinutes - fastestMinutes) },
    });

  const breakdown: ScoreBreakdown = {
    time,
    changes,
    connections,
    simplicity,
    dayComfort,
    preferenceFit,
    extreme,
  };
  const total = time + changes + connections + simplicity + dayComfort + preferenceFit + extreme;

  return {
    score: Math.max(0, Math.min(100, Math.round(total))),
    breakdown,
    highlights,
    violates,
  };
}

/* ------------------------------------------------------------------ *
 * Deduplication
 * ------------------------------------------------------------------ */

/**
 * Two journeys count as the same when they use the same sequence of major
 * stations and the same operators, and depart/arrive within a small window.
 * The strongest representative (highest score) is kept.
 */
function dedupeKey(scored: ScoredJourney): string {
  const transit = transitLegs(scored.journey);
  const path = transit.map((l) => `${normalizeStationName(l.fromName)}>${normalizeStationName(l.toName)}`).join("|");
  const ops = scored.journey.operators
    .map((o) => o.toLowerCase())
    .sort()
    .join(",");
  const departBucket = Math.round(new Date(scored.journey.departure).getTime() / (20 * 60000));
  const durationBucket = Math.round(scored.journey.durationMinutes / 15);
  return `${path}#${ops}#${departBucket}#${durationBucket}`;
}

function deduplicate(scored: ScoredJourney[]): { kept: ScoredJourney[]; extras: ScoredJourney[] } {
  const best = new Map<string, ScoredJourney>();
  const extras: ScoredJourney[] = [];

  for (const item of scored) {
    const key = dedupeKey(item);
    const existing = best.get(key);
    if (!existing) {
      best.set(key, item);
    } else if (item.score > existing.score) {
      best.set(key, item);
      extras.push(existing);
    } else {
      extras.push(item);
    }
  }

  return { kept: Array.from(best.values()), extras };
}

/* ------------------------------------------------------------------ *
 * Style weighting, journey labels & ranking
 * ------------------------------------------------------------------ */

/**
 * Labels describe what a journey actually offers compared with the
 * recommendation. We never label a journey "fastest" or "comfortable"
 * unless it genuinely is — otherwise it simply gets no label.
 */
export type JourneyCategory =
  | "recommended"
  | "fastest"
  | "comfortable"
  | "mostComfortable"
  | "fewerChanges"
  | "saferConnections"
  | "laterDeparture"
  | "earlierArrival";

export type JourneyOption = ScoredJourney & {
  /** Undefined when no honest label applies. */
  category?: JourneyCategory | undefined;
  /** Short deterministic explanation, built from the scoring factors. */
  reason?: { key: string; vars?: Record<string, string | number> } | undefined;
  /** True when this option also happens to be the fastest in the search. */
  alsoFastest?: boolean | undefined;
  /** True for the primary (top) option of the active profile. */
  primary?: boolean | undefined;
};

/**
 * Total elapsed journey time: first departure → final arrival, in minutes.
 * Long waits are part of the traveller's day, so this is what "fastest"
 * means. Falls back to the reported duration if a timestamp is unusable.
 */
export function elapsedMinutes(journey: Journey): number {
  const from = new Date(journey.departure).getTime();
  const to = new Date(journey.arrival).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return journey.durationMinutes;
  return Math.round((to - from) / 60000);
}

/**
 * Elapsed times within this many minutes of each other count as identical
 * for the Fastest profile, so a 2-minute difference never reshuffles
 * otherwise clearly better journeys.
 */
export const FASTEST_TOLERANCE_MINUTES = 5;

function riskyCount(item: ScoredJourney): number {
  return item.facts.connections.filter((c) => c.level !== "comfortable" && !c.longWait).length;
}

function arrivalMs(item: ScoredJourney): number {
  return new Date(item.journey.arrival).getTime();
}

function departureMs(item: ScoredJourney): number {
  return new Date(item.journey.departure).getTime();
}

/* ------------------------------------------------------------------ *
 * Phase F2 — departure-aware ranking
 * ------------------------------------------------------------------ *
 *
 * Timetable mode returns journeys departing at materially different times,
 * including some before the traveller's requested departure. Profiles must
 * therefore answer three different traveller questions:
 *
 *   Recommended – best overall journey, within a bounded arrival penalty.
 *   Fastest     – earliest realistic arrival among catchable journeys.
 *   Comfortable – easiest journey, within a wider bounded arrival penalty.
 *
 * All rules are relative and generic: no route, city or operator is named.
 */

/** A departure this many minutes before the requested time is still catchable. */
export const DEPARTURE_GRACE_MINUTES = 5;

/** Bounded arrival penalty for Recommended, relative to the earliest arrival. */
export const RECOMMENDED_ARRIVAL_BUDGET_MIN_MINUTES = 45;
export const RECOMMENDED_ARRIVAL_BUDGET_SHARE = 0.12;
export const RECOMMENDED_ARRIVAL_BUDGET_CAP_MINUTES = 180;

/** Bounded arrival penalty for Comfortable — wider, but still bounded. */
export const COMFORT_ARRIVAL_BUDGET_MIN_MINUTES = 60;
export const COMFORT_ARRIVAL_BUDGET_SHARE = 0.15;
export const COMFORT_ARRIVAL_BUDGET_CAP_MINUTES = 240;

/** Material difference used by the dominance test. */
export const DOMINANCE_MARGIN_MINUTES = 20;

export type RankContext = {
  /** Requested departure as epoch ms, or null when unknown. */
  requestedDepartureMs: number | null;
  /** Earliest arrival among catchable journeys, epoch ms. */
  bestArrivalMs: number;
  /** Shortest elapsed time among catchable journeys, minutes. */
  bestElapsedMinutes: number;
  /** Ids of journeys that another catchable journey strictly dominates. */
  dominatedIds: Set<string>;
  recommendedBudgetMinutes: number;
  comfortBudgetMinutes: number;
};

function budget(minMinutes: number, share: number, cap: number, bestElapsed: number): number {
  return Math.min(cap, Math.max(minMinutes, Math.round(bestElapsed * share)));
}

/** True when the traveller could reasonably still board this departure. */
export function isCatchable(item: ScoredJourney, ctx: RankContext): boolean {
  if (ctx.requestedDepartureMs === null) return true;
  return departureMs(item) >= ctx.requestedDepartureMs - DEPARTURE_GRACE_MINUTES * 60000;
}

/**
 * Pareto dominance: `b` beats `a` on arrival by a material margin without
 * leaving materially earlier and without being worse on any traveller-relevant
 * dimension. A dominated journey stays visible but never wins a profile.
 */
function dominates(b: ScoredJourney, a: ScoredJourney): boolean {
  if (b.journey.id === a.journey.id) return false;
  const margin = DOMINANCE_MARGIN_MINUTES * 60000;
  if (arrivalMs(b) > arrivalMs(a) - margin) return false;
  if (departureMs(b) < departureMs(a) - margin) return false;
  if (b.journey.transfers > a.journey.transfers) return false;
  if (riskyCount(b) > riskyCount(a)) return false;
  if (b.facts.stationChanges > a.facts.stationChanges) return false;
  if (b.facts.longWaitMinutes > a.facts.longWaitMinutes) return false;
  return true;
}

export function buildRankContext(
  items: ScoredJourney[],
  requestedDepartureIso?: string | undefined,
): RankContext {
  const parsed = requestedDepartureIso ? new Date(requestedDepartureIso).getTime() : NaN;
  const requestedDepartureMs = Number.isFinite(parsed) ? parsed : null;

  const base = items.filter(
    (item) =>
      requestedDepartureMs === null ||
      departureMs(item) >= requestedDepartureMs - DEPARTURE_GRACE_MINUTES * 60000,
  );
  const pool = base.length ? base : items;

  const bestArrivalMs = pool.length ? Math.min(...pool.map(arrivalMs)) : 0;
  const bestElapsedMinutes = pool.length
    ? Math.min(...pool.map((item) => elapsedMinutes(item.journey)))
    : 0;

  const dominatedIds = new Set<string>();
  for (const a of pool) {
    if (pool.some((b) => dominates(b, a))) dominatedIds.add(a.journey.id);
  }

  return {
    requestedDepartureMs,
    bestArrivalMs,
    bestElapsedMinutes,
    dominatedIds,
    recommendedBudgetMinutes: budget(
      RECOMMENDED_ARRIVAL_BUDGET_MIN_MINUTES,
      RECOMMENDED_ARRIVAL_BUDGET_SHARE,
      RECOMMENDED_ARRIVAL_BUDGET_CAP_MINUTES,
      bestElapsedMinutes,
    ),
    comfortBudgetMinutes: budget(
      COMFORT_ARRIVAL_BUDGET_MIN_MINUTES,
      COMFORT_ARRIVAL_BUDGET_SHARE,
      COMFORT_ARRIVAL_BUDGET_CAP_MINUTES,
      bestElapsedMinutes,
    ),
  };
}

/** Minutes this journey arrives after the earliest realistic arrival. */
export function arrivalLatenessMinutes(item: ScoredJourney, ctx: RankContext): number {
  return Math.round((arrivalMs(item) - ctx.bestArrivalMs) / 60000);
}

/**
 * Eligibility tiers. Tier 0 journeys are the only ones that may win a profile;
 * everything else keeps its place further down the same list, so nothing
 * disappears from the results.
 */
function eligibilityTier(item: ScoredJourney, style: TravelStyle, ctx: RankContext): number {
  if (!isCatchable(item, ctx)) return 3;
  if (ctx.dominatedIds.has(item.journey.id)) return 2;
  if (style === "fastest") return 0;
  const allowed =
    style === "comfortable" ? ctx.comfortBudgetMinutes : ctx.recommendedBudgetMinutes;
  return arrivalLatenessMinutes(item, ctx) <= allowed ? 0 : 1;
}

/**
 * Fastest: earliest realistic arrival wins. Ties (within the documented
 * tolerance) fall back to shorter elapsed time → fewer transfers → fewer
 * risky/tight connections → higher Euroute Score.
 */
function compareFastest(a: ScoredJourney, b: ScoredJourney): number {
  const arriveDiff = Math.round((arrivalMs(a) - arrivalMs(b)) / 60000);
  if (Math.abs(arriveDiff) > FASTEST_TOLERANCE_MINUTES) return arriveDiff;
  const ea = elapsedMinutes(a.journey);
  const eb = elapsedMinutes(b.journey);
  if (Math.abs(ea - eb) > FASTEST_TOLERANCE_MINUTES) return ea - eb;
  if (a.journey.transfers !== b.journey.transfers) return a.journey.transfers - b.journey.transfers;
  const ra = riskyCount(a);
  const rb = riskyCount(b);
  if (ra !== rb) return ra - rb;
  if (a.score !== b.score) return b.score - a.score;
  if (arriveDiff !== 0) return arriveDiff;
  return ea - eb;
}

/**
 * Comfort ranking: fewer changes and safe margins dominate. Duration still
 * matters (via the time component) but never decides on its own, so this is
 * deliberately not the balanced Recommended model.
 */
function comfortValue(item: ScoredJourney): number {
  const b = item.breakdown;
  return (
    b.connections * 1.7 +
    b.changes * 1.6 +
    b.simplicity * 1.4 +
    b.dayComfort * 1.2 +
    b.time * 0.3 +
    b.preferenceFit +
    b.extreme -
    // Every change is travel burden in itself, even a comfortable one.
    item.journey.transfers * 6 -
    item.facts.stationChanges * 4 -
    riskyCount(item) * 8
  );
}

/* ------------------------------------------------------------------ *
 * Phase F4B — Comfortable profile semantics
 * ------------------------------------------------------------------ *
 *
 * Comfortable means the most passenger-friendly practical journey, not the
 * earliest arrival and not the highest score. Inside the existing Comfortable
 * time envelope (the arrival budget, unchanged), candidates are compared
 * lexicographically on passenger friction, so a materially riskier journey can
 * no longer win merely by arriving somewhat earlier. Hard safety stays
 * upstream in Phase E; this only reorders journeys that are already usable.
 */

/** Connections that are outright risky (excluding pure long waits). */
export function riskyOnlyCount(item: ScoredJourney): number {
  return item.facts.connections.filter((c) => c.level === "risky" && !c.longWait).length;
}

/** Connections that are tight but not risky. */
export function tightOnlyCount(item: ScoredJourney): number {
  return item.facts.connections.filter((c) => c.level === "tight" && !c.longWait).length;
}

/**
 * Awkward waiting, bucketed per hour so that a few minutes of difference
 * never reshuffles otherwise comparable journeys.
 */
export const COMFORT_WAIT_BUCKET_MINUTES = 60;

function waitBurden(item: ScoredJourney): number {
  return Math.floor(item.facts.longWaitMinutes / COMFORT_WAIT_BUCKET_MINUTES);
}

/** Elapsed times within this many minutes count as equal for Comfortable. */
export const COMFORT_TIME_TOLERANCE_MINUTES = 20;

/**
 * Comfortable comparator: safety and friction first, time as a guard.
 * Order: risky → tight → station changes → transfers → long waits →
 * materially shorter elapsed time → comfort model → elapsed time.
 */
function compareComfortable(a: ScoredJourney, b: ScoredJourney): number {
  const ra = riskyOnlyCount(a);
  const rb = riskyOnlyCount(b);
  if (ra !== rb) return ra - rb;

  const ta = tightOnlyCount(a);
  const tb = tightOnlyCount(b);
  if (ta !== tb) return ta - tb;

  if (a.facts.stationChanges !== b.facts.stationChanges)
    return a.facts.stationChanges - b.facts.stationChanges;

  // Awkward dead time counts before transfer count, so a long station wait is
  // never rewarded merely because it removes one change.
  const wa = waitBurden(a);
  const wb = waitBurden(b);
  if (wa !== wb) return wa - wb;

  if (a.journey.transfers !== b.journey.transfers) return a.journey.transfers - b.journey.transfers;

  const ea = elapsedMinutes(a.journey);
  const eb = elapsedMinutes(b.journey);
  if (Math.abs(ea - eb) > COMFORT_TIME_TOLERANCE_MINUTES) return ea - eb;

  const diff = comfortValue(b) - comfortValue(a);
  if (Math.abs(diff) > 0.001) return diff;

  if (ea !== eb) return ea - eb;
  return arrivalMs(a) - arrivalMs(b);
}

/**
 * Style weights bias the ranking without changing the displayed score.
 * The displayed Euroute Score stays comparable across styles; the style
 * only decides which journey is promoted to the top and the order.
 * "fastest" and "comfortable" have their own comparators.
 */
function styleValue(item: ScoredJourney, style: TravelStyle): number {
  switch (style) {
    case "comfortable":
      return comfortValue(item);
    // Scenic and cheapest have no reliable data source; fall back to the
    // balanced model rather than inventing a signal.
    case "scenic":
    case "cheapest":
    case "recommended":
    default:
      return item.score;
  }
}

/** Deterministic ordering for a style, best first. */
export function compareByStyle(
  a: ScoredJourney,
  b: ScoredJourney,
  style: TravelStyle,
  ctx?: RankContext | undefined,
): number {
  if (a.violatesPreferences !== b.violatesPreferences) return a.violatesPreferences ? 1 : -1;
  if (ctx) {
    const ta = eligibilityTier(a, style, ctx);
    const tb = eligibilityTier(b, style, ctx);
    if (ta !== tb) return ta - tb;
  }
  if (style === "fastest") return compareFastest(a, b);
  if (style === "comfortable") return compareComfortable(a, b);
  const diff = styleValue(b, style) - styleValue(a, style);
  if (Math.abs(diff) > 0.001) return diff;
  return elapsedMinutes(a.journey) - elapsedMinutes(b.journey);
}


/** Label for the top card, reflecting the active profile. */
export function primaryCategory(style: TravelStyle): JourneyCategory {
  if (style === "fastest") return "fastest";
  if (style === "comfortable") return "mostComfortable";
  return "recommended";
}




function hasRisk(item: ScoredJourney): boolean {
  return item.facts.connections.some((c) => c.level !== "comfortable" && !c.longWait);
}

/**
 * Deterministic "why this journey won" reason, built from the decisive factor.
 * Claims are checked against the actual data: we only say "shortest travel
 * time" when the journey really has the shortest elapsed time, and only say
 * "arrives first" when it really has the earliest arrival.
 */
function recommendedReason(
  item: ScoredJourney,
  all: ScoredJourney[],
  ctx: RankContext,
): { key: string; vars?: Record<string, string | number> } {

  const fewestChanges = Math.min(...all.map((i) => i.journey.transfers));
  const safe = !hasRisk(item);
  const lateness = arrivalLatenessMinutes(item, ctx);
  const earliestArrival = lateness <= FASTEST_TOLERANCE_MINUTES;
  const shortestElapsed = elapsedMinutes(item.journey) <= ctx.bestElapsedMinutes + FASTEST_TOLERANCE_MINUTES;
  const smallTimeCost = lateness <= ctx.recommendedBudgetMinutes;

  if (item.journey.transfers === 0)
    return earliestArrival ? { key: "reason.direct" } : { key: "reason.directNearlyFast" };
  if (earliestArrival && shortestElapsed && safe) return { key: "reason.fastestAndSafe" };
  if (earliestArrival) return safe ? { key: "reason.earliestArrivalSafe" } : { key: "reason.earliestArrival" };
  if (safe && item.journey.transfers === fewestChanges && smallTimeCost)
    return { key: "reason.fewChangesSmallCost", vars: { n: item.journey.transfers } };
  if (safe && smallTimeCost) return { key: "reason.balanced" };
  if (safe) return { key: "reason.safeConnections" };
  if (shortestElapsed) return { key: "reason.fastest" };
  return { key: "reason.bestAvailable" };
}

/**
 * Phase F4B — why this journey is the most comfortable one. Every claim is
 * checked against the other candidates: we only say "safer connections" when
 * this journey really has fewer risky/tight connections than the alternatives,
 * only "fewer changes" when it really has fewer, and never claim faster.
 */
function comfortableReason(
  item: ScoredJourney,
  all: ScoredJourney[],
  ctx: RankContext,
): { key: string; vars?: Record<string, string | number> } {
  const others = all.filter((i) => i.journey.id !== item.journey.id);
  const lateness = arrivalLatenessMinutes(item, ctx);
  const smallTimeCost = lateness <= ctx.comfortBudgetMinutes;

  if (others.length === 0) {
    if (item.journey.transfers === 0) return { key: "reason.direct" };
    return riskyOnlyCount(item) + tightOnlyCount(item) === 0
      ? { key: "reason.safeConnections" }
      : { key: "reason.bestAvailable" };
  }

  const risky = riskyOnlyCount(item);
  const tight = tightOnlyCount(item);
  const risk = risky + tight;
  const othersRisky = Math.min(...others.map((i) => riskyOnlyCount(i)));
  const othersRisk = Math.min(...others.map((i) => riskyOnlyCount(i) + tightOnlyCount(i)));
  const fewerRisk = risk < othersRisk;

  if (item.journey.transfers === 0)
    return lateness <= FASTEST_TOLERANCE_MINUTES
      ? { key: "reason.direct" }
      : { key: "reason.comfortDirect" };

  if (fewerRisk && risk === 0) return { key: "reason.comfortSafeConnections" };
  // Only claim "fewer risky" when the risky count itself is lower; otherwise
  // the honest claim is about tight connections.
  if (fewerRisk && risky < othersRisky) return { key: "reason.comfortFewerRisky" };
  if (fewerRisk) return { key: "reason.comfortFewerTight" };

  if (item.journey.transfers < Math.min(...others.map((i) => i.journey.transfers)))
    return { key: "reason.comfortFewerChanges", vars: { n: item.journey.transfers } };

  if (
    item.facts.stationChanges === 0 &&
    others.some((i) => i.facts.stationChanges > 0) &&
    risk <= othersRisk
  )
    return { key: "reason.comfortNoStationChange" };

  if (risk === 0 && smallTimeCost) return { key: "reason.comfortSimpleSmallCost" };
  if (risk === 0) return { key: "reason.safeConnections" };
  return { key: "reason.comfortSimplest" };
}




export type JourneyAnalysis = {
  /** 1–4 genuinely relevant journeys, best first. */
  options: JourneyOption[];
  /** Valid but less relevant journeys, shown behind "Show more journeys". */
  more: ScoredJourney[];
  /** True when timetable data exists, but every itinerary fails the absolute plausibility gate. */
  allJourneysUnusable: boolean;
  /** Number of valid timetable journeys removed by the absolute plausibility gate. */
  unusableCount: number;
  /** Styles requested but unsupported by the current data source. */
  unavailableStyle: TravelStyle | null;
  /** Shortest journey time in the search, in minutes (0 when empty). */
  fastestMinutes: number;
};

export function analyseJourneys(args: {
  journeys: Journey[];
  preferences: JourneyPreferences;
  style: TravelStyle;
  /**
   * The traveller's requested departure (ISO). Used as the departure-time
   * anchor for profile ranking; when omitted, every candidate counts as
   * catchable and ranking behaves as before Phase F2.
   */
  requestedDepartureIso?: string | undefined;
}): JourneyAnalysis {

  const { preferences: prefs, style } = args;

  // 1–3. Validation, passenger-visible dedupe (F2.5), Phase E and the F1.5
  // dead-time gate — one shared implementation, also used by the retrieval
  // layer to decide whether cursor recovery is needed (Phase F3).
  const pre = preAnalyseJourneys(args.journeys, prefs.minTransferMinutes);
  const usable = pre.usable;
  const unusableCount = pre.unusable.length;

  if (usable.length === 0 && unusableCount === 0) {
    return {
      options: [],
      more: [],
      allJourneysUnusable: false,
      unusableCount: 0,
      unavailableStyle: isStyleAvailable(style) ? null : style,
      fastestMinutes: 0,
    };
  }


  if (usable.length === 0) {
    return {
      options: [],
      more: [],
      allJourneysUnusable: true,
      unusableCount,
      unavailableStyle: isStyleAvailable(style) ? null : style,
      fastestMinutes: 0,
    };
  }

  const fastestMinutes = Math.min(...usable.map((item) => item.journey.durationMinutes));

  // 4–5. Preferences and score, only for journeys that can be booked realistically.
  const scored: ScoredJourney[] = usable.map(({ journey, facts, usability }) => {
    const { score, breakdown, highlights, violates } = scoreJourney(
      journey,
      facts,
      fastestMinutes,
      prefs,
    );
    return { journey, facts, usability, score, breakdown, highlights, violatesPreferences: violates };
  });

  // 6. Deduplicate.
  const { kept, extras } = deduplicate(scored);

  // 7. Rank by the chosen travel style, departure-aware (Phase F2). Journeys
  // that break an explicit preference are ranked after the ones that respect
  // every preference.
  const ctx = buildRankContext(kept, args.requestedDepartureIso);
  const ranked = [...kept].sort((a, b) => compareByStyle(a, b, style, ctx));

  const top = ranked[0]!;
  const fastestJourney = [...kept].sort(
    (a, b) => elapsedMinutes(a.journey) - elapsedMinutes(b.journey),
  )[0]!;
  const fastestElapsed = elapsedMinutes(fastestJourney.journey);
  const topIsFastest =
    elapsedMinutes(top.journey) <= fastestElapsed + FASTEST_TOLERANCE_MINUTES;
  const topArrivesFirst = arrivalLatenessMinutes(top, ctx) <= FASTEST_TOLERANCE_MINUTES;

  const options: JourneyOption[] = [
    {
      ...top,
      // Never claim "fastest" for a journey that is neither the shortest nor
      // the first to arrive.
      category:
        style === "fastest" && !topIsFastest && !topArrivesFirst
          ? "recommended"
          : primaryCategory(style),
      primary: true,
      reason:
        style === "comfortable"
          ? comfortableReason(top, kept, ctx)
          : recommendedReason(top, kept, ctx),

      alsoFastest: topIsFastest,
    },
  ];
  const used = new Set([top.journey.id]);

  // 8. Be selective: an extra primary option must be realistic AND offer a
  // concrete advantage over the top result. Otherwise it belongs behind
  // "show more journeys".
  const recDepart = new Date(top.journey.departure).getTime();
  const recArrive = new Date(top.journey.arrival).getTime();

  for (const item of ranked) {
    if (options.length >= 4) break;
    if (used.has(item.journey.id)) continue;
    if (item.violatesPreferences && !top.violatesPreferences) continue;
    if (item.score < top.score - 20) continue;
    if (item.journey.durationMinutes > fastestMinutes * 1.4) continue;

    const depart = new Date(item.journey.departure).getTime();
    const arrive = new Date(item.journey.arrival).getTime();
    // "Arrives earlier" is measured on real arrival timestamps, never on
    // elapsed duration.
    const arrivesEarlier = arrive <= recArrive - 20 * 60000;

    let category: JourneyCategory | undefined;
    if (arrivesEarlier) {
      category = item.journey.id === fastestJourney.journey.id ? "fastest" : "earlierArrival";
    } else if (item.journey.transfers < top.journey.transfers) {
      category = "fewerChanges";
    } else if (hasRisk(top) && !hasRisk(item)) {
      category = "saferConnections";
    } else if (
      !hasRisk(item) &&
      item.journey.transfers <= top.journey.transfers &&
      comfortValue(item) > comfortValue(top)
    ) {
      category = "comfortable";
    } else if (depart >= recDepart + 90 * 60000 && arrive <= recArrive + 6 * 3600000) {
      category = "laterDeparture";
    }

    if (!category) continue;

    options.push({
      ...item,
      category,
      alsoFastest: item.journey.id === fastestJourney.journey.id,
    });
    used.add(item.journey.id);
  }

  const more = [...kept.filter((item) => !used.has(item.journey.id)), ...extras].sort((a, b) =>
    compareByStyle(a, b, style, ctx),
  );



  return {
    options,
    more,
    allJourneysUnusable: false,
    unusableCount,
    unavailableStyle: isStyleAvailable(style) ? null : style,
    fastestMinutes,
  };
}
