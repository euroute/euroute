import { describe, expect, it } from "vitest";

import { analyseJourneys, DEFAULT_PREFERENCES, primaryCategory } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

const DAY = "2026-09-08";

function iso(day: string, time: string): string {
  return `${day}T${time}:00+02:00`;
}

function leg(from: string, to: string, dep: string, arr: string, depDay = DAY, arrDay = DAY): Leg {
  return {
    kind: "train",
    mode: "LONG_DISTANCE",
    modeLabel: "Fjärrtåg",
    fromName: from,
    toName: to,
    departure: iso(depDay, dep),
    arrival: iso(arrDay, arr),
    durationMinutes: Math.round(
      (Date.parse(iso(arrDay, arr)) - Date.parse(iso(depDay, dep))) / 60000,
    ),
    operator: from,
    realTime: false,
  };
}

function journey(id: string, legs: Leg[]): Journey {
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  return {
    id,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: Math.round(
      (Date.parse(last.arrival) - Date.parse(first.departure)) / 60000,
    ),
    transfers: legs.length - 1,
    legs,
    operators: [...new Set(legs.map((l) => l.operator!))],
    hasNightLeg: false,
    chained: false,
  };
}

function rank(journeys: Journey[], style: "recommended" | "fastest" | "comfortable"): string[] {
  const analysis = analyseJourneys({ journeys, preferences: DEFAULT_PREFERENCES, style });
  return analysis.options.map((o) => o.journey.id);
}

/** A: direct, 11 h 21. B: 2 changes, 10 h 34 (47 min faster). */
const directSlow = journey("A", [leg("Stockholm", "Hamburg", "07:00", "18:21")]);
const indirectFast = journey("B", [
  leg("Stockholm", "Copenhagen", "07:10", "12:20"),
  leg("Copenhagen", "Puttgarden", "12:50", "15:10"),
  leg("Puttgarden", "Hamburg", "15:40", "17:44"),
]);

describe("Fastest profile", () => {
  it("TEST A: ranks the materially faster journey first even with more changes", () => {
    expect(rank([directSlow, indirectFast], "fastest")[0]).toBe("B");
  });

  it("TEST A: Comfortable prefers the direct journey", () => {
    expect(rank([directSlow, indirectFast], "comfortable")[0]).toBe("A");
  });

  it("TEST A: Recommended returns a legitimate balanced choice", () => {
    expect(["A", "B"]).toContain(rank([directSlow, indirectFast], "recommended")[0]);
  });

  it("TEST B: fastest picks 8 h 00 with risky changes, comfortable picks 8 h 10 direct", () => {
    // Three very tight (risky) connections of 5 minutes each.
    const risky = journey("R", [
      leg("Stockholm", "S1", "08:00", "10:00"),
      leg("S1", "S2", "10:05", "12:00"),
      leg("S2", "S3", "12:05", "14:00"),
      leg("S3", "Hamburg", "14:05", "16:00"),
    ]);
    const calm = journey("C", [leg("Stockholm", "Hamburg", "08:00", "16:10")]);
    expect(rank([risky, calm], "fastest")[0]).toBe("R");
    expect(rank([risky, calm], "comfortable")[0]).toBe("C");
  });

  it("TEST C: identical duration ties break on fewer transfers", () => {
    const direct = journey("D", [leg("Stockholm", "Hamburg", "09:00", "17:00")]);
    const withChange = journey("E", [
      leg("Stockholm", "Malmo", "09:00", "13:00"),
      leg("Malmo", "Hamburg", "13:30", "17:00"),
    ]);
    expect(rank([withChange, direct], "fastest")[0]).toBe("D");
  });

  it("TEST D: a long wait counts as elapsed time and must not win Fastest", () => {
    // Shorter onboard time (6 h) but 4 h wait → 10 h elapsed.
    const longWait = journey("W", [
      leg("Stockholm", "Malmo", "08:00", "11:00"),
      leg("Malmo", "Hamburg", "15:00", "18:00"),
    ]);
    // 9 h elapsed, all onboard.
    const straight = journey("S", [leg("Stockholm", "Hamburg", "08:00", "17:00")]);
    expect(rank([longWait, straight], "fastest")[0]).toBe("S");
  });

  it("TEST E: the primary label follows the active profile", () => {
    const set = [directSlow, indirectFast];
    for (const style of ["recommended", "fastest", "comfortable"] as const) {
      const analysis = analyseJourneys({ journeys: set, preferences: DEFAULT_PREFERENCES, style });
      expect(analysis.options[0]!.category).toBe(primaryCategory(style));
      expect(analysis.options[0]!.primary).toBe(true);
    }
    expect(primaryCategory("fastest")).toBe("fastest");
    expect(primaryCategory("comfortable")).toBe("mostComfortable");
    expect(primaryCategory("recommended")).toBe("recommended");
  });

  it("never labels the top card FASTEST unless it is the fastest journey", () => {
    const analysis = analyseJourneys({
      journeys: [directSlow, indirectFast],
      preferences: { ...DEFAULT_PREFERENCES, maxTransfers: 0 },
      style: "fastest",
    });
    const top = analysis.options[0]!;
    if (top.category === "fastest") {
      expect(top.journey.id).toBe("B");
    } else {
      expect(top.category).toBe("recommended");
    }
  });
});
