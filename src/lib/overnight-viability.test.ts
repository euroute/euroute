import { describe, expect, it } from "vitest";

import { journeyFacts, type JourneyPreferences } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";
import {
  buildOvernightPlan,
  journeyFromLegs,
  overnightConfidence,
  overnightMode,
  type OvernightPlan,
} from "./overnight";
import { requestedViability } from "./overnight-viability";
import { tripPlanFromOvernight } from "./trip-plan";

/** Local Europe/Stockholm wall-clock (September, CEST) with explicit offset. */
const t = (day: number, hhmm: string) =>
  `2026-09-${String(day).padStart(2, "0")}T${hhmm}:00+02:00`;

const leg = (args: {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  kind?: Leg["kind"];
}): Leg => ({
  kind: args.kind ?? "train",
  mode: "HIGHSPEED_RAIL",
  modeLabel: "Tåg",
  fromName: args.from,
  toName: args.to,
  // Central European coordinates so local civil time is CEST in these fixtures.
  fromPlace: "59.330,18.058",
  toPlace: "52.520,13.405",
  departure: args.departure,
  arrival: args.arrival,
  durationMinutes: Math.round(
    (new Date(args.arrival).getTime() - new Date(args.departure).getTime()) / 60000,
  ),
  operator: "OP",
  realTime: false,
});

