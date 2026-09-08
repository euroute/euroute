/**
 * Night-train classification: an itinerary earns the badge only when a real
 * rail leg operates through the local night.
 */

import { describe, expect, it } from "vitest";

import { journeyHasNightTrain, isNightTrainLeg, nightTrainLegs } from "./night-train";
import type { Journey, Leg } from "./journey";

const STOCKHOLM = "59.330000,18.058000";
const HAMBURG = "53.553000,10.006000";
const LONDON = "51.531000,-0.126000";
const PARIS = "48.880000,2.355000";

function leg(
  partial: Partial<Leg> & { departure: string; arrival: string },
): Leg {
  return {
    kind: "train",
    mode: "LONG_DISTANCE",
    modeLabel: "Train",
    fromName: "A",
    toName: "B",
    fromPlace: STOCKHOLM,
    toPlace: HAMBURG,
    durationMinutes: Math.round(
      (new Date(partial.arrival).getTime() - new Date(partial.departure).getTime()) / 60000,
    ),
    realTime: false,
    ...partial,
  };
}

/** Local Stockholm (CEST, +02:00) wall clock helper. */
const se = (date: string, time: string) => `${date}T${time}:00+02:00`;

function journey(legs: Leg[]): Journey {
  return {
    id: "j",
    departure: legs[0]!.departure,
    arrival: legs[legs.length - 1]!.arrival,
    durationMinutes: 0,
    transfers: Math.max(legs.filter((l) => l.kind !== "walk").length - 1, 0),
    legs,
    operators: [],
    hasNightLeg: true, // deliberately stale: must not influence the result
    chained: false,
  };
}

describe("single rail legs", () => {
  it("A. 08:00 → 16:00 (8 h) is not a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "08:00"), arrival: se("2026-09-08", "16:00") }))).toBe(false);
  });

  it("B. 18:00 → 23:30 (5 h 30) is not a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "18:00"), arrival: se("2026-09-08", "23:30") }))).toBe(false);
  });

  it("C. 23:30 → 05:30 (6 h) is a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "23:30"), arrival: se("2026-09-09", "05:30") }))).toBe(true);
  });

  it("D. 22:00 → 07:00 (9 h) is a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "22:00"), arrival: se("2026-09-09", "07:00") }))).toBe(true);
  });

  it("E. 01:00 → 05:30 (4 h 30) is a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "01:00"), arrival: se("2026-09-08", "05:30") }))).toBe(true);
  });

  it("F. 23:50 → 00:20 (30 min) is not a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "23:50"), arrival: se("2026-09-09", "00:20") }))).toBe(false);
  });

  it("I. long daytime rail 07:00 → 19:00 (12 h) is not a night train", () => {
    expect(isNightTrainLeg(leg({ departure: se("2026-09-08", "07:00"), arrival: se("2026-09-08", "19:00") }))).toBe(false);
  });

  it("H. an overnight bus never qualifies", () => {
    expect(
      isNightTrainLeg(
        leg({
          kind: "bus",
          mode: "BUS",
          departure: se("2026-09-08", "22:00"),
          arrival: se("2026-09-09", "06:00"),
        }),
      ),
    ).toBe(false);
  });

  it("an overnight ferry or metro leg never qualifies", () => {
    const window = { departure: se("2026-09-08", "22:00"), arrival: se("2026-09-09", "06:00") };
    expect(isNightTrainLeg(leg({ kind: "other", mode: "FERRY", ...window }))).toBe(false);
    expect(isNightTrainLeg(leg({ kind: "train", mode: "METRO", ...window }))).toBe(false);
    expect(isNightTrainLeg(leg({ kind: "walk", mode: "WALK", ...window }))).toBe(false);
  });

  it("a NIGHT_RAIL-labelled daytime leg still does not qualify", () => {
    expect(
      isNightTrainLeg(
        leg({ mode: "NIGHT_RAIL", departure: se("2026-09-08", "09:00"), arrival: se("2026-09-08", "18:00") }),
      ),
    ).toBe(false);
  });
});

describe("journey level", () => {
  it("G. train arrives 23:00, 7 h station wait, train departs 06:00 → no night train", () => {
    const j = journey([
      leg({ departure: se("2026-09-08", "17:00"), arrival: se("2026-09-08", "23:00") }),
      leg({ departure: se("2026-09-09", "06:00"), arrival: se("2026-09-09", "11:00") }),
    ]);
    expect(journeyHasNightTrain(j)).toBe(false);
  });

  it("J. Smart Overnight hotel split with daytime trains only → no night train", () => {
    const j = journey([
      leg({ departure: se("2026-09-08", "09:00"), arrival: se("2026-09-08", "17:30") }),
      leg({ departure: se("2026-09-09", "08:30"), arrival: se("2026-09-09", "16:00") }),
    ]);
    expect(journeyHasNightTrain(j)).toBe(false);
  });

  it("K. a journey containing a 22:00 → 07:00 rail leg is a night train", () => {
    const j = journey([
      leg({ departure: se("2026-09-08", "18:00"), arrival: se("2026-09-08", "21:30") }),
      leg({ departure: se("2026-09-08", "22:00"), arrival: se("2026-09-09", "07:00") }),
    ]);
    expect(journeyHasNightTrain(j)).toBe(true);
    expect(nightTrainLegs(j)).toHaveLength(1);
  });

  it("does not trust a stale hasNightLeg flag on a daytime itinerary", () => {
    const j = journey([leg({ departure: se("2026-09-08", "08:01"), arrival: se("2026-09-08", "16:30") })]);
    expect(j.hasNightLeg).toBe(true);
    expect(journeyHasNightTrain(j)).toBe(false);
  });
});

describe("L. cross-timezone legs", () => {
  it("London 20:30 → Paris 04:30 local counts as a night train", () => {
    // Departs 20:30 London (19:30Z), arrives 04:30 Paris (02:30Z) = 7 h.
    expect(
      isNightTrainLeg(
        leg({
          fromPlace: LONDON,
          toPlace: PARIS,
          departure: "2026-09-08T20:30:00+01:00",
          arrival: "2026-09-09T04:30:00+02:00",
        }),
      ),
    ).toBe(true);
  });

  it("London 08:01 → Paris 17:00 local is not a night train", () => {
    expect(
      isNightTrainLeg(
        leg({
          fromPlace: LONDON,
          toPlace: PARIS,
          departure: "2026-09-08T08:01:00+01:00",
          arrival: "2026-09-08T17:00:00+02:00",
        }),
      ),
    ).toBe(false);
  });

  it("Stockholm 22:15 → Hamburg 07:45 local counts as a night train", () => {
    expect(
      isNightTrainLeg(
        leg({
          fromPlace: STOCKHOLM,
          toPlace: HAMBURG,
          departure: "2026-09-08T22:15:00+02:00",
          arrival: "2026-09-09T07:45:00+02:00",
        }),
      ),
    ).toBe(true);
  });
});
