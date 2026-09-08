import { describe, expect, it } from "vitest";
import {
  firstRailDeparture,
  isRailAnchorLeg,
  trimAccessLegs,
  type Leg,
} from "./journey";

function leg(partial: Partial<Leg> & { mode: string; departure: string; arrival: string }): Leg {
  const kindByMode: Record<string, Leg["kind"]> = {
    WALK: "walk",
    BUS: "bus",
    COACH: "bus",
  };
  const train = new Set([
    "HIGHSPEED_RAIL",
    "LONG_DISTANCE",
    "NIGHT_RAIL",
    "REGIONAL_FAST_RAIL",
    "REGIONAL_RAIL",
    "RAIL",
    "SUBURBAN",
    "METRO",
    "SUBWAY",
    "TRAM",
  ]);
  return {
    kind: kindByMode[partial.mode] ?? (train.has(partial.mode) ? "train" : "other"),
    modeLabel: partial.mode,
    fromName: partial.fromName ?? "A",
    toName: partial.toName ?? "B",
    durationMinutes: Math.round(
      (new Date(partial.arrival).getTime() - new Date(partial.departure).getTime()) / 60000,
    ),
    realTime: false,
    ...partial,
  } as Leg;
}

/** Wien city coordinate → metro → Hbf → rail → Roma Termini → walk → city. */
const cityToCity: Leg[] = [
  leg({ mode: "WALK", fromName: "Startpunkt", toName: "Wien Stephansplatz", departure: "2026-09-08T07:52:00+02:00", arrival: "2026-09-08T07:58:00+02:00" }),
  leg({ mode: "SUBWAY", fromName: "Wien Stephansplatz", toName: "Wien Hauptbahnhof", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T08:06:00+02:00" }),
  leg({ mode: "LONG_DISTANCE", fromName: "Wien Hauptbahnhof", toName: "Roma Termini", departure: "2026-09-08T08:30:00+02:00", arrival: "2026-09-08T21:00:00+02:00" }),
  leg({ mode: "WALK", fromName: "Roma Termini", toName: "Slutpunkt", departure: "2026-09-08T21:05:00+02:00", arrival: "2026-09-08T21:30:00+02:00" }),
];

/** Deterministic fixture with a real interior station change in Paris. */
const interior: Leg[] = [
  leg({ mode: "WALK", fromName: "Startpunkt", toName: "London St Pancras", departure: "2026-09-08T07:30:00+01:00", arrival: "2026-09-08T07:58:00+01:00" }),
  leg({ mode: "HIGHSPEED_RAIL", fromName: "London St Pancras", toName: "Paris Nord", departure: "2026-09-08T08:31:00+01:00", arrival: "2026-09-08T11:47:00+02:00" }),
  leg({ mode: "WALK", fromName: "Paris Nord", toName: "Gare du Nord RER", departure: "2026-09-08T11:52:00+02:00", arrival: "2026-09-08T11:58:00+02:00" }),
  leg({ mode: "SUBWAY", fromName: "Gare du Nord", toName: "Gare de Lyon", departure: "2026-09-08T12:02:00+02:00", arrival: "2026-09-08T12:16:00+02:00" }),
  leg({ mode: "WALK", fromName: "Gare de Lyon RER", toName: "Gare de Lyon", departure: "2026-09-08T12:16:00+02:00", arrival: "2026-09-08T12:24:00+02:00" }),
  leg({ mode: "REGIONAL_RAIL", fromName: "Gare de Lyon", toName: "Dijon", departure: "2026-09-08T12:50:00+02:00", arrival: "2026-09-08T14:20:00+02:00" }),
  leg({ mode: "HIGHSPEED_RAIL", fromName: "Dijon", toName: "Firenze S.M.N.", departure: "2026-09-08T14:50:00+02:00", arrival: "2026-09-08T21:40:00+02:00" }),
  leg({ mode: "WALK", fromName: "Firenze S.M.N.", toName: "Slutpunkt", departure: "2026-09-08T21:45:00+02:00", arrival: "2026-09-08T22:05:00+02:00" }),
];

describe("meaningful rail anchor", () => {
  it("accepts intercity rail modes", () => {
    for (const mode of ["HIGHSPEED_RAIL", "LONG_DISTANCE", "NIGHT_RAIL", "REGIONAL_FAST_RAIL", "REGIONAL_RAIL", "RAIL"]) {
      expect(
        isRailAnchorLeg(leg({ mode, departure: "2026-09-08T08:00:00Z", arrival: "2026-09-08T09:00:00Z" })),
      ).toBe(true);
    }
  });

  it("rejects local access modes", () => {
    for (const mode of ["WALK", "METRO", "SUBWAY", "TRAM", "BUS", "COACH", "SUBURBAN", "FERRY"]) {
      expect(
        isRailAnchorLeg(leg({ mode, departure: "2026-09-08T08:00:00Z", arrival: "2026-09-08T09:00:00Z" })),
      ).toBe(false);
    }
  });
});

describe("trimAccessLegs — endpoint combinations", () => {
  it("CITY → CITY trims both ends", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: true, trimDestination: true })!;
    expect(out.map((l) => l.mode)).toEqual(["LONG_DISTANCE"]);
    expect(out[0]!.fromName).toBe("Wien Hauptbahnhof");
    expect(out[out.length - 1]!.toName).toBe("Roma Termini");
  });

  it("CITY → STATION trims the origin prefix only", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: true, trimDestination: false })!;
    expect(out.map((l) => l.mode)).toEqual(["LONG_DISTANCE", "WALK"]);
  });

  it("STATION → CITY trims the destination suffix only", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: false, trimDestination: true })!;
    expect(out.map((l) => l.mode)).toEqual(["WALK", "SUBWAY", "LONG_DISTANCE"]);
  });

  it("STATION → STATION leaves the itinerary untouched", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: false, trimDestination: false })!;
    expect(out).toBe(cityToCity);
  });
});

