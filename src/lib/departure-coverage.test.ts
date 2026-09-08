// Phase F1: departure coverage for ordinary two-point searches. The request
// shape changes (timetableView=true), the request COUNT does not, Via keeps its
// chained behaviour, and normalised candidates are capped conservatively.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Place } from "./journey";

const STOCKHOLM: Place = {
  name: "Stockholm Centralstation",
  place: "59.330140,18.058150",
  country: "SE",
  stopId: "se-Trafiklab_740000001",
  intent: "station",
};
const GOTEBORG: Place = {
  name: "Göteborg Centralstation",
  place: "57.708870,11.973380",
  country: "SE",
  stopId: "se-Trafiklab_740000002",
  intent: "station",
};
const PARIS_CITY: Place = {
  name: "Paris, Île-de-France",
  place: "48.856610,2.351499",
  country: "FR",
  intent: "city",
};
const LYON_CITY: Place = {
  name: "Lyon, Auvergne-Rhône-Alpes",
  place: "45.757800,4.832000",
  country: "FR",
  intent: "city",
};
const MALMO: Place = {
  name: "Malmö Centralstation",
  place: "55.609540,13.000180",
  country: "SE",
  stopId: "se-Trafiklab_740000003",
};

type Recorded = { url: string; params: URLSearchParams };
let calls: Recorded[] = [];

const leg = (start: string, end: string) => ({
  mode: "HIGHSPEED_RAIL",
  from: { name: "Stockholm Centralstation", lat: 59.33014, lon: 18.05815 },
  to: { name: "Göteborg Centralstation", lat: 57.70887, lon: 11.97338 },
  startTime: start,
  endTime: end,
  duration: (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  agencyName: "SJ",
});

const itinerary = (start: string, end: string) => ({
  duration: (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  startTime: start,
  endTime: end,
  transfers: 0,
  legs: [leg(start, end)],
});

let planJourneys: typeof import("./rail.server").planJourneys;
let MAX_CANDIDATE_JOURNEYS: number;
let itineraries: unknown[] = [];

beforeEach(async () => {
  calls = [];
  itineraries = [itinerary("2026-09-16T06:00:00Z", "2026-09-16T09:00:00Z")];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string) => {
      const url = new URL(String(input));
      calls.push({ url: String(input), params: url.searchParams });
      return new Response(JSON.stringify({ itineraries }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  vi.resetModules();
  ({ planJourneys, MAX_CANDIDATE_JOURNEYS } = await import("./rail.server"));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

let seq = 0;
const departAt = () => `2026-09-1${(seq++ % 9) + 1}T06:00:00.000Z`;

const plan = (from: Place, to: Place, via: Place[] = [], at = departAt()) =>
  planJourneys({ from, to, via, departAt: at, maxTransfers: 4, minTransferMinutes: 15 });

const planCalls = () => calls.filter((c) => c.url.includes("/api/v3/plan"));

describe("F1: two-point departure coverage", () => {
  it("requests timetable mode with numItineraries=6 in a single call", async () => {
    await plan(STOCKHOLM, GOTEBORG);
    expect(planCalls()).toHaveLength(1);
    expect(planCalls()[0]!.params.get("timetableView")).toBe("true");
    expect(planCalls()[0]!.params.get("numItineraries")).toBe("6");
  });

  it("preserves exact stop-id endpoints in timetable mode", async () => {
    await plan(STOCKHOLM, GOTEBORG);
    const params = planCalls()[0]!.params;
    expect(params.get("fromPlace")).toBe(STOCKHOLM.stopId);
    expect(params.get("toPlace")).toBe(GOTEBORG.stopId);
    expect(params.get("radius")).toBeNull();
  });

  it("preserves city intent (coordinates + radius) in timetable mode", async () => {
    await plan(PARIS_CITY, LYON_CITY);
    const params = planCalls()[0]!.params;
    expect(params.get("fromPlace")).toBe(PARIS_CITY.place);
    expect(params.get("toPlace")).toBe(LYON_CITY.place);
    expect(params.get("radius")).toBeTruthy();
    expect(params.get("timetableView")).toBe("true");
  });

  it("keeps successive departures as separate journeys", async () => {
    itineraries = [
      itinerary("2026-09-16T06:17:00Z", "2026-09-16T09:17:00Z"),
      itinerary("2026-09-16T07:17:00Z", "2026-09-16T10:17:00Z"),
      itinerary("2026-09-16T08:17:00Z", "2026-09-16T11:17:00Z"),
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-09-16T06:00:00.000Z");
    expect(journeys.map((j) => j.departure)).toEqual([
      "2026-09-16T06:17:00Z",
      "2026-09-16T07:17:00Z",
      "2026-09-16T08:17:00Z",
    ]);
  });

  it("caps normalised candidates and keeps the earliest departures", async () => {
    itineraries = Array.from({ length: 12 }, (_, i) =>
      itinerary(
        `2026-09-16T${String(6 + i).padStart(2, "0")}:00:00Z`,
        `2026-09-16T${String(9 + i).padStart(2, "0")}:00:00Z`,
      ),
    );
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-09-16T06:00:00.000Z");
    expect(MAX_CANDIDATE_JOURNEYS).toBe(8);
    expect(journeys).toHaveLength(8);
    expect(journeys[0]!.departure).toBe("2026-09-16T06:00:00Z");
    expect(journeys[7]!.departure).toBe("2026-09-16T13:00:00Z");
  });

  it("keeps a plain direct journey intact", async () => {
    const journeys = await plan(STOCKHOLM, GOTEBORG);
    expect(journeys).toHaveLength(1);
    expect(journeys[0]!.legs).toHaveLength(1);
    expect(journeys[0]!.transfers).toBe(0);
  });
});

describe("F1: Via searches are unchanged", () => {
  it("keeps timetableView=false and the same chained call count", async () => {
    await plan(STOCKHOLM, GOTEBORG, [MALMO]);
    const via = planCalls();
    expect(via.length).toBeGreaterThan(1);
    for (const call of via) expect(call.params.get("timetableView")).toBe("false");
    expect(new Set(via.map((c) => c.params.get("numItineraries")))).toEqual(new Set(["4"]));
  });
});
