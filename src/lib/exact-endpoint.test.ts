// Phase 2 of exact rail endpoints: /plan is anchored to the exact Transitous
// railway station when Euroute knows a trustworthy station-level id, with a
// single coordinate retry when that id turns out to be unusable.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Place } from "./journey";
import { planEndpoint, routingStopId, stopIdLevel } from "./stop-endpoint";

const STOCKHOLM: Place = {
  name: "Stockholm Centralstation",
  place: "59.330140,18.058150",
  country: "SE",
  stopId: "se-Trafiklab_740000001",
};
const HAMBURG_COORDS: Place = {
  name: "Hamburg Hauptbahnhof",
  place: "53.552480,10.008090",
  country: "DE",
};
const WIEN: Place = {
  name: "Wien Hbf",
  place: "48.185470,16.376730",
  country: "AT",
  stopId: "at-Railway-Current-Reference-Data-2026_Pat:49:1349",
};
const PARIS_NORD: Place = {
  name: "Paris Gare du Nord",
  place: "48.880900,2.354940",
  country: "FR",
  stopId: "fr-fr-sncf-ter_StopArea:OCE87271007",
};

type Recorded = { url: string; params: URLSearchParams };

let calls: Recorded[] = [];

/** Queue of responses, consumed in request order. */
type Responder = () => Response | Promise<Response>;
let responders: Responder[] = [];