describe("trimAccessLegs — interior preservation", () => {
  it("keeps interior WALK/METRO/REGIONAL legs verbatim", () => {
    const out = trimAccessLegs(interior, { trimOrigin: true, trimDestination: true })!;
    expect(out.map((l) => l.mode)).toEqual([
      "HIGHSPEED_RAIL",
      "WALK",
      "SUBWAY",
      "WALK",
      "REGIONAL_RAIL",
      "HIGHSPEED_RAIL",
    ]);
    expect(out[0]!.fromName).toBe("London St Pancras");
    expect(out[out.length - 1]!.toName).toBe("Firenze S.M.N.");
    // Verbatim: same objects, no mode filtering inside the journey.
    expect(out).toEqual(interior.slice(1, 7));
  });
});

describe("trimAccessLegs — degenerate itineraries", () => {
  it("returns null when no rail anchor exists", () => {
    const metroOnly = [
      leg({ mode: "WALK", departure: "2026-09-08T08:00:00Z", arrival: "2026-09-08T08:10:00Z" }),
      leg({ mode: "SUBWAY", departure: "2026-09-08T08:12:00Z", arrival: "2026-09-08T08:30:00Z" }),
    ];
    expect(trimAccessLegs(metroOnly, { trimOrigin: true, trimDestination: true })).toBeNull();
    expect(trimAccessLegs(metroOnly, { trimOrigin: false, trimDestination: false })).toBeNull();
  });
});

describe("recomputed metrics", () => {
  // Mirrors buildJourney in rail.server.ts: transit = non-walk legs.
  function metrics(legs: Leg[]) {
    const first = legs[0]!;
    const last = legs[legs.length - 1]!;
    const transit = legs.filter((l) => l.kind !== "walk");
    const gaps: number[] = [];
    for (let i = 1; i < transit.length; i += 1) {
      gaps.push(
        Math.round(
          (new Date(transit[i]!.departure).getTime() - new Date(transit[i - 1]!.arrival).getTime()) /
            60000,
        ),
      );
    }
    return {
      departure: first.departure,
      arrival: last.arrival,
      durationMinutes: Math.round(
        (new Date(last.arrival).getTime() - new Date(first.departure).getTime()) / 60000,
      ),
      transfers: Math.max(transit.length - 1, 0),
      minTransferMinutes: gaps.length ? Math.min(...gaps) : undefined,
    };
  }

  it("departure, arrival and duration come from the rail anchors", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: true, trimDestination: true })!;
    const m = metrics(out);
    expect(m.departure).toBe("2026-09-08T08:30:00+02:00");
    expect(m.arrival).toBe("2026-09-08T21:00:00+02:00");
    expect(m.durationMinutes).toBe(750);
    expect(m.durationMinutes).toBe(
      Math.round((new Date(m.arrival).getTime() - new Date(m.departure).getTime()) / 60000),
    );
  });

  it("removed metro access is not a transfer", () => {
    expect(metrics(cityToCity).transfers).toBe(1);
    const out = trimAccessLegs(cityToCity, { trimOrigin: true, trimDestination: true })!;
    expect(metrics(out).transfers).toBe(0);
    expect(metrics(out).minTransferMinutes).toBeUndefined();
  });

  it("interior metro transfers still count with existing semantics", () => {
    const out = trimAccessLegs(interior, { trimOrigin: true, trimDestination: true })!;
    const m = metrics(out);
    // Eurostar, SUBWAY, REGIONAL_RAIL, HIGHSPEED_RAIL = 4 transit legs.
    expect(m.transfers).toBe(3);
    expect(m.minTransferMinutes).toBe(15);
  });
});

describe("search-time guard", () => {
  const requested = "2026-09-08T08:00:00+02:00";

  it("keeps a journey whose first rail departure is at or after the request", () => {
    const out = trimAccessLegs(cityToCity, { trimOrigin: true, trimDestination: true })!;
    const railDeparture = firstRailDeparture(out)!;
    expect(new Date(railDeparture).getTime()).toBeGreaterThanOrEqual(
      new Date(requested).getTime(),
    );
  });

  it("detects a pre-request rail departure reached by a pre-08:00 access leg", () => {
    const early: Leg[] = [
      leg({ mode: "WALK", fromName: "Startpunkt", toName: "Wien Hauptbahnhof", departure: "2026-09-08T07:20:00+02:00", arrival: "2026-09-08T07:49:00+02:00" }),
      leg({ mode: "LONG_DISTANCE", fromName: "Wien Hauptbahnhof", toName: "Roma Termini", departure: "2026-09-08T07:55:00+02:00", arrival: "2026-09-08T20:30:00+02:00" }),
    ];
    const out = trimAccessLegs(early, { trimOrigin: true, trimDestination: true })!;
    expect(new Date(firstRailDeparture(out)!).getTime()).toBeLessThan(
      new Date(requested).getTime(),
    );
  });
});