const prefs: JourneyPreferences = {
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

function journey(id: string, legs: Leg[]): Journey {
  return journeyFromLegs(legs, id);
}

/** A continuous itinerary of one long leg, used as the comparison base. */
function baseJourney(args: { from: string; to: string; departure: string; arrival: string }) {
  return journey("base", [leg(args)]);
}

function plan(args: {
  base: Journey;
  station: string;
  day1: Journey;
  day2: Journey;
  mode?: "recommended" | "requested";
}): OvernightPlan {
  return buildOvernightPlan({
    days: [args.day1, args.day2],
    stays: [
      {
        station: args.station,
        place: "52.520,13.405",
        arrival: args.day1.arrival,
        departure: args.day2.departure,
      },
    ],
    base: args.base,
    baseFacts: journeyFacts(args.base, prefs.minTransferMinutes),
    preferences: prefs,
    ...(args.mode ? { mode: args.mode } : {}),
  });
}

/* ------------------------------------------------------------------ *
 * Named regression fixtures (deterministic; shapes from the live audit)
 * ------------------------------------------------------------------ */

const sthlmFirenzeBase = baseJourney({
  from: "Stockholm C",
  to: "Firenze S.M.N.",
  departure: t(8, "08:00"),
  arrival: t(9, "14:17"), // 30 h 17 min continuous
});

const londonFirenzeBase = baseJourney({
  from: "London St Pancras",
  to: "Firenze S.M.N.",
  departure: t(8, "08:00"),
  arrival: t(8, "22:00"), // 14 h continuous, same day
});

const wienRomaBase = baseJourney({
  from: "Wien Hbf",
  to: "Roma Termini",
  departure: t(8, "08:00"),
  arrival: t(8, "20:30"), // 12 h 30 min continuous, same day
});

const hamburgSplit = () =>
  plan({
    base: sthlmFirenzeBase,
    station: "Hamburg Hbf",
    day1: journey("d1", [
      leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:27") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(9, "20:55") }),
    ]),
    mode: "requested",
  });

const copenhagenSplit = () =>
  plan({
    base: sthlmFirenzeBase,
    station: "København H",
    day1: journey("d1", [
      leg({ from: "Stockholm C", to: "København H", departure: t(8, "08:00"), arrival: t(8, "13:30") }),
    ]),
    day2: journey("d2", [
      leg({ from: "København H", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(10, "08:40") }),
    ]),
    mode: "requested",
  });

const baselFromStockholmSplit = () =>
  plan({
    base: sthlmFirenzeBase,
    station: "Basel SBB",
    day1: journey("d1", [
      leg({ from: "Stockholm C", to: "Basel SBB", departure: t(8, "08:00"), arrival: t(9, "05:38") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Basel SBB", to: "Firenze S.M.N.", departure: t(10, "07:38"), arrival: t(10, "15:00") }),
    ]),
    mode: "requested",
  });

const parisSplit = () =>
  plan({
    base: londonFirenzeBase,
    station: "Paris Nord",
    day1: journey("d1", [
      leg({ from: "London St Pancras", to: "Paris Nord", departure: t(8, "16:00"), arrival: t(8, "18:29") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Paris Nord", to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "20:00") }),
    ]),
    mode: "requested",
  });

const baselFromLondonSplit = () =>
  plan({
    base: londonFirenzeBase,
    station: "Basel SBB",
    day1: journey("d1", [
      leg({ from: "London St Pancras", to: "Basel SBB", departure: t(8, "08:00"), arrival: t(8, "15:08") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Basel SBB", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(9, "18:00") }),
    ]),
    mode: "requested",
  });

const bolognaSplit = () =>
  plan({
    base: wienRomaBase,
    station: "Bologna Centrale",
    day1: journey("d1", [
      leg({ from: "Wien Hbf", to: "Bologna Centrale", departure: t(8, "08:00"), arrival: t(8, "18:16") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Bologna Centrale", to: "Roma Termini", departure: t(9, "06:10"), arrival: t(9, "08:13") }),
    ]),
    mode: "requested",
  });

/* ------------------------------------------------------------------ *
 * Phase A — mode
 * ------------------------------------------------------------------ */

describe("Phase A: explicit overnight mode", () => {
  it("1. a proactively built plan is mode 'recommended'", () => {
    const p = plan({ ...hamburgArgs(), mode: "recommended" });
    expect(p.mode).toBe("recommended");
    expect(overnightMode(p)).toBe("recommended");
  });

  it("2. a requested plan is mode 'requested'", () => {
    expect(hamburgSplit().mode).toBe("requested");
    expect(overnightMode(hamburgSplit())).toBe("requested");
  });

  it("3. a legacy plan without `mode` reads as 'recommended' and still loads", () => {
    const legacy = { ...hamburgSplit() } as OvernightPlan & { mode?: unknown };
    delete legacy.mode;
    expect(overnightMode(legacy as OvernightPlan)).toBe("recommended");
    const snapshot = tripPlanFromOvernight({
      plan: legacy as OvernightPlan,
      style: "recommended",
      minTransferMinutes: 15,
    });
    expect(snapshot.travelDays).toBe(2);
    expect((legacy as OvernightPlan).mode).toBeUndefined(); // never mutated
  });
});

function hamburgArgs() {
  return {
    base: sthlmFirenzeBase,
    station: "Hamburg Hbf",
    day1: journey("d1", [
      leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:27") }),
    ]),
    day2: journey("d2", [
      leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(9, "20:55") }),
    ]),
  };
}

/* ------------------------------------------------------------------ *
 * Comparative gates vs viability
 * ------------------------------------------------------------------ */

describe("comparative gates", () => {
  const args = (requested: boolean) => ({
    plan: bolognaSplit(),
    base: wienRomaBase,
    baseFacts: journeyFacts(wienRomaBase, prefs.minTransferMinutes),
    preferences: prefs,
    style: "recommended" as const,
    requested,
  });

  it("4. requested bypasses the comparative improvement gate", () => {
    expect(overnightConfidence(args(false)).confidence).toBe("weak");
    expect(overnightConfidence(args(true)).confidence).toBe("alternative");
  });

  it("16. a requested plan is never labelled 'strong' (recommended semantics intact)", () => {
    expect(overnightConfidence(args(true)).confidence).not.toBe("strong");
  });

  it("5. requested does NOT bypass viability", () => {
    expect(overnightConfidence({ ...args(true), plan: parisSplit() }).confidence).toBe(
      "alternative",
    );
    // ...but viability refuses it, which is what the server now gates on.
    expect(requestedViability({ plan: parisSplit(), base: londonFirenzeBase }).viable).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Phase B — viability rules
 * ------------------------------------------------------------------ */

describe("Phase B: requested viability rules", () => {
  it("6. arrival after 00:30 is rejected", () => {
    const p = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(9, "02:00") }),
      ]),
      day2: journey("d2", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "11:30"), arrival: t(9, "23:00") }),
      ]),
      mode: "requested",
    });
    const v = requestedViability({ plan: p, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("arrivalTooLate");
  });

  it("7. a rest window shorter than 9 h is rejected", () => {
    const p = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:27") }),
      ]),
      day2: journey("d2", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "01:00"), arrival: t(9, "14:00") }),
      ]),
      mode: "requested",
    });
    const v = requestedViability({ plan: p, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("restTooShort");
  });

  it("8. a rest window longer than 20 h is rejected", () => {
    const v = requestedViability({ plan: baselFromStockholmSplit(), base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("restTooLong");
  });

  it("9. an insufficient day 1 is rejected", () => {
    const v = requestedViability({ plan: parisSplit(), base: londonFirenzeBase });
    expect(v.reasons).toContain("insufficientDay1");
  });

  it("10. an extreme day 1 is rejected", () => {
    const v = requestedViability({ plan: baselFromStockholmSplit(), base: sthlmFirenzeBase });
    expect(v.reasons).toContain("extremeTravelDay");
    expect(baselFromStockholmSplit().dayStats[0]!.burden).toBe("extreme");
  });

  it("11. an extreme day 2 is rejected", () => {
    const v = requestedViability({ plan: copenhagenSplit(), base: sthlmFirenzeBase });
    expect(copenhagenSplit().dayStats[1]!.burden).toBe("extreme");
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("extremeTravelDay");
  });

  it("12. a veryLong day is allowed, with a warning", () => {
    const p = hamburgSplit();
    expect(p.dayStats.some((d) => d.burden === "veryLong")).toBe(true);
    const v = requestedViability({ plan: p, base: sthlmFirenzeBase });
    expect(v.viable).toBe(true);
    expect(v.warnings).toContain("veryLongTravelDay");
  });

  it("13. both days must contain a real rail journey", () => {
    const p = plan({
      base: wienRomaBase,
      station: "Bologna Centrale",
      day1: journey("d1", [
        leg({
          from: "Wien Hbf",
          to: "Bologna Centrale",
          departure: t(8, "08:00"),
          arrival: t(8, "18:16"),
        }),
      ]),
      day2: journey("d2", [
        leg({
          from: "Bologna Centrale",
          to: "Roma Termini",
          departure: t(9, "06:10"),
          arrival: t(9, "08:13"),
          kind: "bus",
        }),
      ]),
      mode: "requested",
    });
    const v = requestedViability({ plan: p, base: wienRomaBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("missingRailDay");
  });

  it("14. the traveller's own city is evaluated, never replaced", () => {
    const p = bolognaSplit();
    expect(p.stays[0]!.station).toBe("Bologna Centrale");
    expect(requestedViability({ plan: p, base: wienRomaBase }).viable).toBe(true);
    expect(p.stays[0]!.station).toBe("Bologna Centrale");
  });

  it("15. a requested plan slower than continuous can still be viable", () => {
    const p = baselFromLondonSplit();
    expect(p.addedElapsedMinutes).toBeGreaterThan(0);
    expect(requestedViability({ plan: p, base: londonFirenzeBase }).viable).toBe(true);
  });

  it("night travel is warned about, never rejected", () => {
    const v = requestedViability({ plan: hamburgSplit(), base: sthlmFirenzeBase });
    expect(v.reasons).not.toContain("materialDetour");
    expect(v.viable).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Regression fixtures from the live audit
 * ------------------------------------------------------------------ */

describe("audit regression fixtures", () => {
  it("Stockholm -> Firenze / Hamburg is viable", () => {
    expect(requestedViability({ plan: hamburgSplit(), base: sthlmFirenzeBase }).viable).toBe(true);
  });

  it("Stockholm -> Firenze / København is rejected (extreme day 2)", () => {
    const v = requestedViability({ plan: copenhagenSplit(), base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("extremeTravelDay");
  });

  it("Stockholm -> Firenze / Basel is rejected (extreme day 1 + excessive rest)", () => {
    const v = requestedViability({ plan: baselFromStockholmSplit(), base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("extremeTravelDay");
    expect(v.reasons).toContain("restTooLong");
  });

  it("London -> Firenze / Paris is rejected (fake travel day)", () => {
    const v = requestedViability({ plan: parisSplit(), base: londonFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("insufficientDay1");
  });

  it("London -> Firenze / Basel is viable", () => {
    expect(requestedViability({ plan: baselFromLondonSplit(), base: londonFirenzeBase }).viable).toBe(
      true,
    );
  });

  it("Wien -> Roma / Bologna is viable even though continuous is faster", () => {
    const v = requestedViability({ plan: bolognaSplit(), base: wienRomaBase });
    expect(v.viable).toBe(true);
    expect(bolognaSplit().addedElapsedMinutes).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ *
 * Unchanged surfaces: `stay` URL round-trip and legacy snapshots
 * ------------------------------------------------------------------ */

describe("compatibility", () => {
  it("17. the `stay` URL value still round-trips unchanged", async () => {
    const { parsePlace, placeToString } = await import("./journey");
    const value = placeToString({ name: "Hamburg Hbf", place: "53.553,10.006" });
    expect(value).toBe("Hamburg Hbf|53.553,10.006");
    expect(parsePlace(value)).toEqual({ name: "Hamburg Hbf", place: "53.553,10.006" });
  });

  it("18. a saved legacy overnight snapshot still converts to a trip plan", () => {
    const legacy = JSON.parse(JSON.stringify(hamburgSplit())) as OvernightPlan & {
      mode?: unknown;
    };
    delete legacy.mode;
    const snapshot = tripPlanFromOvernight({
      plan: legacy as OvernightPlan,
      style: "recommended",
      minTransferMinutes: 15,
    });
    expect(snapshot.isOvernight).toBe(true);
    expect(snapshot.travelDays).toBe(2);
  });
});
