/**
 * Phase F4A: connection semantics / station-complex safety.
 *
 * Generic fixtures only – no station, city, country or operator is special.
 * The subject under test is: what KIND of passenger connection is occurring,
 * which movement supplement it deserves, and whether the Phase E physical
 * floor still rejects genuinely impossible interchanges.
 */

import { describe, expect, it } from "vitest";

import {
  evaluateConnections,
  evaluateJourneyUsability,
  type Connection,
} from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

const iso = (minutes: number) => new Date(Date.UTC(2026, 7, 28, 8, minutes)).toISOString();

function train(overrides: Partial<Leg>): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: "A",
    toName: "B",
    departure: iso(0),
    arrival: iso(60),
    durationMinutes: 60,
    realTime: false,
    ...overrides,
  };
}

function walk(overrides: Partial<Leg>): Leg {
  return {
    kind: "walk",
    mode: "WALK",
    modeLabel: "Gång",
    fromName: "B",
    toName: "B2",
    departure: iso(60),
    arrival: iso(62),
    durationMinutes: 2,
    realTime: false,
    ...overrides,
  };
}

function journeyOf(legs: Leg[]): Journey {
  return {
    id: "j",
    departure: legs[0]!.departure,
    arrival: legs[legs.length - 1]!.arrival,
    durationMinutes: 0,
    transfers: 0,
    legs,
    operators: [],
    hasNightLeg: false,
    chained: false,
  };
}

/**
 * One interchange, optionally with an explicit access leg, expressed only as
 * generic upstream metadata (ids, coordinates, names, times).
 */
function connection(args: {
  arrive: Partial<Leg>;
  depart: Partial<Leg>;
  /** Minutes between arrival and next departure. */
  gap: number;
  /** Explicit access leg duration, or null for none. */
  accessMinutes?: number | null;
  /** Access leg entirely inside the gap (default true). */
  accessInsideGap?: boolean;
  userMinimum?: number;
}): Connection {
  const arriveAt = 60;
  const departAt = arriveAt + args.gap;
  const first = train({ ...args.arrive, departure: iso(0), arrival: iso(arriveAt) });
  const second = train({
    ...args.depart,
    departure: iso(departAt),
    arrival: iso(departAt + 60),
  });
  const legs: Leg[] = [first];
  if (args.accessMinutes != null) {
    const start = args.accessInsideGap === false ? arriveAt - 5 : arriveAt;
    legs.push(
      walk({
        fromName: first.toName,
        toName: second.fromName,
        departure: iso(start),
        arrival: iso(start + args.accessMinutes),
        durationMinutes: args.accessMinutes,
      }),
    );
  }
  legs.push(second);
  return evaluateConnections(journeyOf(legs), args.userMinimum ?? 15)[0]!;
}

/* 1. Same physical station, different feed names. */
describe("same physical station, different feed names", () => {
  it("is SAME_STATION and needs no movement supplement", () => {
    const c = connection({
      arrive: { toName: "Alpha Hbf", toPlace: "50.000000,10.000000" },
      depart: { fromName: "Alpha Hauptbahnhof", fromPlace: "50.000000,10.000000" },
      gap: 20,
    });
    expect(c.stationRelation).toBe("SAME_STATION");
    expect(c.stationChange).toBe(false);
    expect(c.recommendedMinutes).toBe(15);
    expect(evaluateJourneyUsability([c]).usable).toBe(true);
  });
});

/* 2. Parent/child stop relationship. */
describe("parent/child stop relationship", () => {
  it("different stopIds under one parent form a complex, not a station change", () => {
    const c = connection({
      arrive: {
        toName: "Alpha Kaj",
        toPlace: "50.000000,10.000000",
        toStopId: "feed_a1",
        toParentId: "feed_area",
      },
      depart: {
        fromName: "Beta Torg",
        fromPlace: "50.000500,10.000000",
        fromStopId: "feed_b1",
        fromParentId: "feed_area",
      },
      gap: 25,
    });
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    expect(c.stationChange).toBe(false);
  });
});

/* 3. Connected station complex (two buildings, walkable). */
describe("connected station complex", () => {
  it("gets the connected-complex supplement without an explicit access leg", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "50.000000,10.000000", operator: "Op1" },
      depart: { fromName: "Gamma Nord", fromPlace: "50.003000,10.000000", operator: "Op2" },
      gap: 40,
    });
    expect(c.stationRelation).toBe("CONNECTED_COMPLEX");
    expect(c.accessMinutes).toBe(0);
    expect(c.plannedAccess).toBe(false);
    expect(c.recommendedMinutes).toBe(30); // 10 + 5 operator + 5 high-speed + 10
  });
});

