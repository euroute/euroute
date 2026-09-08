// Phase F4D: absolute +12h departure horizon with a usable-journey safety valve.

import { describe, expect, it } from "vitest";

import type { Journey, Leg } from "./journey";
import {
  DEPARTURE_HORIZON_MINUTES,
  applyDepartureHorizon,
} from "./departure-horizon";
import { MIN_USABLE_JOURNEYS } from "./journey-limits";
import { preAnalyseJourneys } from "./journey-intelligence";

const MIN_TRANSFER = 15;
const REQUESTED = "2026-09-01T08:00:00Z";

const iso = (base: string, offsetMinutes: number) =>
  new Date(new Date(base).getTime() + offsetMinutes * 60000).toISOString();

function railLeg(args: {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  train?: string;
}): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: args.from,
    toName: args.to,
    departure: args.departure,
    arrival: args.arrival,
    durationMinutes: Math.round(
      (new Date(args.arrival).getTime() - new Date(args.departure).getTime()) / 60000,
    ),
    operator: "SJ",
    trainName: args.train ?? "X2000",
    realTime: false,
  };
}

/** Direct, comfortably usable journey departing `offset` minutes after base. */
function direct(offset: number, opts?: { base?: string; durationMinutes?: number; id?: string }): Journey {
  const base = opts?.base ?? REQUESTED;
  const duration = opts?.durationMinutes ?? 180;
  const departure = iso(base, offset);
  const arrival = iso(base, offset + duration);
  const legs = [railLeg({ from: "Stockholm C", to: "Göteborg C", departure, arrival, train: `X${offset}` })];
  return {
    id: opts?.id ?? `direct-${offset}`,
    departure,
    arrival,
    durationMinutes: duration,
    transfers: 0,
    legs,
    operators: ["SJ"],
    hasNightLeg: false,
    chained: false,
  };
}

/** Two-leg journey with an impossible 1-minute change at a different station. */
function impossible(offset: number, id = `impossible-${offset}`): Journey {
  const departure = iso(REQUESTED, offset);
  const change = iso(REQUESTED, offset + 120);
  const board = iso(REQUESTED, offset + 121);
  const arrival = iso(REQUESTED, offset + 300);
  const legs = [
    railLeg({ from: "Stockholm C", to: "Paris Gare de Lyon", departure, arrival: change, train: `A${offset}` }),
    railLeg({ from: "Paris Nord", to: "Firenze SMN", departure: board, arrival, train: `B${offset}` }),
  ];
  return {
    id,
    departure,
    arrival,
    durationMinutes: 300,
    transfers: 1,
    minTransferMinutes: 1,
    legs,
    operators: ["SNCF"],
    hasNightLeg: false,
    chained: false,
  };
}

/** F1.5-pathological: a huge dead wait relative to the best reference journey. */
function pathological(offset: number, id = `pathological-${offset}`): Journey {
  const departure = iso(REQUESTED, offset);
  const change = iso(REQUESTED, offset + 60);
  const board = iso(REQUESTED, offset + 60 + 20 * 60);
  const arrival = iso(REQUESTED, offset + 60 + 20 * 60 + 120);
  const legs = [
    railLeg({ from: "Stockholm C", to: "Malmö C", departure, arrival: change, train: `P${offset}` }),
    railLeg({ from: "Malmö C", to: "Göteborg C", departure: board, arrival, train: `Q${offset}` }),
  ];
  return {
    id,
    departure,
    arrival,
    durationMinutes: Math.round(
      (new Date(arrival).getTime() - new Date(departure).getTime()) / 60000,
    ),
    transfers: 1,
    minTransferMinutes: 20 * 60,
    legs,
    operators: ["SJ"],
    hasNightLeg: false,
    chained: false,
  };
}

const ids = (journeys: Journey[]) => journeys.map((j) => j.id);
const usableIds = (journeys: Journey[]) =>
  preAnalyseJourneys(journeys, MIN_TRANSFER).usable.map((item) => item.journey.id);

