/**
 * Phase F2 — departure-aware ranking fixtures.
 *
 * Profiles must answer three different traveller questions:
 *   Recommended – best overall journey within a bounded arrival penalty
 *   Fastest     – earliest realistic arrival among catchable journeys
 *   Comfortable – easiest journey within a wider but bounded penalty
 */

import { describe, expect, it } from "vitest";

import { analyseJourneys, DEFAULT_PREFERENCES, type TravelStyle } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

const DAY = "2026-09-08";
const NEXT = "2026-09-09";

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
    operator: "Operator",
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
    operators: ["Operator"],
    hasNightLeg: false,
    chained: false,
  };
}

function winner(journeys: Journey[], style: TravelStyle, requested?: string): string {
  const analysis = analyseJourneys({
    journeys,
    preferences: DEFAULT_PREFERENCES,
    style,
    ...(requested ? { requestedDepartureIso: requested } : {}),
  });
  return analysis.options[0]!.journey.id;
}

function visibleIds(journeys: Journey[], style: TravelStyle, requested?: string): string[] {
  const analysis = analyseJourneys({
    journeys,
    preferences: DEFAULT_PREFERENCES,
    style,
    ...(requested ? { requestedDepartureIso: requested } : {}),
  });
  return [...analysis.options.map((o) => o.journey.id), ...analysis.more.map((m) => m.journey.id)];
}

/** Direct journey Stockholm → Göteborg leaving at the given time. */
function sthGot(id: string, dep: string, arr: string): Journey {
  return journey(id, [leg({ from: "Stockholm C", to: "Göteborg C", dep, arr })]);
}

describe("FIXTURE 1 — Stockholm → Göteborg, several direct departures", () => {
  const set = [
    sthGot("0817", "08:17", "11:22"),
    sthGot("0958", "09:58", "13:05"),
    sthGot("1017", "10:17", "13:20"),
    sthGot("1117", "11:17", "14:25"),
  ];
  const requested = iso(DAY, "08:00");

  it("recommends the first sensible departure after the requested time", () => {
    expect(winner(set, "recommended", requested)).toBe("0817");
  });

  it("fastest is the earliest arrival, not merely the shortest duration", () => {
    expect(winner(set, "fastest", requested)).toBe("0817");
  });

  it("keeps every later departure visible", () => {
    expect(visibleIds(set, "recommended", requested).sort()).toEqual([
      "0817",
      "0958",
      "1017",
      "1117",
    ]);
  });
});

describe("FIXTURE 2 — London → Firenze production shape", () => {
  // 12:01 → 11:24+1 (~22 h 23), 3 changes.
  const slowFewerChanges = journey("slow", [
    leg({ from: "London", to: "Paris", dep: "12:01", arr: "15:20" }),
    leg({ from: "Paris", to: "Milano", dep: "16:20", arr: "23:10" }),
    leg({ from: "Milano", to: "Bologna", dep: "07:00", arr: "09:05", depDay: NEXT, arrDay: NEXT }),
    leg({ from: "Bologna", to: "Firenze", dep: "10:20", arr: "11:24", depDay: NEXT, arrDay: NEXT }),
  ]);
  // 13:31 → 08:04+1 (~17 h 33), 4 changes.
  const fastMoreChanges = journey("fast", [
    leg({ from: "London", to: "Paris", dep: "13:31", arr: "16:50" }),
    leg({ from: "Paris", to: "Zürich", dep: "17:50", arr: "21:55" }),
    leg({ from: "Zürich", to: "Milano", dep: "22:40", arr: "02:10", arrDay: NEXT }),
    leg({ from: "Milano", to: "Bologna", dep: "05:00", arr: "07:00", depDay: NEXT, arrDay: NEXT }),
    leg({ from: "Bologna", to: "Firenze", dep: "07:20", arr: "08:04", depDay: NEXT, arrDay: NEXT }),
  ]);
  const set = [slowFewerChanges, fastMoreChanges];
  const requested = iso(DAY, "12:00");

  it("does not accept a ~3 h later arrival for one fewer change", () => {
    expect(winner(set, "recommended", requested)).toBe("fast");
  });

  it("fastest picks the earliest arrival", () => {
    expect(winner(set, "fastest", requested)).toBe("fast");
  });

  it("comfortable stays bounded in time", () => {
    const analysis = analyseJourneys({
      journeys: set,
      preferences: DEFAULT_PREFERENCES,
      style: "comfortable",
      requestedDepartureIso: requested,
    });
    // Whatever wins, it must still be one of the usable journeys and the
    // slower one may only win when its arrival penalty is inside the budget.
    const top = analysis.options[0]!;
    expect(["fast", "slow"]).toContain(top.journey.id);
    expect(top.journey.id).toBe("fast");
  });
});

