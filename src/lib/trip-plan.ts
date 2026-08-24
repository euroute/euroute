/**
 * Trip snapshots. A saved trip must stay readable even when the timetable
 * source no longer returns the same result, so everything the trip page needs
 * is stored verbatim: travel days, legs, overnight stays and booking segments.
 *
 * Client-safe.
 */

import { bookingTargetForLeg, operatorTargetForLeg, retailerTargetForLeg } from "./operators";
import { formatDuration, type Journey, type Leg } from "./journey";
import { type OvernightPlan } from "./overnight";
import { cityLabel } from "./station-name";
import type { JourneyOption, TravelStyle } from "./journey-intelligence";

export const TRIP_PLAN_VERSION = 1 as const;

/** A bookable stretch: contiguous legs operated by the same company. */
export type TripSegment = {
  /** Stable identifier used for booking status. */
  key: string;
  day: number;
  fromName: string;
  toName: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  operator: string | null;
  operatorLabel: string | null;
  operatorUrl: string | null;
  modeLabel: string;
  trainNames: string[];
  /** Number of trains inside the segment (a change without a new ticket). */
  legCount: number;
  /** Pre-filled timetable/booking search for the whole segment. */
  bookingUrl: string;
  retailerUrl: string;
};

export type TripDay = {
  day: number;
  fromName: string;
  toName: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  changes: number;
  journey: Journey;
  segments: TripSegment[];
};

export type TripStay = {
  city: string;
  station: string;
  arrival: string;
  departure: string;
  nights: number;
};

export type TripPlan = {
  version: typeof TRIP_PLAN_VERSION;
  fromName: string;
  toName: string;
  departAt: string;
  arriveAt: string;
  /** Total travel time (sum of the travel days). */
  durationMinutes: number;
  /** First departure to final arrival, nights included. */
  elapsedMinutes: number;
  changes: number;
  travelDays: number;
  isOvernight: boolean;
  style: TravelStyle;
  score: number | null;
  minTransferMinutes: number;
  days: TripDay[];
  stays: TripStay[];
  savedAt: string;
};

function mergeLegs(legs: Leg[]): Leg {
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  return {
    ...first,
    toName: last.toName,
    toPlace: last.toPlace,
    arrival: last.arrival,
    durationMinutes: Math.round(
      (new Date(last.arrival).getTime() - new Date(first.departure).getTime()) / 60000,
    ),
  };
}

function transit(journey: Journey): Leg[] {
  return journey.legs.filter((leg) => leg.kind !== "walk");
}

/**
 * Splits a travel day into bookable parts. Euroute makes ONE booking action per
 * train leg: several trains can sometimes be bought on one ticket, but that is
 * not something we can verify from timetable data alone – the same operator
 * running two consecutive trains is no evidence of a single ticket. Grouping is
 * therefore only allowed when a verified combined booking flow exists, which is
 * not the case today.
 */
export function segmentsForDay(journey: Journey, day: number): TripSegment[] {
  const legs = transit(journey);

  return legs.map((leg, index) => {
    const merged = mergeLegs([leg]);
    const operatorTarget = operatorTargetForLeg(merged);
    return {
      key: `d${day}s${index + 1}`,
      day,
      fromName: merged.fromName,
      toName: merged.toName,
      departure: merged.departure,
      arrival: merged.arrival,
      durationMinutes: merged.durationMinutes,
      operator: merged.operator ?? null,
      operatorLabel: operatorTarget?.label ?? null,
      operatorUrl: operatorTarget?.url ?? null,
      modeLabel: merged.modeLabel,
      trainNames: [merged.trainName ?? merged.modeLabel].filter(Boolean),
      legCount: 1,
      bookingUrl: bookingTargetForLeg(merged).url,
      retailerUrl: retailerTargetForLeg(merged).url,
    };
  });
}


function dayFromJourney(journey: Journey, day: number): TripDay {
  const legs = transit(journey);
  const first = legs[0] ?? journey.legs[0]!;
  const last = legs[legs.length - 1] ?? journey.legs[journey.legs.length - 1]!;
  return {
    day,
    fromName: first.fromName,
    toName: last.toName,
    departure: journey.departure,
    arrival: journey.arrival,
    durationMinutes: journey.durationMinutes,
    changes: Math.max(0, legs.length - 1),
    journey,
    segments: segmentsForDay(journey, day),
  };
}

function elapsed(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
}

/** Snapshot of a single-day journey option. */
export function tripPlanFromOption(args: {
  option: JourneyOption;
  style: TravelStyle;
  minTransferMinutes: number;
}): TripPlan {
  const { option } = args;
  const day = dayFromJourney(option.journey, 1);
  return {
    version: TRIP_PLAN_VERSION,
    fromName: day.fromName,
    toName: day.toName,
    departAt: option.journey.departure,
    arriveAt: option.journey.arrival,
    durationMinutes: option.journey.durationMinutes,
    elapsedMinutes: elapsed(option.journey.departure, option.journey.arrival),
    changes: day.changes,
    travelDays: 1,
    isOvernight: false,
    style: args.style,
    score: option.score,
    minTransferMinutes: args.minTransferMinutes,
    days: [day],
    stays: [],
    savedAt: new Date().toISOString(),
  };
}

/** Snapshot of a multi-day plan with overnight stops. */
export function tripPlanFromOvernight(args: {
  plan: OvernightPlan;
  style: TravelStyle;
  minTransferMinutes: number;
  score?: number | null;
}): TripPlan {
  const days = args.plan.days.map((journey, index) => dayFromJourney(journey, index + 1));
  const firstDay = days[0]!;
  const lastDay = days[days.length - 1]!;

  return {
    version: TRIP_PLAN_VERSION,
    fromName: firstDay.fromName,
    toName: lastDay.toName,
    departAt: firstDay.departure,
    arriveAt: lastDay.arrival,
    durationMinutes: args.plan.travelMinutes,
    elapsedMinutes: args.plan.elapsedMinutes,
    changes: args.plan.changes,
    travelDays: days.length,
    isOvernight: true,
    style: args.style,
    score: args.score ?? null,
    minTransferMinutes: args.minTransferMinutes,
    days,
    stays: args.plan.stays.map((stay) => ({
      city: cityLabel(stay.station),
      station: stay.station,
      arrival: stay.arrival,
      departure: stay.departure,
      nights: stay.nights,
    })),
    savedAt: new Date().toISOString(),
  };
}

export function planSegments(plan: TripPlan): TripSegment[] {
  return plan.days.flatMap((day) => day.segments);
}

export function planTitle(plan: TripPlan): string {
  return `${cityLabel(plan.fromName)} → ${cityLabel(plan.toName)}`;
}

export function planDurationLabel(plan: TripPlan): string {
  return formatDuration(plan.durationMinutes);
}
