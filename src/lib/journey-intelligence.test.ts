/**
 * Direct behavioural tests for the identity-sensitive connection helpers.
 * Legs WITHOUT coordinates or stop ids keep the conservative name-only
 * behaviour (classifier returns UNCERTAIN); Phase 3 relation behaviour is
 * exercised in the block at the bottom with real upstream metadata.
 */

import { describe, expect, it } from "vitest";

import {
  analyseJourneys,
  evaluateConnections,
  evaluateJourneyDeadTimeUsability,
  evaluateJourneyUsability,
  journeyFacts,
  journeyDeadTimeMetrics,
  type Connection,
} from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

function leg(over: Partial<Leg>): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: "A",
    toName: "B",
    departure: "2026-09-08T08:00:00+02:00",
    arrival: "2026-09-08T10:00:00+02:00",
    durationMinutes: 120,
    realTime: false,
    ...over,
  };
}

function journeyOf(legs: Leg[]): Journey {
  return {
    id: "j1",
    departure: legs[0]!.departure,
    arrival: legs[legs.length - 1]!.arrival,
    durationMinutes: 300,
    transfers: Math.max(0, legs.length - 1),
    legs,
    operators: [],
    hasNightLeg: false,
    chained: false,
  };
}

function timedJourney(id: string, legs: Leg[]): Journey {
  const departure = legs[0]?.departure ?? "2026-09-08T08:00:00+02:00";
  const arrival = legs[legs.length - 1]?.arrival ?? departure;
  return {
    id,
    departure,
    arrival,
    durationMinutes: Math.round((new Date(arrival).getTime() - new Date(departure).getTime()) / 60000),
    transfers: Math.max(0, legs.length - 1),
    legs,
    operators: Array.from(new Set(legs.map((l) => l.operator).filter((o): o is string => Boolean(o)))),
    hasNightLeg: false,
    chained: false,
  };
}

const second = (fromName: string, over: Partial<Leg> = {}) =>
  leg({
    fromName,
    toName: "C",
    departure: "2026-09-08T10:30:00+02:00",
    arrival: "2026-09-08T13:00:00+02:00",
    ...over,
  });

function connect(toName: string, fromName: string, over: Partial<Leg> = {}) {
  return evaluateConnections(journeyOf([leg({ toName }), second(fromName, over)]), 10)[0]!;
}

