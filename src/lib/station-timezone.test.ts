/**
 * Timezone correctness (Phase 1).
 *
 * Every clock a traveller reads must be the LOCAL CIVIL TIME at the relevant
 * station. Calculations keep using absolute instants; only rendering is
 * localized. These tests are deterministic: they pin real station coordinates
 * and real UTC instants, so they do not depend on the machine's own timezone.
 */

import { describe, expect, it } from "vitest";

import { dayOffset, formatClock, formatDayRange, type Journey, type Leg } from "./journey";
import {
  FALLBACK_TIME_ZONE,
  journeyArrivalZone,
  journeyDepartureZone,
  legArrivalZone,
  legDepartureZone,
  zoneForPlace,
} from "./station-timezone";

/** "lat,lon" strings exactly as Transitous/MOTIS delivers them. */
const P = {
  londonStPancras: "51.531000,-0.126000",
  parisNord: "48.880000,2.355000",
  stockholmC: "59.330000,18.058000",
  helsinki: "60.171000,24.941000",
  lisbonOriente: "38.767000,-9.099000",
  madridChamartin: "40.472000,-3.683000",
  copenhagenH: "55.673000,12.565000",
  florenceSmn: "43.776000,11.248000",
} as const;

function leg(over: Partial<Leg>): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: "A",
    toName: "B",
    departure: "2026-06-01T06:00:00Z",
    arrival: "2026-06-01T08:00:00Z",
    durationMinutes: 120,
    realTime: false,
    ...over,
  };
}

function journey(legs: Leg[]): Journey {
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  return {
    id: "j",
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: Math.round(
      (new Date(last.arrival).getTime() - new Date(first.departure).getTime()) / 60000,
    ),
    transfers: Math.max(0, legs.length - 1),
    legs,
    operators: [],
    hasNightLeg: false,
    chained: false,
  };
}

describe("station → IANA timezone", () => {
  it("resolves European stations from coordinates", () => {
    expect(zoneForPlace(P.londonStPancras)).toBe("Europe/London");
    expect(zoneForPlace(P.parisNord)).toBe("Europe/Paris");
    expect(zoneForPlace(P.stockholmC)).toBe("Europe/Stockholm");
    expect(zoneForPlace(P.helsinki)).toBe("Europe/Helsinki");
    expect(zoneForPlace(P.lisbonOriente)).toBe("Europe/Lisbon");
    expect(zoneForPlace(P.madridChamartin)).toBe("Europe/Madrid");
    expect(zoneForPlace(P.copenhagenH)).toBe("Europe/Copenhagen");
    expect(zoneForPlace(P.florenceSmn)).toBe("Europe/Rome");
  });

  it("falls back to the legacy zone without usable coordinates", () => {
    expect(zoneForPlace(undefined)).toBe(FALLBACK_TIME_ZONE);
    expect(zoneForPlace("")).toBe(FALLBACK_TIME_ZONE);
    expect(zoneForPlace("not,coords")).toBe(FALLBACK_TIME_ZONE);
    expect(zoneForPlace("999,999")).toBe(FALLBACK_TIME_ZONE);
  });

  it("reads a journey's zones from the first and last transit leg", () => {
    const j = journey([
      leg({ kind: "walk", fromPlace: P.stockholmC, toPlace: P.stockholmC }),
      leg({ fromPlace: P.stockholmC, toPlace: P.copenhagenH }),
      leg({ fromPlace: P.copenhagenH, toPlace: P.parisNord }),
    ]);
    expect(journeyDepartureZone(j)).toBe("Europe/Stockholm");
    expect(journeyArrivalZone(j)).toBe("Europe/Paris");
  });
});

