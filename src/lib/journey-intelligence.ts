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

import { formatDuration, transferMinutes, type Journey, type Leg } from "./journey";

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
  /** True when the traveller has to move to a different station. */
  stationChange: boolean;
  /** True when the operator differs between the two legs. */
  operatorChange: boolean;
  minutes: number;
  /** Minutes we consider a safe margin for this specific connection. */
  recommendedMinutes: number;
  level: ConnectionRiskLevel;
  /** Very long stop between legs (3 h or more) – a wait, not a change. */
  longWait: boolean;
};

const HIGH_SPEED_MODES = new Set(["HIGHSPEED_RAIL", "LONG_DISTANCE", "NIGHT_RAIL"]);

function normStation(name: string): string {
  return (
    name
      .toLowerCase()
      .split(",")[0]!
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // German/Nordic transliterations so "Zürich HB" === "ZUERICH HB".
      .replace(/ue/g, "u")
      .replace(/oe/g, "o")
      .replace(/ae/g, "a")
      .replace(/ss/g, "s")
      .replace(/[æø]/g, "o")
      .replace(/\b(hbf|hauptbahnhof|centralstation|central|c|st|station|banegard|st\.)\b/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .trim()
  );
}

/** A connection this long is a wait, not a change. */
const LONG_WAIT_MINUTES = 180;

/**
 * Recommended safe margin for one connection, built only from known facts:
 *   base 10 min in a station
 *   +5  operator change (separate ticket, no through-protection guaranteed)
 *   +5  long-distance/high-speed arrival or departure (bigger stations)
 *   +15 change of station inside the city (walk/transit between stations)
 * The result is never below the traveller's own minimum connection time.
 */
function recommendedMargin(prev: Leg, next: Leg, userMinimum: number): number {
  let minutes = 10;
  if (prev.operator && next.operator && prev.operator !== next.operator) minutes += 5;
  if (HIGH_SPEED_MODES.has(prev.mode) || HIGH_SPEED_MODES.has(next.mode)) minutes += 5;
  if (normStation(prev.toName) !== normStation(next.fromName)) minutes += 15;
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
  const transit = transitLegs(journey);
  const gaps = transferMinutes(journey);
  const connections: Connection[] = [];

  for (let i = 1; i < transit.length; i += 1) {
    const prev = transit[i - 1]!;
    const next = transit[i]!;
    const minutes = gaps[i - 1] ?? 0;
    const recommended = recommendedMargin(prev, next, userMinimum);
    connections.push({
      index: i,
      arriveStation: prev.toName,
      departStation: next.fromName,
      stationChange: normStation(prev.toName) !== normStation(next.fromName),
      operatorChange: Boolean(prev.operator && next.operator && prev.operator !== next.operator),
      minutes,
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
    hasNightTrain: transit.some((leg) => leg.mode === "NIGHT_RAIL"),
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
  score: number;
  breakdown: ScoreBreakdown;
  highlights: Highlight[];
  /** True when the journey breaks a hard preference (kept, but ranked down). */
  violatesPreferences: boolean;
};

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
  const path = transit.map((l) => `${normStation(l.fromName)}>${normStation(l.toName)}`).join("|");
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
};

function comfortValue(item: ScoredJourney): number {
  const b = item.breakdown;
  return (
    b.connections * 1.7 +
    b.changes * 1.6 +
    b.simplicity * 1.4 +
    b.dayComfort * 1.2 +
    b.time * 0.3 +
    b.preferenceFit +
    b.extreme
  );
}

/**
 * Style weights bias the ranking without changing the displayed score.
 * The displayed Euroute Score stays comparable across styles; the style
 * only decides which journey is promoted to Recommended and the order.
 */
function styleValue(item: ScoredJourney, style: TravelStyle): number {
  const b = item.breakdown;
  switch (style) {
    case "fastest":
      // Travel time dominates, but a risky connection still costs.
      return b.time * 3 + b.connections * 0.8 + b.changes * 0.3 + b.preferenceFit + b.extreme;
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

function hasRisk(item: ScoredJourney): boolean {
  return item.facts.connections.some((c) => c.level !== "comfortable" && !c.longWait);
}

/** Deterministic "why we recommend this" reason from the actual factors. */
function recommendedReason(
  item: ScoredJourney,
  all: ScoredJourney[],
  fastestMinutes: number,
): { key: string; vars?: Record<string, string | number> } {
  const fewestChanges = Math.min(...all.map((i) => i.journey.transfers));
  const isFastest = item.journey.durationMinutes <= fastestMinutes + 5;
  const safe = !hasRisk(item);
  const closeToFastest = item.journey.durationMinutes <= fastestMinutes * 1.12;

  if (item.journey.transfers === 0) return { key: "reason.direct" };
  if (isFastest && safe) return { key: "reason.fastestAndSafe" };
  if (safe && closeToFastest) return { key: "reason.balanced" };
  if (safe && item.journey.transfers === fewestChanges)
    return { key: "reason.fewChangesSafe", vars: { n: item.journey.transfers } };
  if (safe) return { key: "reason.safeConnections" };
  if (isFastest) return { key: "reason.fastest" };
  return { key: "reason.bestAvailable" };
}

export type JourneyAnalysis = {
  /** 1–4 genuinely relevant journeys, best first. */
  options: JourneyOption[];
  /** Valid but less relevant journeys, shown behind "Show more journeys". */
  more: ScoredJourney[];
  /** Styles requested but unsupported by the current data source. */
  unavailableStyle: TravelStyle | null;
  /** Shortest journey time in the search, in minutes (0 when empty). */
  fastestMinutes: number;
};

export function analyseJourneys(args: {
  journeys: Journey[];
  preferences: JourneyPreferences;
  style: TravelStyle;
}): JourneyAnalysis {
  const { preferences: prefs, style } = args;

  // 1. Validate: keep journeys with real times and at least one transit leg.
  const valid = args.journeys.filter((j) => {
    if (!j.departure || !j.arrival || !Number.isFinite(j.durationMinutes)) return false;
    return transitLegs(j).length > 0;
  });

  if (valid.length === 0) {
    return {
      options: [],
      more: [],
      unavailableStyle: isStyleAvailable(style) ? null : style,
      fastestMinutes: 0,
    };
  }

  const fastestMinutes = Math.min(...valid.map((j) => j.durationMinutes));

  // 2–5. Connections, risk, preferences, score.
  const scored: ScoredJourney[] = valid.map((journey) => {
    const facts = journeyFacts(journey, prefs.minTransferMinutes);
    const { score, breakdown, highlights, violates } = scoreJourney(
      journey,
      facts,
      fastestMinutes,
      prefs,
    );
    return { journey, facts, score, breakdown, highlights, violatesPreferences: violates };
  });

  // 6. Deduplicate.
  const { kept, extras } = deduplicate(scored);

  // 7. Rank by the chosen travel style. Journeys that break an explicit
  // preference are ranked after the ones that respect every preference.
  const ranked = [...kept].sort((a, b) => {
    if (a.violatesPreferences !== b.violatesPreferences) return a.violatesPreferences ? 1 : -1;
    const diff = styleValue(b, style) - styleValue(a, style);
    if (Math.abs(diff) > 0.001) return diff;
    return a.journey.durationMinutes - b.journey.durationMinutes;
  });

  const recommended = ranked[0]!;
  const fastestJourney = [...kept].sort(
    (a, b) => a.journey.durationMinutes - b.journey.durationMinutes,
  )[0]!;

  const options: JourneyOption[] = [
    {
      ...recommended,
      category: "recommended",
      reason: recommendedReason(recommended, kept, fastestMinutes),
      alsoFastest: recommended.journey.id === fastestJourney.journey.id,
    },
  ];
  const used = new Set([recommended.journey.id]);

  // 8. Be selective: an extra primary option must be realistic AND offer a
  // concrete advantage over the recommendation. Otherwise it belongs behind
  // "show more journeys".
  const recDuration = recommended.journey.durationMinutes;
  const recDepart = new Date(recommended.journey.departure).getTime();
  const recArrive = new Date(recommended.journey.arrival).getTime();

  for (const item of ranked) {
    if (options.length >= 4) break;
    if (used.has(item.journey.id)) continue;
    if (item.violatesPreferences && !recommended.violatesPreferences) continue;
    if (item.score < recommended.score - 20) continue;
    if (item.journey.durationMinutes > fastestMinutes * 1.4) continue;

    const minutesSaved = recDuration - item.journey.durationMinutes;
    const depart = new Date(item.journey.departure).getTime();
    const arrive = new Date(item.journey.arrival).getTime();

    let category: JourneyCategory | undefined;
    if (minutesSaved >= 20) {
      category = item.journey.id === fastestJourney.journey.id ? "fastest" : "earlierArrival";
    } else if (item.journey.transfers < recommended.journey.transfers) {
      category = "fewerChanges";
    } else if (hasRisk(recommended) && !hasRisk(item)) {
      category = "saferConnections";
    } else if (
      !hasRisk(item) &&
      item.journey.transfers <= recommended.journey.transfers &&
      comfortValue(item) > comfortValue(recommended)
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

  const more = [...kept.filter((item) => !used.has(item.journey.id)), ...extras].sort(
    (a, b) => styleValue(b, style) - styleValue(a, style),
  );

  return {
    options,
    more,
    unavailableStyle: isStyleAvailable(style) ? null : style,
    fastestMinutes,
  };
}