describe("evaluateConnections – station identity", () => {
  it("A. identical station name is no station change", () => {
    expect(connect("Hamburg Hbf", "Hamburg Hbf").stationChange).toBe(false);
  });

  it("B. case differences are no station change", () => {
    expect(connect("ROMA TERMINI", "Roma Termini").stationChange).toBe(false);
  });

  it("C. punctuation differences are no station change", () => {
    expect(connect("Firenze S.M.N", "Firenze-SMN").stationChange).toBe(false);
  });

  it("D. spacing differences are no station change", () => {
    expect(connect("Wien  Hbf", "Wien Hbf").stationChange).toBe(false);
  });

  it("E. supported variants: Hbf/Hauptbahnhof and city suffix", () => {
    expect(connect("Hamburg Hbf", "Hamburg Hauptbahnhof").stationChange).toBe(false);
    expect(connect("Berlin Hbf, Berlin", "Berlin Hbf").stationChange).toBe(false);
  });

  it("F. clearly different stations are a station change", () => {
    expect(connect("Paris Gare du Nord", "Paris Gare de Lyon").stationChange).toBe(true);
  });

  it("Paris-Nord → Gare du Nord without metadata stays conservative (UNCERTAIN)", () => {
    const c = connect("Paris-Nord", "Gare du Nord");
    expect(c.stationChange).toBe(true);
    // base 10 + high-speed 5 + station change 15
    expect(c.recommendedMinutes).toBe(30);
    expect(c.minutes).toBe(30);
    expect(c.level).toBe("comfortable");
  });

  it("recommended margins are unchanged by Phase 1", () => {
    const same = connect("Hamburg Hbf", "Hamburg Hbf");
    expect(same.recommendedMinutes).toBe(15);
    const operators = connect("Hamburg Hbf", "Hamburg Hbf", { operator: "DB" });
    expect(operators.recommendedMinutes).toBe(15);
    const regional = evaluateConnections(
      journeyOf([
        leg({ toName: "Hamburg Hbf", mode: "REGIONAL_RAIL" }),
        second("Hamburg Hbf", { mode: "REGIONAL_RAIL" }),
      ]),
      10,
    )[0]!;
    expect(regional.recommendedMinutes).toBe(10);
  });

  it("G/legacy snapshot: legs without identity metadata still classify", () => {
    const legacy = journeyOf([
      leg({ toName: "Paris-Nord", fromPlace: undefined, toPlace: undefined }),
      second("Gare du Nord"),
    ]);
    const c = evaluateConnections(legacy, 10)[0]!;
    expect(c.arriveStation).toBe("Paris-Nord");
    expect(c.departStation).toBe("Gare du Nord");
    expect(c.stationChange).toBe(true);
    expect(c.longWait).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Phase 3: station-relation wiring
 * ------------------------------------------------------------------ */

const PARIS_NORD = { lat: 48.880959, lon: 2.35519 };
const GARE_DU_NORD = { lat: 48.880337, lon: 2.354979 };
const GARE_DE_LYON = { lat: 48.844922, lon: 2.373464 };

type Stop = {
  name: string;
  lat?: number;
  lon?: number;
  stopId?: string;
  parentId?: string;
};

/** Build a two-leg journey with an explicit connection gap in minutes. */
function connectWith(arrive: Stop, depart: Stop, gapMinutes: number, over: Partial<Leg> = {}) {
  const place = (s: Stop) => (s.lat === undefined ? undefined : `${s.lat},${s.lon}`);
  const departureIso = `2026-09-08T${String(10 + Math.floor(gapMinutes / 60)).padStart(2, "0")}:${String(
    gapMinutes % 60,
  ).padStart(2, "0")}:00+02:00`;
  const first = leg({
    toName: arrive.name,
    toPlace: place(arrive),
    toStopId: arrive.stopId,
    toParentId: arrive.parentId,
    ...over,
  });
  const secondLeg = second(depart.name, {
    fromPlace: place(depart),
    fromStopId: depart.stopId,
    fromParentId: depart.parentId,
    departure: departureIso,
    ...over,
  });
  return evaluateConnections(journeyOf([first, secondLeg]), 10)[0]!;
}

describe("Phase 3: connections use the station-relation classifier", () => {
  it("A. Paris-Nord → Gare du Nord is SAME_COMPLEX, not a station change", () => {
    const c = connectWith({ name: "Paris-Nord", ...PARIS_NORD }, { name: "Gare du Nord", ...GARE_DU_NORD }, 30);
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    expect(c.stationChange).toBe(false);
    expect(c.sameComplex).toBe(true);
    // base 10 + high-speed 5 + same-complex 5 (not the 15-minute city change)
    expect(c.recommendedMinutes).toBe(20);
    expect(c.level).toBe("comfortable");
  });

  it("B. Gare du Nord → Gare de Lyon remains a real station change", () => {
    const c = connectWith(
      { name: "Paris Gare du Nord", ...GARE_DU_NORD },
      { name: "Paris Gare de Lyon", ...GARE_DE_LYON },
      45,
    );
    expect(c.stationRelation).toBe("DIFFERENT_STATION");
    expect(c.stationChange).toBe(true);
    expect(c.sameComplex).toBe(false);
    expect(c.recommendedMinutes).toBe(30);
  });

  it("C. SAME_STATION: identical names and coordinates", () => {
    for (const name of ["Hamburg Hbf", "Wien Hbf", "Roma Termini"]) {
      const c = connectWith(
        { name, lat: 53.5528, lon: 10.0064 },
        { name: name.replace("Hbf", "Hauptbahnhof"), lat: 53.5528, lon: 10.0064 },
        30,
      );
      expect(c.stationRelation).toBe("SAME_STATION");
      expect(c.stationChange).toBe(false);
      expect(c.recommendedMinutes).toBe(15); // no relation supplement
    }
  });

  it("D. Firenze S.M.N. variants are SAME_STATION via the generic alias rule", () => {
    const c = connectWith(
      { name: "Firenze S.M.N.", lat: 43.7765, lon: 11.248 },
      { name: "FIRENZE S.MARIA NOVELLA", lat: 43.7765, lon: 11.248 },
      30,
    );
    expect(c.stationRelation).toBe("SAME_STATION");
    expect(c.stationChange).toBe(false);
  });

  it("E. CONNECTED_COMPLEX gets the intermediate margin", () => {
    const c = connectWith(
      { name: "Alpha Nord", lat: 50, lon: 10 },
      { name: "Alpha Nord", lat: 50 + 400 / 111320, lon: 10 },
      30,
    );
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    const connected = connectWith(
      { name: "Alpha Nord", lat: 50, lon: 10 },
      { name: "Alpha Nord Terminal 2", lat: 50 + 400 / 111320, lon: 10 },
      30,
    );
    expect(connected.stationRelation).toBe("CONNECTED_COMPLEX");
    expect(connected.stationChange).toBe(false);
    expect(connected.sameComplex).toBe(true);
    // base 10 + high-speed 5 + connected complex 10
    expect(connected.recommendedMinutes).toBe(25);
  });

  it("F. UNCERTAIN falls back to today's conservative station-change behaviour", () => {
    const stp = connectWith(
      { name: "London St Pancras International", lat: 51.5319, lon: -0.1264 },
      { name: "London King's Cross", lat: 51.5308, lon: -0.1238 },
      45,
    );
    expect(stp.stationRelation).toBe("UNCERTAIN");
    expect(stp.stationChange).toBe(true);
    expect(stp.recommendedMinutes).toBe(30);

    const sthlm = connectWith(
      { name: "Stockholm Centralstation", lat: 59.33, lon: 18.0585 },
      { name: "Stockholm City", lat: 59.3312, lon: 18.0592 },
      45,
    );
    expect(sthlm.stationRelation).toBe("UNCERTAIN");
    expect(sthlm.stationChange).toBe(true);

    const tc = connectWith(
      { name: "Stockholm C", lat: 59.33, lon: 18.0585 },
      { name: "T-Centralen", lat: 59.3316, lon: 18.0596 },
      45,
    );
    expect(tc.stationRelation).toBe("UNCERTAIN");
    expect(tc.stationChange).toBe(true);

    const basel = connectWith(
      { name: "Basel SBB", lat: 47.5474, lon: 7.5896 },
      { name: "Basel CFF/FFS", lat: 47.5474, lon: 7.5896 },
      45,
    );
    expect(basel.stationRelation).toBe("UNCERTAIN");
    expect(basel.stationChange).toBe(true);
  });

  it("G. 5-minute same-complex connection is honestly risky but not a station change", () => {
    const c = connectWith({ name: "Paris-Nord", ...PARIS_NORD }, { name: "Gare du Nord", ...GARE_DU_NORD }, 5);
    expect(c.minutes).toBe(5);
    expect(c.stationChange).toBe(false);
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    expect(c.recommendedMinutes).toBe(20);
    expect(c.level).toBe("risky");
  });

  it("H. same-complex with a comfortable margin", () => {
    const c = connectWith({ name: "Paris-Nord", ...PARIS_NORD }, { name: "Gare du Nord", ...GARE_DU_NORD }, 40);
    expect(c.level).toBe("comfortable");
    expect(c.stationChange).toBe(false);
  });

  it("I. real station change with insufficient margin is risky", () => {
    const c = connectWith(
      { name: "Paris Gare du Nord", ...GARE_DU_NORD },
      { name: "Paris Gare de Lyon", ...GARE_DE_LYON },
      10,
    );
    expect(c.stationChange).toBe(true);
    expect(c.level).toBe("risky");
  });

  it("J. real station change with sufficient margin is comfortable", () => {
    const c = connectWith(
      { name: "Paris Gare du Nord", ...GARE_DU_NORD },
      { name: "Paris Gare de Lyon", ...GARE_DE_LYON },
      55,
    );
    expect(c.stationChange).toBe(true);
    expect(c.level).toBe("comfortable");
  });

  it("K. legacy name-only snapshot keeps the conservative interpretation", () => {
    const c = connectWith({ name: "Paris-Nord" }, { name: "Gare du Nord" }, 30);
    expect(c.stationRelation).toBe("UNCERTAIN");
    expect(c.stationChange).toBe(true);
    expect(c.recommendedMinutes).toBe(30);
  });

  it("L. exact stopId equality is SAME_STATION regardless of display names", () => {
    const c = connectWith(
      { name: "Paris-Nord", stopId: "fr:stop:1", ...PARIS_NORD },
      { name: "Gare du Nord Souterrain", stopId: "fr:stop:1", ...GARE_DE_LYON },
      30,
    );
    expect(c.stationRelation).toBe("SAME_STATION");
    expect(c.stationChange).toBe(false);
  });

  it("M. shared parentId is SAME_COMPLEX", () => {
    const c = connectWith(
      { name: "London St Pancras International", parentId: "gb:complex:1", lat: 51.5319, lon: -0.1264 },
      { name: "London King's Cross", parentId: "gb:complex:1", lat: 51.5308, lon: -0.1238 },
      45,
    );
    expect(c.stationRelation).toBe("SAME_COMPLEX");
    expect(c.stationChange).toBe(false);
    expect(c.recommendedMinutes).toBe(20);
  });

  it("N. conflicting evidence stays conservative", () => {
    const c = connectWith(
      { name: "Alpha Hbf", parentId: "p", lat: 50, lon: 10 },
      { name: "Beta Hbf", parentId: "p", lat: 50.2, lon: 10.2 },
      45,
    );
    expect(c.stationRelation).toBe("UNCERTAIN");
    expect(c.stationChange).toBe(true);
    expect(c.recommendedMinutes).toBe(30);
  });

  it("station changes counted in facts follow the relation, not raw names", () => {
    const same = journeyFacts(
      journeyOf([
        leg({ toName: "Paris-Nord", toPlace: `${PARIS_NORD.lat},${PARIS_NORD.lon}` }),
        second("Gare du Nord", { fromPlace: `${GARE_DU_NORD.lat},${GARE_DU_NORD.lon}` }),
      ]),
      10,
    );
    expect(same.stationChanges).toBe(0);

    const real = journeyFacts(
      journeyOf([
        leg({ toName: "Paris Gare du Nord", toPlace: `${GARE_DU_NORD.lat},${GARE_DU_NORD.lon}` }),
        second("Paris Gare de Lyon", { fromPlace: `${GARE_DE_LYON.lat},${GARE_DE_LYON.lon}` }),
      ]),
      10,
    );
    expect(real.stationChanges).toBe(1);
  });
});

/* ------------------------------------------------------------------ *
 * Phase E: absolute connection plausibility
 * ------------------------------------------------------------------ */

const DEFAULT_PREFS = {
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

function connection(over: Partial<Connection>): Connection {
  return {
    accessMinutes: 0,
    plannedAccess: false,
    index: 1,
    arriveStation: "Alpha",
    departStation: "Alpha",
    stationChange: false,
    stationRelation: "SAME_STATION",
    sameComplex: false,
    namesDiffer: false,
    operatorChange: false,
    minutes: 20,
    recommendedMinutes: 20,
    level: "comfortable",
    longWait: false,
    ...over,
  };
}

function analysisLeg(over: Partial<Leg>): Leg {
  return leg({
    mode: "LONG_DISTANCE",
    modeLabel: "Long-distance train",
    operator: "Rail",
    ...over,
  });
}

const day = "2026-09-08";
const at = (time: string) => `${day}T${time}:00+02:00`;

function plusMinutes(time: string, minutes: number): string {
  const [hoursText, minutesText] = time.split(":");
  const total = Number(hoursText) * 60 + Number(minutesText) + minutes;
  const hours = Math.floor(total / 60) % 24;
  const mins = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function twoLegJourney(args: {
  id: string;
  start: string;
  firstArrival: string;
  gapMinutes: number;
  end: string;
  arriveStop: Stop;
  departStop: Stop;
  viaLabel?: string;
  operatorA?: string;
  operatorB?: string;
}): Journey {
  const place = (s: Stop) => (s.lat === undefined ? undefined : `${s.lat},${s.lon}`);
  const secondDeparture = plusMinutes(args.firstArrival, args.gapMinutes);
  return timedJourney(args.id, [
    analysisLeg({
      fromName: "Origin",
      toName: args.arriveStop.name,
      toPlace: place(args.arriveStop),
      departure: at(args.start),
      arrival: at(args.firstArrival),
      durationMinutes: Math.round((new Date(at(args.firstArrival)).getTime() - new Date(at(args.start)).getTime()) / 60000),
      operator: args.operatorA ?? "Rail A",
    }),
    analysisLeg({
      fromName: args.departStop.name,
      fromPlace: place(args.departStop),
      toName: args.viaLabel ?? "Destination",
      departure: at(secondDeparture),
      arrival: at(args.end),
      durationMinutes: Math.round((new Date(at(args.end)).getTime() - new Date(at(secondDeparture)).getTime()) / 60000),
      operator: args.operatorB ?? "Rail B",
    }),
  ]);
}

function directJourney(id: string, start: string, end: string): Journey {
  return timedJourney(id, [
    analysisLeg({
      fromName: "Origin",
      toName: "Destination",
      departure: at(start),
      arrival: at(end),
      durationMinutes: Math.round((new Date(at(end)).getTime() - new Date(at(start)).getTime()) / 60000),
      operator: "Direct Rail",
    }),
  ]);
}

function absoluteLeg(over: Partial<Leg> & Pick<Leg, "fromName" | "toName" | "departure" | "arrival">): Leg {
  return analysisLeg({
    durationMinutes: Math.round((new Date(over.arrival).getTime() - new Date(over.departure).getTime()) / 60000),
    ...over,
  });
}

function journeyFromTimes(id: string, legs: Leg[]): Journey {
  return timedJourney(id, legs);
}

const SAME_STATION = { name: "Hamburg Hbf", lat: 53.5528, lon: 10.0064 };
const SAME_COMPLEX_A = { name: "Paris-Nord", ...PARIS_NORD };
const SAME_COMPLEX_B = { name: "Gare du Nord", ...GARE_DU_NORD };
const CONNECTED_A = { name: "Alpha Nord", lat: 50, lon: 10 };
const CONNECTED_B = { name: "Alpha Nord Terminal 2", lat: 50 + 400 / 111320, lon: 10 };
const DIFFERENT_A = { name: "Paris Gare du Nord", ...GARE_DU_NORD };
const DIFFERENT_B = { name: "Paris Gare de Lyon", ...GARE_DE_LYON };

describe("Phase E: absolute journey usability", () => {
  it("keeps ordinary tight shortfalls while filtering impossible connections", () => {
    expect(
      evaluateJourneyUsability([connection({ minutes: 19, recommendedMinutes: 20, level: "tight" })]).usable,
    ).toBe(true);
    expect(
      evaluateJourneyUsability([connection({ minutes: 14, recommendedMinutes: 15, level: "tight" })]).usable,
    ).toBe(true);
    expect(
      evaluateJourneyUsability([
        connection({ minutes: 2, recommendedMinutes: 30, level: "risky", stationChange: true }),
      ]),
    ).toMatchObject({ usable: false, reasons: ["implausibleConnection"] });
    expect(
      evaluateJourneyUsability([connection({ minutes: 3, recommendedMinutes: 20, level: "risky" })]).usable,
    ).toBe(false);
    expect(
      evaluateJourneyUsability([connection({ minutes: 5, recommendedMinutes: 25, level: "risky" })]).usable,
    ).toBe(false);
  });

  it("keeps a normal direct journey", () => {
    const analysis = analyseJourneys({
      journeys: [directJourney("direct", "08:00", "10:00")],
      preferences: DEFAULT_PREFS,
      style: "recommended",
    });
    expect(analysis.allJourneysUnusable).toBe(false);
    expect(analysis.options[0]?.journey.id).toBe("direct");
  });

  it("keeps a same-station transfer with a modest tight shortfall", () => {
    const normalTight = twoLegJourney({
      id: "normal-tight",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 19,
      end: "11:00",
      arriveStop: SAME_STATION,
      departStop: SAME_STATION,
    });
    const c = evaluateConnections(normalTight, 15)[0]!;
    expect(c.recommendedMinutes).toBe(20);
    expect(c.level).toBe("tight");
    const analysis = analyseJourneys({ journeys: [normalTight], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.options[0]?.journey.id).toBe("normal-tight");
  });

  it("A. Recommended picks the slightly slower usable journey over a faster impossible one", () => {
    const impossible = twoLegJourney({
      id: "fast-impossible",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 2,
      end: "11:00",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const usable = twoLegJourney({
      id: "slower-usable",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 20,
      end: "11:20",
      arriveStop: SAME_STATION,
      departStop: SAME_STATION,
    });
    const analysis = analyseJourneys({ journeys: [impossible, usable], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.unusableCount).toBe(1);
    expect(analysis.options[0]).toMatchObject({ journey: { id: "slower-usable" }, category: "recommended" });
    expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).not.toContain("fast-impossible");
  });

  it("B. Fastest picks the next-fastest usable journey", () => {
    const impossible = twoLegJourney({
      id: "fastest-impossible",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 2,
      end: "10:30",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const nextFastestUsable = twoLegJourney({
      id: "next-fastest-usable",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 20,
      end: "10:50",
      arriveStop: SAME_STATION,
      departStop: SAME_STATION,
    });
    const analysis = analyseJourneys({
      journeys: [impossible, nextFastestUsable],
      preferences: DEFAULT_PREFS,
      style: "fastest",
    });
    expect(analysis.options[0]).toMatchObject({ journey: { id: "next-fastest-usable" }, category: "fastest" });
  });

  it("C. Comfortable picks a usable journey over a low-change impossible one", () => {
    const impossibleFewChanges = twoLegJourney({
      id: "few-changes-impossible",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 2,
      end: "10:30",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const usableMoreTime = twoLegJourney({
      id: "comfortable-usable",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 30,
      end: "12:00",
      arriveStop: SAME_STATION,
      departStop: SAME_STATION,
    });
    const analysis = analyseJourneys({
      journeys: [impossibleFewChanges, usableMoreTime],
      preferences: DEFAULT_PREFS,
      style: "comfortable",
    });
    expect(analysis.options[0]).toMatchObject({ journey: { id: "comfortable-usable" }, category: "mostComfortable" });
  });

  it("D. returns an explicit all-unusable state with no profile winner", () => {
    const impossibleA = twoLegJourney({
      id: "impossible-a",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 2,
      end: "11:00",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const impossibleB = twoLegJourney({
      id: "impossible-b",
      start: "08:10",
      firstArrival: "09:10",
      gapMinutes: 3,
      end: "11:10",
      arriveStop: SAME_COMPLEX_A,
      departStop: SAME_COMPLEX_B,
    });
    const analysis = analyseJourneys({ journeys: [impossibleA, impossibleB], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.allJourneysUnusable).toBe(true);
    expect(analysis.unusableCount).toBe(2);
    expect(analysis.options).toEqual([]);
    expect(analysis.more).toEqual([]);
  });

  it("Berlin → Nice fixture: a 2-minute Paris cross-station connection cannot be promoted", () => {
    const berlinNiceBad = twoLegJourney({
      id: "berlin-nice-2m-paris",
      start: "08:00",
      firstArrival: "16:00",
      gapMinutes: 2,
      end: "22:30",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const alternative = twoLegJourney({
      id: "berlin-nice-usable",
      start: "08:00",
      firstArrival: "16:00",
      gapMinutes: 35,
      end: "23:10",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const analysis = analyseJourneys({ journeys: [berlinNiceBad, alternative], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.options[0]?.journey.id).toBe("berlin-nice-usable");
  });

  it("London → Marseille fixture: 2-minute Lille/Paris connections are removed before Fastest", () => {
    const bad = timedJourney("london-marseille-2m", [
      analysisLeg({ fromName: "London", toName: "Lille Europe", departure: at("08:00"), arrival: at("10:00"), durationMinutes: 120 }),
      analysisLeg({ fromName: "Lille Flandres", toName: "Paris Gare du Nord", departure: at("10:02"), arrival: at("11:00"), durationMinutes: 58 }),
      analysisLeg({ fromName: "Paris Gare de Lyon", toName: "Marseille", departure: at("11:02"), arrival: at("14:30"), durationMinutes: 208 }),
    ]);
    const usable = twoLegJourney({
      id: "london-marseille-usable",
      start: "08:10",
      firstArrival: "11:00",
      gapMinutes: 35,
      end: "15:00",
      arriveStop: DIFFERENT_A,
      departStop: DIFFERENT_B,
    });
    const analysis = analyseJourneys({ journeys: [bad, usable], preferences: DEFAULT_PREFS, style: "fastest" });
    expect(analysis.options[0]?.journey.id).toBe("london-marseille-usable");
    expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).not.toContain("london-marseille-2m");
  });

  it("København → Barcelona fixture: a 3-minute Hamburg connection cannot win Fastest", () => {
    const bad = twoLegJourney({
      id: "cph-barcelona-3m-hamburg",
      start: "08:00",
      firstArrival: "13:00",
      gapMinutes: 3,
      end: "23:00",
      arriveStop: { name: "Hamburg Hbf", lat: 53.5528, lon: 10.0064 },
      departStop: { name: "Hamburg Hauptbahnhof", lat: 53.5528, lon: 10.0064 },
      operatorA: "DSB",
      operatorB: "DB",
    });
    const usable = twoLegJourney({
      id: "cph-barcelona-usable",
      start: "08:00",
      firstArrival: "13:00",
      gapMinutes: 20,
      end: "23:20",
      arriveStop: { name: "Hamburg Hbf", lat: 53.5528, lon: 10.0064 },
      departStop: { name: "Hamburg Hauptbahnhof", lat: 53.5528, lon: 10.0064 },
      operatorA: "DSB",
      operatorB: "DB",
    });
    const analysis = analyseJourneys({ journeys: [bad, usable], preferences: DEFAULT_PREFS, style: "fastest" });
    expect(analysis.options[0]?.journey.id).toBe("cph-barcelona-usable");
  });

  it("keeps Station Complex semantics intact while applying the generic floor", () => {
    const sameComplex = twoLegJourney({
      id: "same-complex-tight",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 19,
      end: "11:00",
      arriveStop: SAME_COMPLEX_A,
      departStop: SAME_COMPLEX_B,
    });
    const sameComplexConnection = evaluateConnections(sameComplex, 15)[0]!;
    expect(sameComplexConnection.stationRelation).toBe("SAME_COMPLEX");
    expect(sameComplexConnection.stationChange).toBe(false);
    expect(evaluateJourneyUsability([sameComplexConnection]).usable).toBe(true);

    const connected = twoLegJourney({
      id: "connected-complex-impossible",
      start: "08:00",
      firstArrival: "09:00",
      gapMinutes: 5,
      end: "11:00",
      arriveStop: CONNECTED_A,
      departStop: CONNECTED_B,
    });
    const connectedConnection = evaluateConnections(connected, 15)[0]!;
    expect(connectedConnection.stationRelation).toBe("CONNECTED_COMPLEX");
    expect(connectedConnection.recommendedMinutes).toBe(30);
    expect(evaluateJourneyUsability([connectedConnection]).usable).toBe(false);
  });

  it("keeps legitimate 24–32 h long journeys when time is mostly onboard or planned overnight", () => {
    const best = journeyFromTimes("stockholm-firenze-best", [
      absoluteLeg({
        fromName: "Stockholm C",
        toName: "Hamburg Hbf",
        departure: "2026-09-16T08:43:00Z",
        arrival: "2026-09-16T19:57:00Z",
      }),
      absoluteLeg({
        fromName: "Hamburg Hbf",
        toName: "Basel SBB",
        departure: "2026-09-16T20:11:00Z",
        arrival: "2026-09-17T06:21:00Z",
      }),
      absoluteLeg({
        fromName: "Basel SBB",
        toName: "Zürich HB",
        departure: "2026-09-17T06:33:00Z",
        arrival: "2026-09-17T07:26:00Z",
      }),
      absoluteLeg({
        fromName: "Zürich HB",
        toName: "Milano Centrale",
        departure: "2026-09-17T07:33:00Z",
        arrival: "2026-09-17T10:50:00Z",
      }),
      absoluteLeg({
        fromName: "Milano Centrale",
        toName: "Firenze S.M.N.",
        departure: "2026-09-17T11:10:00Z",
        arrival: "2026-09-17T13:04:00Z",
      }),
    ]);
    const legitimate = journeyFromTimes("stockholm-firenze-legitimate-long", [
      absoluteLeg({
        fromName: "Stockholm C",
        toName: "Malmö C",
        departure: "2026-09-16T10:23:00Z",
        arrival: "2026-09-16T14:53:00Z",
      }),
      absoluteLeg({
        fromName: "Malmö C",
        toName: "København H",
        departure: "2026-09-16T14:59:00Z",
        arrival: "2026-09-16T15:36:00Z",
      }),
      absoluteLeg({
        fromName: "København H",
        toName: "Hamburg Hbf",
        departure: "2026-09-16T16:22:00Z",
        arrival: "2026-09-16T21:04:00Z",
      }),
      absoluteLeg({
        fromName: "Hamburg Hbf",
        toName: "München Hbf",
        departure: "2026-09-17T03:01:00Z",
        arrival: "2026-09-17T08:49:00Z",
      }),
      absoluteLeg({
        fromName: "München Hbf",
        toName: "Verona Porta Nuova",
        departure: "2026-09-17T09:23:00Z",
        arrival: "2026-09-17T14:59:00Z",
      }),
      absoluteLeg({
        fromName: "Verona Porta Nuova",
        toName: "Firenze S.M.N.",
        departure: "2026-09-17T15:52:00Z",
        arrival: "2026-09-17T17:24:00Z",
      }),
    ]);

    const facts = journeyFacts(legitimate, DEFAULT_PREFS.minTransferMinutes);
    const metrics = journeyDeadTimeMetrics(legitimate, facts, best.durationMinutes);
    expect(metrics).toMatchObject({ longestWaitMinutes: 357, totalWaitMinutes: 496 });
    expect(metrics.elapsedRatioToBest).toBeGreaterThan(1.09);
    expect(metrics.elapsedRatioToBest).toBeLessThan(1.13);
    expect(evaluateJourneyDeadTimeUsability(legitimate, facts, best.durationMinutes).usable).toBe(true);

    const analysis = analyseJourneys({ journeys: [best, legitimate], preferences: DEFAULT_PREFS, style: "recommended" });
    expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).toContain(
      "stockholm-firenze-legitimate-long",
    );
  });

  it("removes 59 h junk when elapsed time is extreme and most added time is dead time", () => {
    const good = journeyFromTimes("usable-reference", [
      absoluteLeg({ fromName: "A", toName: "B", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T18:00:00+02:00" }),
      absoluteLeg({ fromName: "B", toName: "C", departure: "2026-09-08T18:45:00+02:00", arrival: "2026-09-09T09:00:00+02:00" }),
    ]);
    const junk = journeyFromTimes("59h-dead-time", [
      absoluteLeg({ fromName: "A", toName: "B", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T18:00:00+02:00" }),
      absoluteLeg({ fromName: "B", toName: "C", departure: "2026-09-10T10:00:00+02:00", arrival: "2026-09-10T19:00:00+02:00" }),
      absoluteLeg({ fromName: "C", toName: "D", departure: "2026-09-10T20:00:00+02:00", arrival: "2026-09-10T21:00:00+02:00" }),
    ]);

    const analysis = analyseJourneys({ journeys: [good, junk], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.unusableCount).toBe(1);
    expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).not.toContain("59h-dead-time");
  });

  it("removes 42 h timetable-expansion junk when it is much slower and dead-time dominated", () => {
    const cphBarcelonaUsable = journeyFromTimes("cph-barcelona-usable", [
      absoluteLeg({ fromName: "København H", toName: "Hamburg Hbf", departure: "2026-09-16T10:22:00Z", arrival: "2026-09-16T15:13:00Z" }),
      absoluteLeg({ fromName: "Hamburg Hbf", toName: "Basel SBB", departure: "2026-09-16T16:29:00Z", arrival: "2026-09-16T23:10:00Z" }),
      absoluteLeg({ fromName: "Basel SBB", toName: "Mulhouse", departure: "2026-09-17T03:21:00Z", arrival: "2026-09-17T03:43:00Z" }),
      absoluteLeg({ fromName: "Mulhouse", toName: "Montpellier Saint-Roch", departure: "2026-09-17T05:52:00Z", arrival: "2026-09-17T10:52:00Z" }),
      absoluteLeg({ fromName: "Montpellier Saint-Roch", toName: "Narbonne", departure: "2026-09-17T11:07:00Z", arrival: "2026-09-17T11:58:00Z" }),
      absoluteLeg({ fromName: "Narbonne", toName: "Portbou", departure: "2026-09-17T12:07:00Z", arrival: "2026-09-17T13:44:00Z" }),
      absoluteLeg({ fromName: "Portbou", toName: "Barcelona", departure: "2026-09-17T14:05:00Z", arrival: "2026-09-17T16:34:00Z" }),
    ]);
    const cphBarcelonaJunk = journeyFromTimes("cph-barcelona-42h-junk", [
      absoluteLeg({ fromName: "København H", toName: "Hamburg Hbf", departure: "2026-09-16T10:22:00Z", arrival: "2026-09-16T15:13:00Z" }),
      absoluteLeg({ fromName: "Hamburg Hbf", toName: "Basel SBB", departure: "2026-09-16T16:29:00Z", arrival: "2026-09-16T23:10:00Z" }),
      absoluteLeg({ fromName: "Basel SBB", toName: "Lyon Part Dieu", departure: "2026-09-17T18:30:00Z", arrival: "2026-09-17T23:20:00Z" }),
      absoluteLeg({ fromName: "Lyon Part Dieu", toName: "Barcelona", departure: "2026-09-18T03:33:00Z", arrival: "2026-09-18T04:35:00Z" }),
    ]);

    const facts = journeyFacts(cphBarcelonaJunk, DEFAULT_PREFS.minTransferMinutes);
    const metrics = journeyDeadTimeMetrics(cphBarcelonaJunk, facts, cphBarcelonaUsable.durationMinutes);
    expect(metrics.longestWaitMinutes).toBe(1160);
    expect(metrics.totalWaitMinutes).toBe(1489);
    expect(metrics.elapsedRatioToBest).toBeGreaterThan(1.35);

    const analysis = analyseJourneys({
      journeys: [cphBarcelonaUsable, cphBarcelonaJunk],
      preferences: DEFAULT_PREFS,
      style: "fastest",
    });
    expect(analysis.options[0]?.journey.id).toBe("cph-barcelona-usable");
    expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).not.toContain(
      "cph-barcelona-42h-junk",
    );
  });

  it("removes 116 h junk even when it is the only candidate because the standalone wait is extreme", () => {
    const junk = journeyFromTimes("116h-dead-time", [
      absoluteLeg({ fromName: "A", toName: "B", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T18:00:00+02:00" }),
      absoluteLeg({ fromName: "B", toName: "C", departure: "2026-09-11T04:00:00+02:00", arrival: "2026-09-11T12:00:00+02:00" }),
      absoluteLeg({ fromName: "C", toName: "D", departure: "2026-09-12T23:30:00+02:00", arrival: "2026-09-13T04:00:00+02:00" }),
    ]);

    const facts = journeyFacts(junk, DEFAULT_PREFS.minTransferMinutes);
    const metrics = journeyDeadTimeMetrics(junk, facts, null);
    expect(metrics.longestWaitMinutes).toBe(3480);
    expect(metrics.totalWaitMinutes).toBe(5610);
    expect(evaluateJourneyDeadTimeUsability(junk, facts, null)).toMatchObject({
      usable: false,
      reasons: ["pathologicalDeadTime"],
    });

    const analysis = analyseJourneys({ journeys: [junk], preferences: DEFAULT_PREFS, style: "recommended" });
    expect(analysis.allJourneysUnusable).toBe(true);
    expect(analysis.options).toEqual([]);
    expect(analysis.more).toEqual([]);
  });

  it("does not let pathological dead-time journeys enter Recommended, Fastest, Comfortable or show-more", () => {
    const good = journeyFromTimes("healthy-long-route", [
      absoluteLeg({ fromName: "A", toName: "B", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T18:00:00+02:00" }),
      absoluteLeg({ fromName: "B", toName: "C", departure: "2026-09-08T18:45:00+02:00", arrival: "2026-09-09T08:00:00+02:00" }),
    ]);
    const deadTime = journeyFromTimes("dead-time-fastest-trap", [
      absoluteLeg({ fromName: "A", toName: "B", departure: "2026-09-08T08:00:00+02:00", arrival: "2026-09-08T12:00:00+02:00" }),
      absoluteLeg({ fromName: "B", toName: "C", departure: "2026-09-09T10:30:00+02:00", arrival: "2026-09-09T12:00:00+02:00" }),
      absoluteLeg({ fromName: "C", toName: "D", departure: "2026-09-09T13:00:00+02:00", arrival: "2026-09-10T12:00:00+02:00" }),
    ]);

    for (const style of ["recommended", "fastest", "comfortable"] as const) {
      const analysis = analyseJourneys({ journeys: [good, deadTime], preferences: DEFAULT_PREFS, style });
      expect(analysis.options[0]?.journey.id).toBe("healthy-long-route");
      expect([...analysis.options, ...analysis.more].map((item) => item.journey.id)).not.toContain(
        "dead-time-fastest-trap",
      );
    }
  });
});