describe("Phase F4D departure horizon", () => {
  it("uses a 12-hour absolute horizon and the shared minimum usable target", () => {
    expect(DEPARTURE_HORIZON_MINUTES).toBe(720);
    expect(MIN_USABLE_JOURNEYS).toBe(2);
  });

  it("1. leaves a pool entirely inside the horizon unchanged", () => {
    const pool = [direct(30), direct(180), direct(660)];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual(ids(pool));
  });

  it("2. retains a candidate departing exactly at +12h", () => {
    const pool = [direct(30), direct(120), direct(720)];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toContain("direct-720");
  });

  it("3. removes a candidate at +12h01 when two usable journeys exist inside", () => {
    const pool = [direct(30), direct(120), direct(721)];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-30",
      "direct-120",
    ]);
  });

  it("4. removes all next-day candidates when three usable journeys exist inside", () => {
    const tomorrow = [1380, 1440, 1500, 1560, 1620].map((o) => direct(o));
    const pool = [direct(30), direct(300), direct(600), ...tomorrow];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-30",
      "direct-300",
      "direct-600",
    ]);
  });

  it("5. admits exactly the earliest usable next-day candidate when only one is inside", () => {
    const tomorrow = [1380, 1440, 1500, 1560, 1620].map((o) => direct(o));
    const pool = [direct(660), ...tomorrow];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-660",
      "direct-1380",
    ]);
  });

  it("6. admits exactly the earliest two usable next-day candidates when none is inside", () => {
    const tomorrow = [1380, 1440, 1500, 1560, 1620].map((o) => direct(o));
    const result = applyDepartureHorizon(tomorrow, REQUESTED, MIN_TRANSFER);
    expect(ids(result)).toEqual(["direct-1380", "direct-1440"]);
  });

  it("7. does not let an earlier beyond-horizon unusable candidate satisfy the target", () => {
    const pool = [direct(660), impossible(1300), direct(1400)];
    const result = applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER);
    expect(ids(result)).toEqual(["direct-660", "direct-1400"]);
  });

  it("8. keeps a 00:30 departure requested at 23:00 (offset +1h30)", () => {
    const requested = "2026-09-01T23:00:00Z";
    const pool = [direct(90, { base: requested, id: "midnight" }), direct(30, { base: requested })];
    expect(ids(applyDepartureHorizon(pool, requested, MIN_TRANSFER))).toEqual(ids(pool));
  });

  it("9. keeps a 07:00 next-day departure requested at 20:00 (offset +11h)", () => {
    const requested = "2026-09-01T20:00:00Z";
    const pool = [direct(60, { base: requested }), direct(11 * 60, { base: requested, id: "next-07" })];
    expect(ids(applyDepartureHorizon(pool, requested, MIN_TRANSFER))).toEqual(ids(pool));
  });

  it("10. keeps a long overnight journey departing +10h and arriving +40h", () => {
    const pool = [direct(60), direct(600, { durationMinutes: 30 * 60, id: "overnight" })];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toContain("overnight");
  });

  it("11. keeps a useful night departure around +11h", () => {
    const pool = [direct(60), direct(11 * 60, { id: "night" }), direct(24 * 60)];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-60",
      "night",
    ]);
  });

  it("12. retains a +13h journey when it is required to reach two usable journeys", () => {
    const pool = [direct(600), direct(13 * 60, { id: "valve" })];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-600",
      "valve",
    ]);
  });

  it("13. removes a +13h journey when two usable journeys already exist inside", () => {
    const pool = [direct(60), direct(600), direct(13 * 60, { id: "valve" })];
    expect(ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER))).toEqual([
      "direct-60",
      "direct-600",
    ]);
  });

  it("14. is deterministic and preserves input order", () => {
    const pool = [direct(1500), direct(60), direct(1380), direct(600)];
    const first = ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER));
    const second = ids(applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER));
    expect(first).toEqual(second);
    expect(first).toEqual(["direct-60", "direct-600"]);
  });

  it("15. cannot resurrect a passenger duplicate representation", () => {
    const keeper = direct(600);
    const duplicate = { ...direct(600), id: "duplicate-600" };
    const pool = [keeper, duplicate, direct(1400, { id: "tomorrow" })];
    const result = applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER);
    // Only one of the two identical representations counts as usable, so the
    // valve admits the next-day journey – never a duplicate.
    expect(usableIds(result).length).toBe(2);
    expect(ids(result)).toContain("tomorrow");
  });

  it("16. cannot rescue a Phase E unusable journey", () => {
    const pool = [impossible(60), impossible(1400, "impossible-tomorrow")];
    const result = applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER);
    expect(usableIds(result)).toEqual([]);
    expect(ids(result)).toContain("impossible-60");
  });

  it("17. cannot rescue an F1.5 pathological journey", () => {
    const pool = [direct(60), pathological(1400, "pathological-tomorrow"), direct(1500, { id: "ok-tomorrow" })];
    const result = applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER);
    expect(ids(result)).toEqual(["direct-60", "ok-tomorrow"]);
  });

  it("18. leaves the candidate cap free to apply afterwards", () => {
    const pool = Array.from({ length: 12 }, (_, i) => direct(30 + i * 30));
    const result = applyDepartureHorizon(pool, REQUESTED, MIN_TRANSFER);
    // Horizon does not cap: it only removes beyond-horizon noise.
    expect(result.length).toBe(pool.filter((j) => Number(j.id.split("-")[1]) <= 720).length);
  });

  it("keeps candidates untouched when the requested instant is unparseable", () => {
    const pool = [direct(60), direct(1400)];
    expect(ids(applyDepartureHorizon(pool, "not-a-date", MIN_TRANSFER))).toEqual(ids(pool));
  });
});