const ok = (itineraries: unknown[] = []): Responder => () =>
  new Response(JSON.stringify({ itineraries }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const fail = (status: number): Responder => () =>
  new Response(JSON.stringify({ error: "nope" }), { status });

const railItinerary = (extraLegs: unknown[] = []) => ({
  duration: 3600,
  startTime: "2026-09-01T06:00:00Z",
  endTime: "2026-09-01T07:00:00Z",
  transfers: 0,
  legs: [
    {
      mode: "HIGHSPEED_RAIL",
      from: { name: "Stockholm Centralstation", lat: 59.33014, lon: 18.05815 },
      to: { name: "Hamburg Hbf", lat: 53.55248, lon: 10.00809 },
      startTime: "2026-09-01T06:00:00Z",
      endTime: "2026-09-01T07:00:00Z",
      duration: 3600,
      agencyName: "SJ",
    },
    ...extraLegs,
  ],
});

let planJourneys: typeof import("./rail.server").planJourneys;
let clock = 0;

beforeEach(async () => {
  calls = [];
  responders = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string) => {
      const url = new URL(String(input));
      calls.push({ url: String(input), params: url.searchParams });
      const responder = responders.shift() ?? ok();
      return responder();
    }),
  );
  // Fresh module per test so the 90 s plan cache never bridges cases.
  vi.resetModules();
  ({ planJourneys } = await import("./rail.server"));
  clock += 1;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Unique departure per call so cache keys differ even within one test. */
let seq = 0;
const departAt = () => `2026-09-0${(seq++ % 9) + 1}T06:00:00.000Z`;

const plan = (from: Place, to: Place, via: Place[] = []) =>
  planJourneys({
    from,
    to,
    via,
    departAt: departAt(),
    maxTransfers: 4,
    minTransferMinutes: 15,
  });

const planCalls = () => calls.filter((c) => c.url.includes("/api/v3/plan"));
const endpoints = (index = 0) => {
  const call = planCalls()[index]!;
  return { from: call.params.get("fromPlace"), to: call.params.get("toPlace") };
};

describe("A+B. endpoint selection per Place", () => {
  it("uses the exact stop id when the Place has a trustworthy one", async () => {
    responders = [ok([railItinerary()])];
    await plan(STOCKHOLM, WIEN);
    expect(endpoints()).toEqual({ from: STOCKHOLM.stopId, to: WIEN.stopId });
  });

  it("uses coordinates when the Place has no stop id", async () => {
    responders = [ok([railItinerary()])];
    await plan({ ...STOCKHOLM, stopId: undefined }, HAMBURG_COORDS);
    expect(endpoints()).toEqual({ from: STOCKHOLM.place, to: HAMBURG_COORDS.place });
  });
});

describe("C+D+E. mixed endpoints", () => {
  it("id → id", async () => {
    responders = [ok([railItinerary()])];
    await plan(STOCKHOLM, PARIS_NORD);
    expect(endpoints()).toEqual({ from: STOCKHOLM.stopId, to: PARIS_NORD.stopId });
  });

  it("id → coordinates", async () => {
    responders = [ok([railItinerary()])];
    await plan(STOCKHOLM, HAMBURG_COORDS);
    expect(endpoints()).toEqual({ from: STOCKHOLM.stopId, to: HAMBURG_COORDS.place });
  });

  it("coordinates → id", async () => {
    responders = [ok([railItinerary()])];
    await plan(HAMBURG_COORDS, WIEN);
    expect(endpoints()).toEqual({ from: HAMBURG_COORDS.place, to: WIEN.stopId });
  });
});

describe("F+G. coordinate fallback on an unusable stop id", () => {
  it("retries exactly once with coordinates on a 404 and returns the journey", async () => {
    responders = [fail(404), ok([railItinerary()])];
    const journeys = await plan(STOCKHOLM, WIEN);

    expect(planCalls()).toHaveLength(2);
    expect(endpoints(0)).toEqual({ from: STOCKHOLM.stopId, to: WIEN.stopId });
    expect(endpoints(1)).toEqual({ from: STOCKHOLM.place, to: WIEN.place });
    expect(journeys).toHaveLength(1);
    expect(journeys[0]!.legs[0]!.kind).toBe("train");
  });

  it("does not retry when both endpoints are already coordinates", async () => {
    responders = [fail(404)];
    await expect(plan({ ...STOCKHOLM, stopId: undefined }, HAMBURG_COORDS)).rejects.toThrow(
      "EUROUTE_UPSTREAM_FAILED",
    );
    expect(planCalls()).toHaveLength(1);
  });

  it("gives up after the single coordinate retry", async () => {
    responders = [fail(404), fail(404)];
    await expect(plan(STOCKHOLM, WIEN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(2);
  });
});

describe("H+I+J. failures that must not trigger a coordinate retry", () => {
  it("upstream 500 is surfaced, not retried", async () => {
    responders = [fail(500)];
    await expect(plan(STOCKHOLM, WIEN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(1);
  });

  it("rate limiting is surfaced, not retried", async () => {
    responders = [fail(429)];
    await expect(plan(STOCKHOLM, WIEN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(1);
  });

  it("a genuine no-route result is returned as-is without extra requests", async () => {
    responders = [ok([])];
    const journeys = await plan(STOCKHOLM, WIEN);
    expect(journeys).toEqual([]);
    expect(planCalls()).toHaveLength(1);
  });
});

describe("K+L. Via keeps the existing chained architecture", () => {
  it("a Via station with a stop id anchors both segment boundaries", async () => {
    responders = Array.from({ length: 8 }, () => ok([railItinerary()]));
    await plan(STOCKHOLM, PARIS_NORD, [WIEN]);

    const pairs = planCalls().map((c) => [c.params.get("fromPlace"), c.params.get("toPlace")]);
    expect(pairs).toContainEqual([STOCKHOLM.stopId, WIEN.stopId]);
    expect(pairs).toContainEqual([WIEN.stopId, PARIS_NORD.stopId]);
    // No native via= parameter in this phase.
    for (const call of planCalls()) expect(call.params.get("via")).toBeNull();
  });

  it("a legacy Via without a stop id keeps coordinates", async () => {
    responders = Array.from({ length: 8 }, () => ok([railItinerary()]));
    await plan(STOCKHOLM, PARIS_NORD, [HAMBURG_COORDS]);

    const pairs = planCalls().map((c) => [c.params.get("fromPlace"), c.params.get("toPlace")]);
    expect(pairs).toContainEqual([STOCKHOLM.stopId, HAMBURG_COORDS.place]);
    expect(pairs).toContainEqual([HAMBURG_COORDS.place, PARIS_NORD.stopId]);
  });
});

describe("M. internal local legs stay part of the itinerary", () => {
  it("keeps walking and regional legs inside an exact-endpoint journey", async () => {
    responders = [
      ok([
        railItinerary([
          {
            mode: "WALK",
            from: { name: "Paris Gare du Nord", lat: 48.8809, lon: 2.35494 },
            to: { name: "Magenta", lat: 48.8809, lon: 2.3559 },
            startTime: "2026-09-01T07:00:00Z",
            endTime: "2026-09-01T07:08:00Z",
            duration: 480,
          },
          {
            mode: "REGIONAL_RAIL",
            from: { name: "Magenta", lat: 48.8809, lon: 2.3559 },
            to: { name: "Paris Gare de Lyon", lat: 48.8443, lon: 2.3743 },
            startTime: "2026-09-01T07:12:00Z",
            endTime: "2026-09-01T07:24:00Z",
            duration: 720,
            agencyName: "RER D",
          },
        ]),
      ]),
    ];
    const journeys = await plan(STOCKHOLM, PARIS_NORD);
    const modes = journeys[0]!.legs.map((l) => l.mode);
    expect(modes).toEqual(["HIGHSPEED_RAIL", "WALK", "REGIONAL_RAIL"]);
    // transitModes is untouched, so the planner keeps its current freedom.
    expect(planCalls()[0]!.params.get("transitModes")).toBe("RAIL");
  });
});

describe("N. Phase 3a stop-id rule: the upstream id is the routing authority", () => {
  const QUAY_IDS = [
    "it-trenitalia_IT::Quay:otherTRENITALIA:830008409",
    "it-trenitalia_IT::Quay:otherTRENITALIA:830006421",
    "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1",
    "de-feed_de:08212:89:3:Bstg",
    "de-feed_de:08212:89:3:Steig:2",
    "fr-feed_FR::Quay:track-4:",
    "nl-feed_NL:platform:asd:5b",
  ];

  it("still describes quay/platform shapes as quay-level (diagnostics only)", () => {
    for (const id of QUAY_IDS) expect(stopIdLevel(id), id).toBe("quay");
  });

  it("A+B. no longer pre-rejects quay/platform-style ids", () => {
    for (const id of QUAY_IDS) {
      const place: Place = { name: "x", place: "59.1,18.1", stopId: id };
      expect(routingStopId(place), id).toBe(id);
      // Exact upstream string, never stripped or rewritten.
      expect(planEndpoint(place), id).toBe(id);
    }
  });

  const FIRENZE_SMN: Place = {
    name: "FIRENZE S.MARIA NOVELLA",
    place: "43.776160,11.248140",
    country: "IT",
    stopId: "it-trenitalia_IT::Quay:otherTRENITALIA:830006421",
  };
  const ROMA_TERMINI_QUAY: Place = {
    name: "ROMA TERMINI",
    place: "41.900503,12.502027",
    country: "IT",
    stopId: "it-trenitalia_IT::Quay:otherTRENITALIA:830008409",
  };

  it("C+J. Roma Termini → Firenze S.M.N. routes by quay ids without fallback", async () => {
    responders = [
      ok([
        {
          duration: 5760,
          startTime: "2026-09-01T06:00:00Z",
          endTime: "2026-09-01T07:36:00Z",
          transfers: 0,
          legs: [
            {
              mode: "HIGHSPEED_RAIL",
              from: { name: "ROMA TERMINI", lat: 41.900503, lon: 12.502027 },
              to: { name: "FIRENZE S.MARIA NOVELLA", lat: 43.77616, lon: 11.24814 },
              startTime: "2026-09-01T06:00:00Z",
              endTime: "2026-09-01T07:36:00Z",
              duration: 5760,
              agencyName: "Trenitalia",
            },
          ],
        },
      ]),
    ];
    const journeys = await plan(ROMA_TERMINI_QUAY, FIRENZE_SMN);

    expect(planCalls()).toHaveLength(1);
    expect(endpoints()).toEqual({ from: ROMA_TERMINI_QUAY.stopId, to: FIRENZE_SMN.stopId });
    expect(journeys).toHaveLength(1);
    expect(journeys[0]!.legs).toHaveLength(1);
    expect(journeys[0]!.legs[0]!.mode).toBe("HIGHSPEED_RAIL");
    expect(journeys[0]!.legs[0]!.toName).toBe("FIRENZE S.MARIA NOVELLA");
    expect(journeys[0]!.durationMinutes).toBe(96);
  });

  it("D. an unusable quay id falls back to coordinates exactly once on 404", async () => {
    responders = [fail(404), ok([railItinerary()])];
    await plan(STOCKHOLM, FIRENZE_SMN);
    expect(planCalls()).toHaveLength(2);
    expect(endpoints(0).to).toBe(FIRENZE_SMN.stopId);
    expect(endpoints(1).to).toBe(FIRENZE_SMN.place);
  });

  it("E. an unparseable quay id falls back to coordinates exactly once on 400", async () => {
    responders = [fail(400), ok([railItinerary()])];
    await plan(STOCKHOLM, FIRENZE_SMN);
    expect(planCalls()).toHaveLength(2);
    expect(endpoints(1).to).toBe(FIRENZE_SMN.place);
  });

  it("F+G. 500 and 429 on a quay id never trigger a fallback", async () => {
    responders = [fail(500)];
    await expect(plan(STOCKHOLM, FIRENZE_SMN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(1);

    responders = [fail(429)];
    await expect(plan(STOCKHOLM, FIRENZE_SMN)).rejects.toThrow("EUROUTE_UPSTREAM_FAILED");
    expect(planCalls()).toHaveLength(2);
  });

  it("K. Hamburg Hbf's preserved DHID platform id is used as the endpoint", async () => {
    const hamburg: Place = {
      ...HAMBURG_COORDS,
      stopId: "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1",
    };
    responders = [ok([railItinerary()])];
    await plan(STOCKHOLM, hamburg);
    expect(planCalls()).toHaveLength(1);
    expect(endpoints()).toEqual({ from: STOCKHOLM.stopId, to: hamburg.stopId });
  });

  it("H. station-level ids are unchanged", () => {
    const station = [
      "se-Trafiklab_740000001",
      "it-trenitalia_IT::StopPlace:otherTRENITALIA:830008409",
      "ch-opentransportdataswiss26_Parentch:1:sloid:10",
      "at-Railway-Current-Reference-Data-2026_Pat:49:1349",
      "gb-great-britain_910GEUSTON",
      "gb-great-britain_910GSTPX",
      "fr-fr-sncf-ter_StopArea:OCE87271007",
      "fr-fr-sncf-ter_StopArea:OCE87686006",
      "at-Railway-Current-Reference-Data-2026_de:02000:10950",
    ];
    for (const id of station) {
      expect(stopIdLevel(id), id).toBe("station");
      expect(routingStopId({ name: "x", place: "1,1", stopId: id })).toBe(id);
      expect(planEndpoint({ name: "x", place: "1,1", stopId: id })).toBe(id);
    }
  });

  it("I. a coordinate-only Place still routes by coordinates", () => {
    expect(routingStopId(HAMBURG_COORDS)).toBeUndefined();
    expect(planEndpoint(HAMBURG_COORDS)).toBe(HAMBURG_COORDS.place);
  });
});


describe("O. legacy Places behave exactly as before", () => {
  it("coordinate-only search issues the same single request with coordinates", async () => {
    responders = [ok([railItinerary()])];
    const legacyFrom = { ...STOCKHOLM, stopId: undefined };
    const journeys = await plan(legacyFrom, HAMBURG_COORDS);
    expect(planCalls()).toHaveLength(1);
    expect(endpoints()).toEqual({ from: legacyFrom.place, to: HAMBURG_COORDS.place });
    expect(journeys).toHaveLength(1);
  });
});

describe("call budget", () => {
  it("a successful exact-endpoint search uses exactly one /plan call", async () => {
    responders = [ok([railItinerary()])];
    await plan(STOCKHOLM, WIEN);
    expect(planCalls()).toHaveLength(1);
    expect(clock).toBeGreaterThan(0);
  });
});
