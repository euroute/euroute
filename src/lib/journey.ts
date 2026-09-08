// Delade typer och hjälpfunktioner för reseplanering. Client-safe.

/**
 * Övre gräns för ett Transitous stop-id. Riktiga id:n är feed-prefix plus
 * feed-eget id (längsta observerade ~90 tecken); allt större är inte ett id.
 */
export const MAX_STOP_ID_LENGTH = 200;


export type Place = {
  /** "lat,lon" i MOTIS-format. Alltid satt och alltid det som används för routing. */
  place: string;
  name: string;
  country?: string | undefined;
  /**
   * Exakt Transitous stop-id för en järnvägsstation, när Euroute känner det
   * (explicit vald station eller stationsupplösning av en stad). Endast
   * förberedande data: routing, tidszoner och sparade resor använder `place`.
   */
  stopId?: string | undefined;
  /**
   * Vad användaren faktiskt valde: en stad ("city") eller en namngiven
   * järnvägsstation ("station"). Saknas fältet behandlas platsen som förr
   * (koordinat/stop-id utan radie) – gamla länkar och sparade resor är giltiga.
   */
  intent?: PlaceIntent | undefined;
};

/** Användarens val: stad (låt routern välja terminal) eller exakt station. */
export type PlaceIntent = "city" | "station";

export type Leg = {
  kind: "train" | "bus" | "walk" | "other";
  mode: string;
  modeLabel: string;
  fromName: string;
  toName: string;
  /** "lat,lon" for the boarding stop, when the timetable source provides it. */
  fromPlace?: string | undefined;
  /** "lat,lon" for the alighting stop – used to plan onward journeys. */
  toPlace?: string | undefined;
  /**
   * Upstream station identity metadata, kept verbatim when the timetable source
   * provides it. Purely additive: older saved/shared snapshots omit these and
   * must keep working on name/coordinate fallbacks alone.
   */
  fromStopId?: string | undefined;
  toStopId?: string | undefined;
  fromParentId?: string | undefined;
  toParentId?: string | undefined;
  fromLevel?: number | undefined;
  toLevel?: number | undefined;

  departure: string;
  arrival: string;
  durationMinutes: number;
  operator?: string | undefined;
  operatorUrl?: string | undefined;
  trainName?: string | undefined;
  headsign?: string | undefined;
  realTime: boolean;
};

export type Journey = {
  id: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  transfers: number;
  /** Minsta bytesmarginal i minuter (undefined om inga byten) */
  minTransferMinutes?: number | undefined;
  legs: Leg[];
  operators: string[];
  hasNightLeg: boolean;
  /** Sant när resan är hopkopplad av flera delsökningar via mellanstopp */
  chained: boolean;
};

export type JourneySearch = {
  from: Place;
  to: Place;
  via: Place[];
  departAt: string;
  maxTransfers: number;
  minTransferMinutes: number;
};

export const TRAIN_MODES = [
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
  "RAIL",
  "SUBURBAN",
  "METRO",
  "SUBWAY",
  "TRAM",
] as const;

/**
 * Modes that may anchor a Euroute journey, i.e. count as "real" intercity rail.
 * Local access modes (metro, tram, suburban, bus, ferry, walk) are deliberately
 * excluded: they can be legitimate INSIDE a journey but never define its ends.
 */
export const RAIL_ANCHOR_MODES = [
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
  "RAIL",
] as const;

const RAIL_ANCHOR_SET = new Set<string>(RAIL_ANCHOR_MODES);

/** True when this leg is a meaningful rail anchor. */
export function isRailAnchorLeg(leg: Leg): boolean {
  return leg.kind === "train" && RAIL_ANCHOR_SET.has(leg.mode);
}

