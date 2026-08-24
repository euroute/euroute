/**
 * A trip the visitor tried to save while signed out. Kept in sessionStorage so
 * the plan survives the trip to the sign-in page and is saved automatically
 * once the session exists. Client-only.
 */

import { planSegments, planTitle, type TripPlan } from "./trip-plan";

const KEY = "euroute.pending-trip";

export type TripSaveInput = {
  title: string;
  fromName: string;
  toName: string;
  departAt: string | null;
  arriveAt: string | null;
  itinerary: TripPlan;
  aiNote: string | null;
  travelStyle: string;
  isOvernight: boolean;
  overnightCities: string[];
  travelDays: number;
  changes: number;
  durationMinutes: number | null;
  eurouteScore: number | null;
  searchParams: Record<string, unknown>;
};

export function buildSaveInput(
  plan: TripPlan,
  searchParams: Record<string, unknown> = {},
): TripSaveInput {
  return {
    title: planTitle(plan),
    fromName: plan.fromName,
    toName: plan.toName,
    departAt: plan.departAt,
    arriveAt: plan.arriveAt,
    itinerary: plan,
    aiNote: null,
    travelStyle: plan.style,
    isOvernight: plan.isOvernight,
    overnightCities: plan.stays.map((stay) => stay.city),
    travelDays: plan.travelDays,
    changes: plan.changes,
    durationMinutes: Math.round(plan.durationMinutes),
    eurouteScore: plan.score === null ? null : Math.round(plan.score),
    searchParams,
  };
}

export function segmentCount(plan: TripPlan): number {
  return planSegments(plan).length;
}

export function storePendingTrip(input: TripSaveInput): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(input));
  } catch {
    /* storage unavailable – the user can simply save again after signing in */
  }
}

export function takePendingTrip(): TripSaveInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as TripSaveInput;
  } catch {
    return null;
  }
}

export function hasPendingTrip(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
