// City access-leg trimming inside the server normalisation pipeline: mixed
// endpoint intents and the post-trim search-time guard.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Place } from "./journey";

const WIEN_CITY: Place = { name: "Wien", place: "48.208000,16.372000", intent: "city" };
const ROMA_CITY: Place = { name: "Roma", place: "41.902800,12.496400", intent: "city" };
const WIEN_HBF: Place = {
  name: "Wien Hauptbahnhof",
  place: "48.185470,16.376730",
  stopId: "at_Pat:49:1349",
  intent: "station",
};
const ROMA_TERMINI: Place = {
  name: "Roma Termini",
  place: "41.900900,12.502200",
  stopId: "it_IT::Station:830008409",
  intent: "station",
};

const DEPART_AT = "2026-09-08T06:00:00.000Z"; // 08:00 Europe/Vienna

const motisLeg = (
  mode: string,
  fromName: string,
  toName: string,
  startTime: string,
  endTime: string,
) => ({
  mode,
  from: { name: fromName, lat: 48.2, lon: 16.37 },
  to: { name: toName, lat: 41.9, lon: 12.5 },
  startTime,
  endTime,
  duration: Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000),
  agencyName: "ÖBB",
});

/** START → walk → metro → Wien Hbf → rail → Roma Termini → walk → END. */
const cityItinerary = (railStart = "2026-09-08T06:30:00Z") => ({
  duration: 60000,
  startTime: "2026-09-08T05:52:00Z",
  endTime: "2026-09-08T19:30:00Z",
  transfers: 1,
  legs: [
    motisLeg("WALK", "START", "Wien Stephansplatz", "2026-09-08T05:52:00Z", "2026-09-08T05:58:00Z"),
    motisLeg("SUBWAY", "Wien Stephansplatz", "Wien Hauptbahnhof", "2026-09-08T06:00:00Z", "2026-09-08T06:06:00Z"),
    motisLeg("LONG_DISTANCE", "Wien Hauptbahnhof", "Roma Termini", railStart, "2026-09-08T19:00:00Z"),
    motisLeg("WALK", "Roma Termini", "END", "2026-09-08T19:05:00Z", "2026-09-08T19:30:00Z"),
  ],
});

const metroOnlyItinerary = {
  duration: 1800,
  startTime: "2026-09-08T06:10:00Z",
  endTime: "2026-09-08T06:40:00Z",
  transfers: 0,
  legs: [
    motisLeg("WALK", "START", "Wien Stephansplatz", "2026-09-08T06:10:00Z", "2026-09-08T06:16:00Z"),
    motisLeg("SUBWAY", "Wien Stephansplatz", "Wien Mitte", "2026-09-08T06:18:00Z", "2026-09-08T06:40:00Z"),
  ],
};

let responders: (() => Response)[] = [];
const ok = (itineraries: unknown[]) => () =>
  new Response(JSON.stringify({ itineraries }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

let planJourneys: typeof import("./rail.server").planJourneys;

beforeEach(async () => {
  responders = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => (responders.shift() ?? ok([]))()),
  );
  vi.resetModules();
  ({ planJourneys } = await import("./rail.server"));
});

afterEach(() => vi.unstubAllGlobals());

const plan = (from: Place, to: Place) =>
  planJourneys({ from, to, via: [], departAt: DEPART_AT, maxTransfers: 4, minTransferMinutes: 15 });

describe("mixed endpoint intents", () => {
  it("CITY → CITY trims both ends and recomputes metrics", async () => {
    responders = [ok([cityItinerary()])];
    const [journey] = await plan(WIEN_CITY, ROMA_CITY);
    expect(journey!.legs.map((l) => l.mode)).toEqual(["LONG_DISTANCE"]);
    expect(journey!.legs[0]!.fromName).toBe("Wien Hauptbahnhof");
    expect(journey!.departure).toBe("2026-09-08T06:30:00Z");
    expect(journey!.arrival).toBe("2026-09-08T19:00:00Z");
    expect(journey!.durationMinutes).toBe(750);
    expect(journey!.transfers).toBe(0);
    expect(journey!.minTransferMinutes).toBeUndefined();
  });

  it("CITY → STATION trims the origin prefix only", async () => {
    responders = [ok([cityItinerary()])];
    const [journey] = await plan(WIEN_CITY, ROMA_TERMINI);
    expect(journey!.legs.map((l) => l.mode)).toEqual(["LONG_DISTANCE", "WALK"]);
  });

  it("STATION → CITY trims the destination suffix only", async () => {
    responders = [ok([cityItinerary()])];
    const [journey] = await plan(WIEN_HBF, ROMA_CITY);
    expect(journey!.legs.map((l) => l.mode)).toEqual(["WALK", "SUBWAY", "LONG_DISTANCE"]);
  });

  it("STATION → STATION is unchanged", async () => {
    responders = [ok([cityItinerary()])];
    const [journey] = await plan(WIEN_HBF, ROMA_TERMINI);
    expect(journey!.legs.map((l) => l.mode)).toEqual([
      "WALK",
      "SUBWAY",
      "LONG_DISTANCE",
      "WALK",
    ]);
    expect(journey!.departure).toBe("2026-09-08T05:52:00Z");
  });
});

describe("degenerate itineraries", () => {
  it("discards an itinerary without a meaningful rail anchor", async () => {
    responders = [ok([metroOnlyItinerary]), ok([])];
    expect(await plan(WIEN_CITY, ROMA_CITY)).toEqual([]);
  });
});

describe("search-time guard", () => {
  it("drops a city journey whose rail departure precedes the requested time", async () => {
    responders = [ok([cityItinerary("2026-09-08T05:55:00Z")]), ok([])];
    expect(await plan(WIEN_CITY, ROMA_CITY)).toEqual([]);
  });

  it("keeps a city journey departing exactly at the requested time", async () => {
    responders = [ok([cityItinerary(DEPART_AT)])];
    const [journey] = await plan(WIEN_CITY, ROMA_CITY);
    expect(journey!.departure).toBe(DEPART_AT);
  });

  it("does not apply the guard to station origins", async () => {
    responders = [ok([cityItinerary("2026-09-08T05:55:00Z")])];
    const journeys = await plan(WIEN_HBF, ROMA_TERMINI);
    expect(journeys).toHaveLength(1);
  });
});