/**
 * Terminal-to-terminal normalisation for city-intent endpoints.
 *
 * Transitous routes coordinate+radius endpoints from the literal city
 * coordinate, so an itinerary can be prefixed/suffixed with walking or local
 * transit to reach the terminal MOTIS selected. Euroute is a rail product: the
 * journey must begin at the first meaningful rail anchor and end at the last.
 *
 * The operation is strictly "drop prefix / drop suffix" – never a mode filter.
 * Every leg between the two anchors survives verbatim, including legitimate
 * WALK/METRO/RER/SUBURBAN station changes.
 *
 * Returns null when the itinerary contains no rail anchor at all (a pure
 * metro/bus/walk result is not a Euroute rail journey and must be discarded).
 */
export function trimAccessLegs(
  legs: Leg[],
  options: { trimOrigin: boolean; trimDestination: boolean },
): Leg[] | null {
  const first = legs.findIndex(isRailAnchorLeg);
  if (first === -1) return null;
  let last = -1;
  for (let i = legs.length - 1; i >= 0; i -= 1) {
    if (isRailAnchorLeg(legs[i]!)) {
      last = i;
      break;
    }
  }
  const start = options.trimOrigin ? first : 0;
  const end = options.trimDestination ? last : legs.length - 1;
  if (start === 0 && end === legs.length - 1) return legs;
  return legs.slice(start, end + 1);
}

/** Departure instant of the first meaningful rail anchor, if any. */
export function firstRailDeparture(legs: Leg[]): string | undefined {
  return legs.find(isRailAnchorLeg)?.departure;
}

export const MODE_LABELS: Record<string, string> = {
  HIGHSPEED_RAIL: "Snabbtåg",
  LONG_DISTANCE: "Fjärrtåg",
  NIGHT_RAIL: "Nattåg",
  REGIONAL_FAST_RAIL: "Regionaltåg",
  REGIONAL_RAIL: "Regionaltåg",
  RAIL: "Tåg",
  SUBURBAN: "Pendeltåg",
  METRO: "Metro",
  SUBWAY: "Metro",
  TRAM: "Spårvagn",
  BUS: "Buss",
  COACH: "Buss",
  FERRY: "Färja",
  WALK: "Gång",
};

export const MODE_LABELS_EN: Record<string, string> = {
  HIGHSPEED_RAIL: "High-speed train",
  LONG_DISTANCE: "Long-distance train",
  NIGHT_RAIL: "Night train",
  REGIONAL_FAST_RAIL: "Regional express",
  REGIONAL_RAIL: "Regional train",
  RAIL: "Train",
  SUBURBAN: "Commuter train",
  METRO: "Metro",
  SUBWAY: "Metro",
  TRAM: "Tram",
  BUS: "Bus",
  COACH: "Coach",
  FERRY: "Ferry",
  WALK: "Walk",
};

/** Lokaliserad etikett för ett trafikslag, med serverns etikett som fallback. */
export function modeLabel(mode: string, lang: "sv" | "en", fallback: string): string {
  const dict = lang === "en" ? MODE_LABELS_EN : MODE_LABELS;
  return dict[mode] ?? fallback;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatClock(iso: string, timeZone = "Europe/Stockholm"): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(iso));
}

export function formatDay(
  iso: string,
  lang: "sv" | "en" = "sv",
  timeZone = "Europe/Stockholm",
): string {
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(new Date(iso));
}

/**
 * "tis 22 sep" for one day, "tis 22 sep – ons 23 sep" across several.
 * The two instants may live in different station zones (London → Paris), so
 * each end is formatted in its own zone.
 */
export function formatDayRange(
  fromIso: string,
  toIso: string,
  lang: "sv" | "en" = "sv",
  fromZone = "Europe/Stockholm",
  toZone = fromZone,
): string {
  const from = formatDay(fromIso, lang, fromZone);
  const to = formatDay(toIso, lang, toZone);
  return from === to ? from : `${from} – ${to}`;
}

/**
 * Civil (wall-clock) date/time helpers.
 *
 * A departure like 2026-06-01T08:00+02:00 must always read as 08:00 and
 * 1 June in Swedish time. Slicing `toISOString()` returns UTC, which shifts
 * the value by one or two hours during CET/CEST and can even roll the date
 * backwards near midnight. These helpers format in the target zone instead.
 */
export const JOURNEY_TIME_ZONE = "Europe/Stockholm";

