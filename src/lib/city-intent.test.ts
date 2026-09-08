// Phase 3B: city intent + radius-based terminal selection.
//
// A city endpoint is routed as "the city": coordinate plus a bounded radius, so
// Transitous picks the terminal that fits the actual route. An explicitly chosen
// station keeps Phase 2/3A exact stop-id routing and never gets a radius.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GEOCODE_FIXTURES } from "./__fixtures__/geocode";
import type { Place } from "./journey";
import { PlaceSchema } from "./place-schema";
import { toPlaces } from "./rail.server";
import { CITY_ENDPOINT_RADIUS_M, isCityEndpoint, segmentRadius } from "./stop-endpoint";

const LONDON_CITY: Place = {
  name: "London",
  place: "51.507400,-0.127800",
  country: "GB",
  intent: "city",
};
const FIRENZE_CITY: Place = {
  name: "Firenze",
  place: "43.769560,11.255810",
  country: "IT",
  intent: "city",
};
const EUSTON: Place = {
  name: "London Euston",
  place: "51.528100,-0.133700",
  country: "GB",
  stopId: "gb-great-britain_9100EUSTON",
  intent: "station",
};
const FIRENZE_SMN: Place = {
  name: "Firenze S.M.N.",
  place: "43.776500,11.248200",
  country: "IT",
  stopId: "it-trenitalia_IT::Quay:otherTRENITALIA:830006421",
  intent: "station",
};
const WIEN_VIA: Place = {
  name: "Wien Hbf",
  place: "48.185470,16.376730",
  country: "AT",
  stopId: "at-Railway-Current-Reference-Data-2026_Pat:49:1349",
  intent: "station",
};

type Recorded = { url: string; params: URLSearchParams };
let calls: Recorded[] = [];
type Responder = () => Response;
let responders: Responder[] = [];

const ok = (itineraries: unknown[] = []): Responder => () =>
  new Response(JSON.stringify({ itineraries }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
const fail = (status: number): Responder => () =>
  new Response(JSON.stringify({ error: "nope" }), { status });

const itinerary = (fromName: string, toName: string) => ({
  duration: 3600,
  startTime: "2026-10-01T06:00:00Z",
  endTime: "2026-10-01T07:00:00Z",
  transfers: 0,
  legs: [
    {
      mode: "HIGHSPEED_RAIL",
      from: { name: fromName, lat: 51.5319, lon: -0.126 },
      to: { name: toName, lat: 43.7765, lon: 11.2482 },
      startTime: "2026-10-01T06:00:00Z",
      endTime: "2026-10-01T07:00:00Z",
      duration: 3600,
      agencyName: "Eurostar",
    },
  ],
});

let planJourneys: typeof import("./rail.server").planJourneys;

beforeEach(async () => {
  calls = [];
  responders = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string) => {
      const url = new URL(String(input));
      calls.push({ url: String(input), params: url.searchParams });
      return (responders.shift() ?? ok())();
    }),
  );
  vi.resetModules();
  ({ planJourneys } = await import("./rail.server"));
});

afterEach(() => vi.unstubAllGlobals());

let seq = 0;
const departAt = () => `2026-09-0${(seq++ % 9) + 1}T06:00:00.000Z`;
const plan = (from: Place, to: Place, via: Place[] = []) =>
  planJourneys({ from, to, via, departAt: departAt(), maxTransfers: 4, minTransferMinutes: 15 });
const planCalls = () => calls.filter((c) => c.url.includes("/api/v3/plan"));
const shape = (index = 0) => {
  const p = planCalls()[index]!.params;
  return { from: p.get("fromPlace"), to: p.get("toPlace"), radius: p.get("radius") };
};

describe("A+B. autocomplete results carry the right intent", () => {
  it("a rail station result is station intent", () => {
    const places = toPlaces(GEOCODE_FIXTURES["London"]!, 20);
    const station = places.find((p) => /euston|pancras/i.test(p.name));
    expect(station?.intent).toBe("station");
    expect(station?.stopId).toBeTruthy();
  });

  it("a city result is city intent and carries no stop id", () => {
    const cityHits = Object.values(GEOCODE_FIXTURES).flat();
    const cities = toPlaces(cityHits, 50).filter((p) => p.intent === "city");
    expect(cities.length).toBeGreaterThan(0);
    for (const city of cities) expect(city.stopId).toBeUndefined();
  });
});

describe("C+D. validation of the optional intent field", () => {
  const legacy = { name: "Stockholm Centralstation", place: "59.330140,18.058150" };

  it("legacy Place without intent stays valid", () => {
    expect(PlaceSchema.parse(legacy).intent).toBeUndefined();
    expect(isCityEndpoint(PlaceSchema.parse(legacy))).toBe(false);
  });

  it("accepts city and station only", () => {
    expect(PlaceSchema.parse({ ...legacy, intent: "city" }).intent).toBe("city");
    expect(PlaceSchema.parse({ ...legacy, intent: "station" }).intent).toBe("station");
    expect(() => PlaceSchema.parse({ ...legacy, intent: "quay" })).toThrow();
    expect(() => PlaceSchema.parse({ ...legacy, intent: 1 })).toThrow();
  });
});