describe("local clocks per station", () => {
  it("1. London → Paris renders UK departure and CEST arrival", () => {
    const l = leg({
      fromPlace: P.londonStPancras,
      toPlace: P.parisNord,
      departure: "2026-06-01T06:04:00Z", // 07:04 BST
      arrival: "2026-06-01T09:20:00Z", // 11:20 CEST
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("07:04");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("11:20");
  });

  it("2. Paris → London renders CEST departure and UK arrival", () => {
    const l = leg({
      fromPlace: P.parisNord,
      toPlace: P.londonStPancras,
      departure: "2026-06-01T07:13:00Z", // 09:13 CEST
      arrival: "2026-06-01T09:39:00Z", // 10:39 BST
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("09:13");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("10:39");
  });

  it("3. Stockholm → Helsinki renders CEST departure and EEST arrival", () => {
    const l = leg({
      fromPlace: P.stockholmC,
      toPlace: P.helsinki,
      departure: "2026-06-01T05:21:00Z", // 07:21 CEST
      arrival: "2026-06-01T17:45:00Z", // 20:45 EEST
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("07:21");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("20:45");
  });

  it("4. Helsinki → Stockholm renders EEST departure and CEST arrival", () => {
    const l = leg({
      fromPlace: P.helsinki,
      toPlace: P.stockholmC,
      departure: "2026-06-01T04:10:00Z", // 07:10 EEST
      arrival: "2026-06-01T16:30:00Z", // 18:30 CEST
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("07:10");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("18:30");
  });

  it("5. Lisbon → Madrid renders WEST departure and CEST arrival", () => {
    const l = leg({
      fromPlace: P.lisbonOriente,
      toPlace: P.madridChamartin,
      departure: "2026-06-01T20:34:00Z", // 21:34 WEST
      arrival: "2026-06-02T06:40:00Z", // 08:40 CEST
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("21:34");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("08:40");
  });

  it("6. Stockholm → Copenhagen stays in one zone", () => {
    const l = leg({
      fromPlace: P.stockholmC,
      toPlace: P.copenhagenH,
      departure: "2026-06-01T04:52:00Z", // 06:52 CEST
      arrival: "2026-06-01T09:22:00Z", // 11:22 CEST
    });
    expect(legDepartureZone(l)).toBe("Europe/Stockholm");
    expect(legArrivalZone(l)).toBe("Europe/Copenhagen");
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("06:52");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("11:22");
  });

  it("winter dates use standard offsets (DST boundary handling)", () => {
    const l = leg({
      fromPlace: P.londonStPancras,
      toPlace: P.parisNord,
      departure: "2026-01-15T06:04:00Z", // 06:04 GMT
      arrival: "2026-01-15T09:20:00Z", // 10:20 CET
    });
    expect(formatClock(l.departure, legDepartureZone(l))).toBe("06:04");
    expect(formatClock(l.arrival, legArrivalZone(l))).toBe("10:20");
  });

  it("handles the spring-forward night in Europe/Paris", () => {
    // 2026-03-29 01:00Z: CET (+1) becomes CEST (+2) at 02:00 local.
    expect(formatClock("2026-03-29T00:30:00Z", "Europe/Paris")).toBe("01:30");
    expect(formatClock("2026-03-29T01:30:00Z", "Europe/Paris")).toBe("03:30");
  });
});

describe("date rollovers stay traveller-meaningful", () => {
  it("7. a journey crossing local midnight reports +1d", () => {
    const j = journey([
      leg({
        fromPlace: P.lisbonOriente,
        toPlace: P.madridChamartin,
        departure: "2026-06-01T20:34:00Z",
        arrival: "2026-06-02T06:40:00Z",
      }),
    ]);
    expect(dayOffset(j.departure, j.arrival, journeyDepartureZone(j), journeyArrivalZone(j))).toBe(
      1,
    );
  });

  it("does not invent a day change when travelling eastwards late in the evening", () => {
    // Helsinki 23:30 EEST → Stockholm 23:45 CEST: same evening for the traveller.
    const j = journey([
      leg({
        fromPlace: P.helsinki,
        toPlace: P.stockholmC,
        departure: "2026-06-01T20:30:00Z",
        arrival: "2026-06-01T21:45:00Z",
      }),
    ]);
    expect(dayOffset(j.departure, j.arrival, journeyDepartureZone(j), journeyArrivalZone(j))).toBe(
      0,
    );
    expect(
      formatDayRange(
        j.departure,
        j.arrival,
        "sv",
        journeyDepartureZone(j),
        journeyArrivalZone(j),
      ),
    ).toBe("mån 1 juni");
  });

  it("keeps a same-day London → Paris hop on one day", () => {
    const j = journey([
      leg({
        fromPlace: P.londonStPancras,
        toPlace: P.parisNord,
        departure: "2026-06-01T21:00:00Z", // 22:00 BST
        arrival: "2026-06-01T23:20:00Z", // 01:20 CEST next day
      }),
    ]);
    expect(dayOffset(j.departure, j.arrival, journeyDepartureZone(j), journeyArrivalZone(j))).toBe(
      1,
    );
  });
});

describe("London → Firenze regression (public beta QA)", () => {
  it("renders the 06:04Z Eurostar as 07:04 London time, and continental legs locally", () => {
    const legs = [
      leg({
        fromName: "London St Pancras International",
        toName: "Paris Nord",
        fromPlace: P.londonStPancras,
        toPlace: P.parisNord,
        departure: "2026-06-01T06:04:00Z",
        arrival: "2026-06-01T09:20:00Z",
      }),
      leg({
        fromName: "Paris Gare de Lyon",
        toName: "Firenze S. M. Novella",
        fromPlace: P.parisNord,
        toPlace: P.florenceSmn,
        departure: "2026-06-01T11:00:00Z",
        arrival: "2026-06-01T18:40:00Z",
      }),
    ];
    const j = journey(legs);

    // The bug: Europe/Stockholm rendering showed 08:04 for a 07:04 departure.
    expect(formatClock(j.departure, "Europe/Stockholm")).toBe("08:04");
    expect(formatClock(j.departure, journeyDepartureZone(j))).toBe("07:04");

    expect(formatClock(legs[0]!.arrival, legArrivalZone(legs[0]!))).toBe("11:20");
    expect(formatClock(legs[1]!.departure, legDepartureZone(legs[1]!))).toBe("13:00");
    expect(formatClock(j.arrival, journeyArrivalZone(j))).toBe("20:40");

    // Absolute-instant maths is unchanged by display localization.
    expect(j.durationMinutes).toBe(756);
    expect(dayOffset(j.departure, j.arrival, journeyDepartureZone(j), journeyArrivalZone(j))).toBe(
      0,
    );
  });
});
