// Delade typer och hjälpfunktioner för reseplanering. Client-safe.

export type Place = {
  /** "lat,lon" i MOTIS-format */
  place: string;
  name: string;
  country?: string | undefined;
};

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

/** "tis 22 sep" for one day, "tis 22 sep – ons 23 sep" across several. */
export function formatDayRange(
  fromIso: string,
  toIso: string,
  lang: "sv" | "en" = "sv",
  timeZone = "Europe/Stockholm",
): string {
  const from = formatDay(fromIso, lang, timeZone);
  const to = formatDay(toIso, lang, timeZone);
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

/**
 * Turns a civil date + time into an absolute instant with the correct offset
 * for that date in `timeZone` (so DST is handled), e.g.
 * "2026-06-01T08:00:00+02:00".
 */
export function civilToIso(date: string, time: string, timeZone = JOURNEY_TIME_ZONE): string {
  const naive = Date.parse(`${date}T${time}:00Z`);
  if (Number.isNaN(naive)) return `${date}T${time}:00`;
  // Measure the zone's offset by formatting the naive instant in that zone.
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(new Date(naive));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const asUtc = Date.parse(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`,
  );
  const offsetMinutes = Math.round((asUtc - naive) / 60000);
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${date}T${time}:00${sign}${hh}:${mm}`;
}

export function dayOffset(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  const dayA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const dayB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
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