describe("FIXTURE 3 — Stockholm → Firenze long route stays stable", () => {
  const long = journey("long", [
    leg({ from: "Stockholm", to: "Hamburg", dep: "07:00", arr: "18:30" }),
    leg({ from: "Hamburg", to: "Basel", dep: "19:30", arr: "05:00", arrDay: NEXT }),
    leg({ from: "Basel", to: "Firenze", dep: "06:30", arr: "12:10", depDay: NEXT, arrDay: NEXT }),
  ]);
  const alternative = journey("alt", [
    leg({ from: "Stockholm", to: "København", dep: "08:00", arr: "13:20" }),
    leg({ from: "København", to: "München", dep: "14:20", arr: "23:59" }),
    leg({ from: "München", to: "Firenze", dep: "07:30", arr: "15:40", depDay: NEXT, arrDay: NEXT }),
  ]);

  it("keeps a usable long-route ranking", () => {
    const ids = visibleIds([long, alternative], "recommended", iso(DAY, "07:00"));
    expect(ids).toContain("long");
    expect(ids).toContain("alt");
    expect(winner([long, alternative], "recommended", iso(DAY, "07:00"))).toBe("long");
  });
});

describe("FIXTURE 4 — direct vs transfer", () => {
  const direct = journey("direct", [leg({ from: "A", to: "B", dep: "08:15", arr: "12:00" })]);
  const withTransfers = journey("transfers", [
    leg({ from: "A", to: "M1", dep: "08:20", arr: "09:40" }),
    leg({ from: "M1", to: "M2", dep: "10:10", arr: "10:50" }),
    leg({ from: "M2", to: "B", dep: "11:20", arr: "11:45" }),
  ]);
  const set = [direct, withTransfers];
  const requested = iso(DAY, "08:00");

  it("fastest = earliest arrival", () => {
    expect(winner(set, "fastest", requested)).toBe("transfers");
  });

  it("recommended may keep the direct journey", () => {
    expect(winner(set, "recommended", requested)).toBe("direct");
  });

  it("comfortable keeps the direct journey", () => {
    expect(winner(set, "comfortable", requested)).toBe("direct");
  });
});

describe("FIXTURE 5 — extreme comfort trade-off", () => {
  const twoSafeChanges = journey("fast2", [
    leg({ from: "A", to: "M1", dep: "08:00", arr: "10:30" }),
    leg({ from: "M1", to: "M2", dep: "11:10", arr: "13:30" }),
    leg({ from: "M2", to: "B", dep: "14:10", arr: "16:00" }),
  ]);
  const slowDirect = journey("slowdirect", [
    leg({ from: "A", to: "B", dep: "08:10", arr: "22:00" }),
  ]);

  it("comfortable does not pick a 6 h slower journey just because it is direct", () => {
    expect(winner([twoSafeChanges, slowDirect], "comfortable", iso(DAY, "08:00"))).toBe("fast2");
  });
});

describe("FIXTURE 6 — later but much better", () => {
  const earlySlow = journey("earlyslow", [
    leg({ from: "A", to: "M1", dep: "08:05", arr: "11:00" }),
    leg({ from: "M1", to: "M2", dep: "12:00", arr: "15:00" }),
    leg({ from: "M2", to: "B", dep: "16:00", arr: "18:00" }),
  ]);
  const laterBetter = journey("laterbetter", [
    leg({ from: "A", to: "M1", dep: "08:45", arr: "11:30" }),
    leg({ from: "M1", to: "B", dep: "12:10", arr: "14:00" }),
  ]);
  const set = [earlySlow, laterBetter];
  const requested = iso(DAY, "08:00");

  it("wins Recommended despite departing later", () => {
    expect(winner(set, "recommended", requested)).toBe("laterbetter");
  });

  it("wins Fastest", () => {
    expect(winner(set, "fastest", requested)).toBe("laterbetter");
  });
});

describe("FIXTURE 7 — candidate departing before the requested time", () => {
  const early = sthGot("0715", "07:15", "10:20");
  const requestedDeparture = sthGot("0817", "08:17", "11:22");
  const set = [early, requestedDeparture];
  const requested = iso(DAY, "08:00");

  it("never wins a profile, because the traveller cannot catch it", () => {
    for (const style of ["recommended", "fastest", "comfortable"] as const) {
      expect(winner(set, style, requested)).toBe("0817");
    }
  });

  it("remains visible in the results", () => {
    expect(visibleIds(set, "recommended", requested)).toContain("0715");
  });

  it("can win again when no departure time is supplied", () => {
    expect(winner(set, "fastest")).toBe("0715");
  });
});
