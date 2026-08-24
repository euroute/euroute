/**
 * URL encoding of travel style and journey preferences for the /sok route.
 * Booleans travel as a compact comma-separated flag list so the URL stays
 * readable and shareable.
 */

import {
  DEFAULT_PREFERENCES,
  TRAVEL_STYLES,
  type JourneyPreferences,
  type TravelStyle,
} from "./journey-intelligence";

const FLAGS: Record<string, keyof JourneyPreferences> = {
  night: "avoidNightTrains",
  overnight: "avoidOvernightTravel",
  stationchange: "avoidStationChange",
  direct: "preferDirect",
  highspeed: "preferHighSpeed",
  bus: "avoidBuses",
  stopover: "allowOvernightStop",
};

export function encodeFlags(prefs: JourneyPreferences): string {
  return Object.entries(FLAGS)
    .filter(([, key]) => prefs[key] === true)
    .map(([flag]) => flag)
    .join(",");
}

export function parseStyle(value: unknown): TravelStyle {
  const raw = String(value ?? "");
  return (TRAVEL_STYLES as readonly string[]).includes(raw) ? (raw as TravelStyle) : "recommended";
}

/** Reads preferences out of validated route search params. */
export function preferencesFromSearch(search: {
  minTransfer: number;
  maxTransfers: string;
  flags: string;
  maxPerDay: number;
}): JourneyPreferences {
  const active = new Set(search.flags.split(",").filter(Boolean));
  const prefs: JourneyPreferences = {
    ...DEFAULT_PREFERENCES,
    minTransferMinutes: Number.isFinite(search.minTransfer) ? search.minTransfer : 15,
    maxTransfers: search.maxTransfers === "any" ? null : Number(search.maxTransfers),
    maxTravelHoursPerDay: search.maxPerDay > 0 ? search.maxPerDay : null,
  };
  for (const [flag, key] of Object.entries(FLAGS)) {
    (prefs[key] as boolean) = active.has(flag);
  }
  if (prefs.maxTransfers !== null && !Number.isFinite(prefs.maxTransfers))
    prefs.maxTransfers = null;
  return prefs;
}

/** Number of changes we ask the timetable API for. */
export function apiMaxTransfers(prefs: JourneyPreferences): number {
  return prefs.maxTransfers === null ? 6 : prefs.maxTransfers;
}