/** "2026-06-01" as seen in `timeZone`, suitable for <input type="date">. */
export function civilDate(iso: string, timeZone = JOURNEY_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(new Date(iso));
}

/** "08:00" as seen in `timeZone`, suitable for <input type="time">. */
export function civilTime(iso: string, timeZone = JOURNEY_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(iso));
}

/** Offset in minutes (east positive) of `timeZone` at an absolute instant. */
function offsetMinutesAt(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(new Date(instant));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const asUtc = Date.parse(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`,
  );
  return Math.round((asUtc - instant) / 60000);
}

function isoWithOffset(instant: number, timeZone: string): string {
  const offset = offsetMinutesAt(instant, timeZone);
  const local = new Date(instant + offset * 60000).toISOString().slice(0, 19);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${local}${sign}${hh}:${mm}`;
}

/**
 * Turns a civil date + time AT A STATION into an absolute instant, e.g.
 * London "2026-09-08" + "08:00" → "2026-09-08T08:00:00+01:00".
 *
 * The traveller means local civil time at that station, so the offset is
 * derived from the zone on that date (DST aware) – never from the browser or
 * server zone.
 *
 * DST policy:
 * - Ambiguous local times (autumn fall-back, e.g. 02:30 twice) resolve to the
 *   EARLIER occurrence, i.e. still in summer time.
 * - Nonexistent local times (spring forward, e.g. 02:30 when the clock jumps
 *   01:00 → 02:00) are normalized FORWARD by the gap, so the returned instant
 *   is the first real moment after the transition expressed in local time.
 */
export function civilToIso(date: string, time: string, timeZone = JOURNEY_TIME_ZONE): string {
  const naive = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(naive)) return `${date}T${time}:00`;
  // Probe the offsets in force on both sides of the requested moment so DST
  // transitions produce both candidate instants for the same local clock.
  const probes = [naive - 21600000, naive, naive + 21600000];
  const offsets = [...new Set(probes.map((p) => offsetMinutesAt(p, timeZone)))];
  const candidates = [...new Set(offsets.map((offset) => naive - offset * 60000))];
  const valid = candidates.filter(
    (instant) => instant + offsetMinutesAt(instant, timeZone) * 60000 === naive,
  );
  // Ambiguous → earliest valid instant. Nonexistent (none valid) → shift forward.
  const instant = valid.length > 0 ? Math.min(...valid) : Math.max(...candidates);

  return isoWithOffset(instant, timeZone);
}


/**
 * Calendar days between two instants from the traveller's perspective: the
 * civil date at the departure station versus the civil date at the arrival
 * station. That is what a "+1d" badge means on a printed ticket, and it keeps
 * an eastbound evening hop (Helsinki 23:30 EEST → Stockholm 23:45 CEST) on the
 * same day instead of inventing a rollover from UTC arithmetic.
 */
export function dayOffset(
  from: string,
  to: string,
  fromZone = JOURNEY_TIME_ZONE,
  toZone = fromZone,
): number {
  const dayA = Date.parse(`${civilDate(from, fromZone)}T12:00:00Z`);
  const dayB = Date.parse(`${civilDate(to, toZone)}T12:00:00Z`);
  return Math.round((dayB - dayA) / 86400000);
}

export function transferMinutes(journey: Journey): number[] {
  const transit = journey.legs.filter((l) => l.kind !== "walk");
  const gaps: number[] = [];
  for (let i = 1; i < transit.length; i += 1) {
    const prev = transit[i - 1]!;
    const next = transit[i]!;
    gaps.push(
      Math.round((new Date(next.departure).getTime() - new Date(prev.arrival).getTime()) / 60000),
    );
  }
  return gaps;
}

export function placeToString(place: Place): string {
  return `${place.name}|${place.place}`;
}

export function parsePlace(value: string | undefined): Place | null {
  if (!value) return null;
  const idx = value.lastIndexOf("|");
  if (idx < 1) return null;
  const name = value.slice(0, idx);
  const place = value.slice(idx + 1);
  if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?/.test(place)) return null;
  return { name, place };
}