/* 4. Explicit short access/walk inside a complex. */
describe("explicit short access inside a complex", () => {
  const short = () =>
    connection({
      arrive: { toName: "Alpha Nord", toPlace: "50.000000,10.000000", operator: "Op1" },
      depart: { fromName: "Gamma Nord", fromPlace: "50.001800,10.000000", operator: "Op2" },
      gap: 3,
      accessMinutes: 2,
    });

  it("replaces the guessed walking supplement with the source's own figure", () => {
    const c = short();
    expect(c.stationRelation).toBe("CONNECTED_COMPLEX");
    expect(c.accessMinutes).toBe(2);
    expect(c.plannedAccess).toBe(true);
    expect(c.recommendedMinutes).toBe(22); // 10 + 5 + 5 + explicit 2
  });

  it("is no longer treated as physically impossible, but stays risky", () => {
    const c = short();
    expect(evaluateJourneyUsability([c]).usable).toBe(true);
    expect(c.level).toBe("risky");
  });

  it("does not double-count: the same movement is not added on top of the gap", () => {
    const c = short();
    expect(c.minutes).toBe(3);
    expect(c.recommendedMinutes - c.accessMinutes).toBe(20);
  });
});

/* 5. Genuine separate-station transfer. */
describe("genuine separate-station transfer", () => {
  it("keeps the full station-change supplement", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "48.880337,2.354979", operator: "Op1" },
      depart: { fromName: "Alpha Sud", fromPlace: "48.844922,2.373464", operator: "Op2" },
      gap: 45,
    });
    expect(c.stationRelation).toBe("DIFFERENT_STATION");
    expect(c.stationChange).toBe(true);
    expect(c.recommendedMinutes).toBe(35); // 10 + 5 + 5 + 15
  });

  it("a fitting access leg never discounts a separate-station change", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "48.880337,2.354979", operator: "Op1" },
      depart: { fromName: "Alpha Sud", fromPlace: "48.844922,2.373464", operator: "Op2" },
      gap: 60,
      accessMinutes: 4,
    });
    expect(c.plannedAccess).toBe(false);
    expect(c.recommendedMinutes).toBe(35);
  });
});

/* 6. Uncertain relation. */
describe("uncertain relation", () => {
  it("stays conservative when names conflict and only proximity is shared", () => {
    const c = connection({
      arrive: { toName: "Alpha Kaj", toPlace: "50.000000,10.000000" },
      depart: { fromName: "Beta Torg", fromPlace: "50.000500,10.000000" },
      gap: 30,
    });
    expect(c.stationRelation).toBe("UNCERTAIN");
    expect(c.stationChange).toBe(true);
    expect(c.recommendedMinutes).toBe(30);
  });
});

/* 7. Genuinely impossible 2-minute transfer remains rejected. */
describe("Phase E floor stays authoritative", () => {
  it("2 minutes between separate stations with no modelled movement is rejected", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "48.880337,2.354979", operator: "Op1" },
      depart: { fromName: "Alpha Sud", fromPlace: "48.844922,2.373464", operator: "Op2" },
      gap: 2,
    });
    expect(c.plannedAccess).toBe(false);
    expect(evaluateJourneyUsability([c]).usable).toBe(false);
  });

  it("an access leg that does NOT fit in the gap is not evidence", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "50.000000,10.000000" },
      depart: { fromName: "Gamma Nord", fromPlace: "50.003000,10.000000" },
      gap: 2,
      accessMinutes: 12,
    });
    expect(c.plannedAccess).toBe(false);
    expect(evaluateJourneyUsability([c]).usable).toBe(false);
  });

  it("an access leg outside the published gap is not evidence", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord", toPlace: "50.000000,10.000000" },
      depart: { fromName: "Gamma Nord", fromPlace: "50.001800,10.000000" },
      gap: 3,
      accessMinutes: 2,
      accessInsideGap: false,
    });
    expect(c.plannedAccess).toBe(false);
    expect(evaluateJourneyUsability([c]).usable).toBe(false);
  });
});

/* 8. Name similarity alone never makes a transfer safe. */
describe("name similarity alone", () => {
  it("similar names without coordinates stay UNCERTAIN and rejected at 2 minutes", () => {
    const c = connection({
      arrive: { toName: "Alpha Nord" },
      depart: { fromName: "Alpha-Nord" },
      gap: 2,
    });
    expect(c.stationRelation).toBe("UNCERTAIN");
    expect(evaluateJourneyUsability([c]).usable).toBe(false);
  });
});

/* 9. Different stopIds but strong parent/topology evidence. */
describe("strong upstream topology", () => {
  it("resolves a short in-complex change that names alone could not", () => {
    const c = connection({
      arrive: {
        toName: "Alpha Kaj",
        toPlace: "50.000000,10.000000",
        toStopId: "feed_a",
        toParentId: "shared_area",
        operator: "Op1",
      },
      depart: {
        fromName: "Beta Torg",
        fromPlace: "50.000500,10.000000",
        fromStopId: "feed_b",
        fromParentId: "shared_area",
        operator: "Op2",
      },
      gap: 4,
      accessMinutes: 3,
    });
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    expect(c.plannedAccess).toBe(true);
    expect(evaluateJourneyUsability([c]).usable).toBe(true);
  });
});

/* 10. Identical names, geographically distinct stations. */
describe("identical names far apart", () => {
  it("never becomes a safe in-complex movement", () => {
    const c = connection({
      arrive: { toName: "Nordby", toPlace: "50.000000,10.000000" },
      depart: { fromName: "Nordby", fromPlace: "50.500000,10.500000" },
      gap: 3,
      accessMinutes: 2,
    });
    expect(c.stationRelation).toBe("UNCERTAIN");
    expect(c.plannedAccess).toBe(false);
    expect(evaluateJourneyUsability([c]).usable).toBe(false);
  });
});
