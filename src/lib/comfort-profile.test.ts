/**
 * Phase F4B — Comfortable profile semantics.
 *
 * Comfortable means the most passenger-friendly practical journey inside the
 * existing Comfortable time envelope: safety and friction first, time as a
 * guard against absurdly slow "comfortable" alternatives.
 */

import { describe, expect, it } from "vitest";

import { analyseJourneys, DEFAULT_PREFERENCES, type TravelStyle } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

const DAY = "2026-09-08";

function iso(day: string, time: string): string {
  return `${day}T${time}:00+02:00`;
}

type LegSpec = {
  from: string;
  to: string;
  dep: string;
  arr: string;
  depDay?: string;
  arrDay?: string;
  operator?: string;
};

function leg(spec: LegSpec): Leg {
  const depIso = iso(spec.depDay ?? DAY, spec.dep);
  const arrIso = iso(spec.arrDay ?? DAY, spec.arr);
  return {
    kind: "train",
    mode: "LONG_DISTANCE",
    modeLabel: "Fjärrtåg",
    fromName: spec.from,
    toName: spec.to,
    departure: depIso,
    arrival: arrIso,
    durationMinutes: Math.round((Date.parse(arrIso) - Date.parse(depIso)) / 60000),
    operator: spec.operator ?? "Operator",
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
    durationMinutes: Math.round((Date.parse(last.arrival) - Date.parse(first.departure)) / 60000),
    transfers: legs.length - 1,
    legs,
    operators: [...new Set(legs.map((l) => l.operator!))],
    hasNightLeg: false,
    chained: false,
  };
}

function analyse(journeys: Journey[], style: TravelStyle, requested?: string) {
  return analyseJourneys({
    journeys,
    preferences: DEFAULT_PREFERENCES,
    style,
    ...(requested ? { requestedDepartureIso: requested } : {}),
  });
}

function winner(journeys: Journey[], style: TravelStyle, requested?: string): string {
  return analyse(journeys, style, requested).options[0]!.journey.id;
}

const REQUESTED = iso(DAY, "08:00");

/** Risky by construction: 8-minute gaps that still clear the Phase E floor. */
function riskyJourney(id: string, dep: string, arr: string): Journey {
  return journey(id, [
    leg({ from: "A", to: "M1", dep, arr: "10:00", operator: "Op1" }),
    leg({ from: "M1", to: "M2", dep: "10:08", arr: "12:00", operator: "Op2" }),
    leg({ from: "M2", to: "M3", dep: "12:08", arr: "13:30", operator: "Op3" }),
    leg({ from: "M3", to: "B", dep: "13:38", arr: arr, operator: "Op4" }),
  ]);
}

/** Generous 45-minute connections: comfortable by construction. */
function safeJourney(id: string, dep: string, arr: string): Journey {
  return journey(id, [
    leg({ from: "A", to: "M1", dep, arr: "10:30" }),
    leg({ from: "M1", to: "B", dep: "11:15", arr }),
  ]);
}

describe("F4B — 1. safer journey wins Comfortable inside the time envelope", () => {
  const risky = riskyJourney("risky", "08:05", "15:00");
  const safe = safeJourney("safe", "08:10", "15:45");

  it("prefers the safer journey even though it arrives later", () => {
    expect(winner([risky, safe], "comfortable", REQUESTED)).toBe("safe");
  });

  it("states a truthful reason about safety", () => {
    const top = analyse([risky, safe], "comfortable", REQUESTED).options[0]!;
    expect(["reason.comfortSafeConnections", "reason.comfortFewerRisky"]).toContain(top.reason!.key);
  });
});

describe("F4B — 2. one fewer transfer cannot compensate for a risky connection", () => {
  const riskyFewer = journey("riskyFewer", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "11:00", operator: "Op1" }),
    leg({ from: "M1", to: "M2", dep: "11:08", arr: "13:30", operator: "Op2" }),
    leg({ from: "M2", to: "B", dep: "14:15", arr: "16:00", operator: "Op2" }),
  ]);
  const safeMore = journey("safeMore", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "10:30" }),
    leg({ from: "M1", to: "M2", dep: "11:20", arr: "13:00" }),
    leg({ from: "M2", to: "M3", dep: "13:50", arr: "14:40" }),
    leg({ from: "M3", to: "B", dep: "15:30", arr: "16:10" }),
  ]);

  it("prefers zero risky connections over fewer changes", () => {
    expect(winner([riskyFewer, safeMore], "comfortable", REQUESTED)).toBe("safeMore");
  });
});