describe("E+F+G+H. endpoint strategy per combination", () => {
  it("city → city uses coordinates plus radius", async () => {
    responders = [ok([itinerary("London St Pancras International", "Firenze S.M.N.")])];
    await plan(LONDON_CITY, FIRENZE_CITY);
    expect(shape()).toEqual({
      from: LONDON_CITY.place,
      to: FIRENZE_CITY.place,
      radius: String(CITY_ENDPOINT_RADIUS_M),
    });
  });

  it("station → station uses stop ids and no radius", async () => {
    responders = [ok([itinerary("London Euston", "Firenze S.M.N.")])];
    await plan(EUSTON, FIRENZE_SMN);
    expect(shape()).toEqual({ from: EUSTON.stopId, to: FIRENZE_SMN.stopId, radius: null });
  });

  it("city → station mixes coordinate+radius with an exact id", async () => {
    responders = [ok([itinerary("London St Pancras International", "Firenze S.M.N.")])];
    await plan(LONDON_CITY, FIRENZE_SMN);
    expect(shape()).toEqual({
      from: LONDON_CITY.place,
      to: FIRENZE_SMN.stopId,
      radius: String(CITY_ENDPOINT_RADIUS_M),
    });
  });

  it("station → city mixes an exact id with coordinate+radius", async () => {
    responders = [ok([itinerary("London Euston", "Firenze S.M.N.")])];
    await plan(EUSTON, FIRENZE_CITY);
    expect(shape()).toEqual({
      from: EUSTON.stopId,
      to: FIRENZE_CITY.place,
      radius: String(CITY_ENDPOINT_RADIUS_M),
    });
  });

  it("segmentRadius only fires when an endpoint is a city", () => {
    expect(segmentRadius(EUSTON, FIRENZE_SMN)).toBeUndefined();
    expect(segmentRadius(LONDON_CITY, FIRENZE_SMN)).toBe(CITY_ENDPOINT_RADIUS_M);
    expect(segmentRadius(EUSTON, FIRENZE_CITY)).toBe(CITY_ENDPOINT_RADIUS_M);
  });
});

describe("I+J+K. request count and the city fallback policy", () => {
  it("a successful city search costs exactly one plan request", async () => {
    responders = [ok([itinerary("London St Pancras International", "Firenze S.M.N.")])];
    await plan(LONDON_CITY, FIRENZE_CITY);
    expect(planCalls()).toHaveLength(1);
  });

  it("no itinerary with radius retries once with plain city coordinates", async () => {
    responders = [ok([]), ok([itinerary("London Waterloo", "Firenze S.M.N.")])];
    const journeys = await plan(LONDON_CITY, FIRENZE_CITY);
    expect(planCalls()).toHaveLength(2);
    expect(shape(0).radius).toBe(String(CITY_ENDPOINT_RADIUS_M));
    expect(shape(1)).toEqual({ from: LONDON_CITY.place, to: FIRENZE_CITY.place, radius: null });
    expect(journeys).toHaveLength(1);
  });

  it("an empty result after the fallback stops there", async () => {
    responders = [ok([]), ok([])];
    const journeys = await plan(LONDON_CITY, FIRENZE_CITY);
    expect(journeys).toEqual([]);
    expect(planCalls()).toHaveLength(2);
  });

  it("an explicit station search with no itinerary never retries", async () => {
    responders = [ok([])];
    expect(await plan(EUSTON, FIRENZE_SMN)).toEqual([]);
    expect(planCalls()).toHaveLength(1);
  });
});

describe("L. Via stays anchored to a concrete station endpoint", () => {
  it("never applies city radius to a via point", async () => {
    responders = Array.from({ length: 8 }, () =>
      ok([itinerary("London St Pancras International", "Wien Hbf")]),
    );
    await plan(LONDON_CITY, FIRENZE_CITY, [{ ...WIEN_VIA, intent: "city" }]);

    for (const call of planCalls()) {
      const from = call.params.get("fromPlace");
      const to = call.params.get("toPlace");
      if (from === WIEN_VIA.place || to === WIEN_VIA.place) {
        throw new Error("via was routed by city coordinate");
      }
      expect([from, to]).toContain(WIEN_VIA.stopId);
    }
  });
});

describe("M. the Phase 2/3A stop-id fallback is unchanged", () => {
  it("400/404 on a station id retries once with coordinates", async () => {
    responders = [fail(404), ok([itinerary("London Euston", "Firenze S.M.N.")])];
    const journeys = await plan(EUSTON, FIRENZE_SMN);
    expect(planCalls()).toHaveLength(2);
    expect(shape(1)).toEqual({ from: EUSTON.place, to: FIRENZE_SMN.place, radius: null });
    expect(journeys).toHaveLength(1);
  });

  it("an outage is still surfaced without a retry", async () => {
    responders = [fail(500)];
    await expect(plan(EUSTON, FIRENZE_SMN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(1);
  });
});

describe("N. journeys report the terminals Transitous actually chose", () => {
  it("a city search shows the routed station names, not the city labels", async () => {
    responders = [ok([itinerary("London St Pancras International", "Firenze S.M.N.")])];
    const journeys = await plan(LONDON_CITY, FIRENZE_CITY);
    const leg = journeys[0]!.legs[0]!;
    expect(leg.fromName).toBe("London St Pancras International");
    expect(leg.toName).toBe("Firenze S.M.N.");
    expect(leg.fromName).not.toBe(LONDON_CITY.name);
  });
});