describe("F4B — 3. fewer transfers wins when safety is equal", () => {
  const many = journey("many", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "09:30" }),
    leg({ from: "M1", to: "M2", dep: "10:15", arr: "11:30" }),
    leg({ from: "M2", to: "M3", dep: "12:15", arr: "13:30" }),
    leg({ from: "M3", to: "M4", dep: "14:15", arr: "15:00" }),
    leg({ from: "M4", to: "B", dep: "15:45", arr: "16:20" }),
  ]);
  const few = journey("few", [
    leg({ from: "A", to: "M1", dep: "08:05", arr: "11:30" }),
    leg({ from: "M1", to: "M2", dep: "12:15", arr: "14:30" }),
    leg({ from: "M2", to: "B", dep: "15:15", arr: "16:25" }),
  ]);

  it("prefers the journey with fewer changes", () => {
    expect(winner([many, few], "comfortable", REQUESTED)).toBe("few");
  });
});

describe("F4B — 4. faster journey wins when comfort is effectively equal", () => {
  const fast = safeJourney("fast", "08:00", "14:00");
  const slow = journey("slow", [
    leg({ from: "A", to: "M1", dep: "08:05", arr: "10:30" }),
    leg({ from: "M1", to: "B", dep: "11:15", arr: "15:00" }),
  ]);

  it("prefers the materially faster of two equally comfortable journeys", () => {
    expect(winner([fast, slow], "comfortable", REQUESTED)).toBe("fast");
  });
});

describe("F4B — 5. a safer journey outside the envelope does not win", () => {
  const practical = journey("practical", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "11:00", operator: "Op1" }),
    leg({ from: "M1", to: "B", dep: "11:25", arr: "14:00", operator: "Op2" }),
  ]);
  const veryLateSafe = safeJourney("veryLateSafe", "08:05", "22:00");

  it("keeps the practical journey when the safer one is far outside the budget", () => {
    expect(winner([practical, veryLateSafe], "comfortable", REQUESTED)).toBe("practical");
  });
});

describe("F4B — 6. station-change burden matters", () => {
  const withStationChange = journey("stationChange", [
    leg({ from: "A", to: "City Nord", dep: "08:00", arr: "11:00" }),
    leg({ from: "City Syd", to: "B", dep: "12:00", arr: "15:00" }),
  ]);
  const sameStation = journey("sameStation", [
    leg({ from: "A", to: "City Nord", dep: "08:05", arr: "11:05" }),
    leg({ from: "City Nord", to: "B", dep: "12:00", arr: "15:05" }),
  ]);

  it("prefers the journey without a station change", () => {
    expect(winner([withStationChange, sameStation], "comfortable", REQUESTED)).toBe("sameStation");
  });
});

describe("F4B — 7. a long dead wait counts against Comfortable", () => {
  // 4 h 30 wait, one change — survives F1.5 but is not comfortable.
  const longWait = journey("longWait", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "10:00" }),
    leg({ from: "M1", to: "B", dep: "14:30", arr: "16:00" }),
  ]);
  const steady = journey("steady", [
    leg({ from: "A", to: "M1", dep: "08:05", arr: "10:30" }),
    leg({ from: "M1", to: "M2", dep: "11:20", arr: "13:30" }),
    leg({ from: "M2", to: "B", dep: "14:20", arr: "16:05" }),
  ]);

  it("does not reward a long wait just because it means fewer changes", () => {
    expect(winner([longWait, steady], "comfortable", REQUESTED)).toBe("steady");
  });
});

describe("F4B — 8. direct journey sanity", () => {
  const direct = journey("direct", [leg({ from: "A", to: "B", dep: "08:10", arr: "12:30" })]);
  const changes = journey("changes", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "10:00" }),
    leg({ from: "M1", to: "B", dep: "10:45", arr: "12:15" }),
  ]);

  it("keeps a normal direct train as the Comfortable winner", () => {
    expect(winner([direct, changes], "comfortable", REQUESTED)).toBe("direct");
  });

  it("says so truthfully", () => {
    const top = analyse([direct, changes], "comfortable", REQUESTED).options[0]!;
    expect(["reason.direct", "reason.comfortDirect"]).toContain(top.reason!.key);
  });
});

describe("F4B — 9. deterministic tie-break", () => {
  const a = safeJourney("a", "08:00", "14:00");
  const b = safeJourney("b", "08:00", "14:00");

  it("returns the same winner on repeated runs", () => {
    const runs = new Set(
      Array.from({ length: 5 }, () => winner([a, b], "comfortable", REQUESTED)),
    );
    expect(runs.size).toBe(1);
  });
});

describe("F4B — 10/11. other profiles are untouched", () => {
  const risky = riskyJourney("risky", "08:05", "15:00");
  const safe = safeJourney("safe", "08:10", "15:45");
  const set = [risky, safe];

  it("Recommended still ranks by the balanced Euroute Score, not by friction order", () => {
    const analysis = analyse(set, "recommended", REQUESTED);
    const visible = [...analysis.options, ...analysis.more];
    const bestScore = Math.max(...visible.map((i) => i.score));
    expect(analysis.options[0]!.score).toBe(bestScore);
  });

  it("Fastest still ranks by earliest arrival", () => {
    expect(winner(set, "fastest", REQUESTED)).toBe("risky");
  });
});
