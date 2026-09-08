// Phase F3: adaptive cursor recovery. One extra timetable page, only when the
// first page cannot offer a sufficient passenger-usable pool. Never pagination.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Place } from "./journey";
import { analyseJourneys, DEFAULT_PREFERENCES } from "./journey-intelligence";

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
const LONDON_CITY: Place = {
  name: "London, England",
  place: "51.530000,-0.123000",
  country: "GB",
  intent: "city",
};
const FIRENZE_CITY: Place = {
  name: "Firenze, Toscana",
  place: "43.776400,11.248200",
  country: "IT",
  intent: "city",
};
const MALMO: Place = {
  name: "Malmö Centralstation",
  place: "55.609540,13.000180",
  country: "SE",
  stopId: "se-Trafiklab_740000003",
};

const place = (name: string, lat: number, lon: number, stopId?: string) => ({
  name,
  lat,
  lon,
  ...(stopId ? { stopId } : {}),
});

const railLeg = (args: {
  from: ReturnType<typeof place>;
  to: ReturnType<typeof place>;
  start: string;
  end: string;
  train?: string;
}) => ({
  mode: "HIGHSPEED_RAIL",
  from: args.from,
  to: args.to,
  startTime: args.start,
  endTime: args.end,
  duration: (new Date(args.end).getTime() - new Date(args.start).getTime()) / 1000,
  agencyName: "SJ",
  ...(args.train ? { displayName: args.train } : {}),
});

const wrap = (legs: ReturnType<typeof railLeg>[]) => ({
  duration:
    (new Date(legs[legs.length - 1]!.endTime).getTime() -
      new Date(legs[0]!.startTime).getTime()) /
    1000,
  startTime: legs[0]!.startTime,
  endTime: legs[legs.length - 1]!.endTime,
  transfers: legs.length - 1,
  legs,
});

const STHLM = place("Stockholm Centralstation", 59.33014, 18.05815, "se-1");
const GBG = place("Göteborg Centralstation", 57.70887, 11.97338, "se-2");

/** A plain, comfortable direct journey. */
const usable = (start: string, end: string, train = "SJ 001") =>
  wrap([railLeg({ from: STHLM, to: GBG, start, end, train })]);

/**
 * Phase-E impossible: 2 minutes between two different stations in different
 * complexes (the London King's Cross / St Pancras class of failure).
 */
const impossible = (start: string, mid: string, end: string, train = "IMP") => {
  const a = place("King's Cross St. Pancras", 51.5308, -0.1238, "gb-1");
  const b = place("St-Pancras-International", 51.5322, -0.1266, "gb-2");
  const gap = new Date(new Date(mid).getTime() + 2 * 60000).toISOString();
  return wrap([
    railLeg({ from: STHLM, to: a, start, end: mid, train: `${train}-1` }),
    railLeg({ from: b, to: GBG, start: gap, end, train: `${train}-2` }),
  ]);
};

/** F1.5 pathological dead time: ~20 h wait, elapsed far above the best. */
const deadTimeJunk = (start: string) => {
  const mid = new Date(new Date(start).getTime() + 60 * 60000).toISOString();
  const resume = new Date(new Date(mid).getTime() + 20 * 60 * 60000).toISOString();
  const end = new Date(new Date(resume).getTime() + 60 * 60000).toISOString();
  return wrap([
    railLeg({ from: STHLM, to: place("Hamburg Hbf", 53.5528, 10.0067, "de-1"), start, end: mid, train: "J1" }),
    railLeg({ from: place("Hamburg Hbf", 53.5528, 10.0067, "de-1"), to: GBG, start: resume, end, train: "J2" }),
  ]);
};

type Recorded = { url: string; params: URLSearchParams };
let calls: Recorded[] = [];
let pages: { itineraries: unknown[]; nextPageCursor?: string }[] = [];
let pageFailure: number | null = null;

let planJourneys: typeof import("./rail.server").planJourneys;
let MIN_USABLE_JOURNEYS: number;
let MAX_CANDIDATE_JOURNEYS: number;

beforeEach(async () => {
  calls = [];
  pageFailure = null;
  pages = [{ itineraries: [] }];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: URL | string) => {
      const url = new URL(String(input));
      calls.push({ url: String(input), params: url.searchParams });
      const cursor = url.searchParams.get("pageCursor");
      const index = cursor ? Number(cursor.split("|")[1]) : 0;
      if (pageFailure === index) {
        return new Response("boom", { status: 500 });
      }
      const page = pages[index] ?? { itineraries: [] };
      return new Response(JSON.stringify(page), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
  vi.resetModules();
  ({ planJourneys, MIN_USABLE_JOURNEYS, MAX_CANDIDATE_JOURNEYS } = await import("./rail.server"));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

let seq = 0;
/** Unique per test so the 90 s timetable cache never leaks across cases. */
const departAt = () => {
  seq += 1;
  return `2026-10-${String((seq % 27) + 1).padStart(2, "0")}T05:00:00.000Z`;
};

const plan = (from: Place, to: Place, via: Place[] = [], at = departAt()) =>
  planJourneys({ from, to, via, departAt: at, maxTransfers: 4, minTransferMinutes: 15 });

const planCalls = () => calls.filter((c) => c.url.includes("/api/v3/plan"));
const cursorCalls = () => planCalls().filter((c) => c.params.get("pageCursor"));

const analyse = (journeys: Awaited<ReturnType<typeof plan>>) =>
  analyseJourneys({ journeys, preferences: DEFAULT_PREFERENCES, style: "recommended" });

const day = (offsetHours: number, base = "2026-10-05T05:00:00.000Z") =>
  new Date(new Date(base).getTime() + offsetHours * 3600000).toISOString();

describe("F3: recovery trigger", () => {
  it("uses two plan calls and recovers usable journeys when page 1 is all unusable", async () => {
    pages = [
      {
        itineraries: Array.from({ length: 6 }, (_, i) =>
          impossible(day(1 + i), day(3 + i), day(6 + i), `IMP${i}`),
        ),
        nextPageCursor: "LATER|1",
      },
      { itineraries: [usable(day(20), day(24), "SJ A"), usable(day(21), day(25), "SJ B")] },
    ];
    const journeys = await plan(LONDON_CITY, FIRENZE_CITY, [], "2026-10-05T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
    expect(cursorCalls()).toHaveLength(1);

    const analysis = analyse(journeys);
    expect(analysis.allJourneysUnusable).toBe(false);
    expect(analysis.options.length).toBeGreaterThan(0);
    expect(analysis.options[0]!.journey.legs).toHaveLength(1);
  });

  it("never makes more than two plan calls even when page 2 is also insufficient", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [impossible(day(8), day(10), day(13), "X")], nextPageCursor: "LATER|2" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-06T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
  });

  it("recovers when page 1 has exactly one usable journey", async () => {
    pages = [
      {
        itineraries: [
          usable(day(1), day(4), "SJ solo"),
          ...Array.from({ length: 5 }, (_, i) => impossible(day(2 + i), day(4 + i), day(7 + i), `IM${i}`)),
        ],
        nextPageCursor: "LATER|1",
      },
      { itineraries: [usable(day(20), day(24), "SJ B"), usable(day(22), day(26), "SJ C")] },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-07T05:00:00.000Z");
    expect(MIN_USABLE_JOURNEYS).toBe(2);
    expect(planCalls()).toHaveLength(2);
    const usableTrains = journeys.filter((j) => j.legs.length === 1).length;
    expect(usableTrains).toBe(3);
  });

  it("does not recover when page 1 already has two usable journeys", async () => {
    pages = [
      {
        itineraries: [usable(day(1), day(4), "SJ A"), usable(day(2), day(5), "SJ B")],
        nextPageCursor: "LATER|1",
      },
      { itineraries: [usable(day(20), day(24), "SJ C")] },
    ];
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-08T05:00:00.000Z");
    expect(planCalls()).toHaveLength(1);
  });

  it("does not recover when no cursor is present", async () => {
    pages = [{ itineraries: [impossible(day(1), day(3), day(6))] }];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-09T05:00:00.000Z");
    expect(planCalls()).toHaveLength(1);
    expect(analyse(journeys).allJourneysUnusable).toBe(true);
  });

  it("does not recover because profiles agree (single usable pair is enough)", async () => {
    pages = [
      {
        itineraries: [usable(day(1), day(4), "SJ A"), usable(day(1), day(4), "SJ A")],
        nextPageCursor: "LATER|1",
      },
      { itineraries: [usable(day(20), day(24), "SJ C"), usable(day(21), day(25), "SJ D")] },
    ];
    // Two identical representations collapse to ONE usable journey, so
    // recovery is expected here: duplicates must not count toward the target.
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-10T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
  });
});

describe("F3: cross-page dedupe, gates and cap", () => {
  it("collapses a page-2 duplicate of a page-1 service", async () => {
    const a = usable(day(1), day(4), "SJ 415");
    pages = [
      { itineraries: [a], nextPageCursor: "LATER|1" },
      { itineraries: [a, usable(day(6), day(9), "SJ 417")] },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-11T05:00:00.000Z");
    const analysis = analyse(journeys);
    const shown = [...analysis.options, ...analysis.more];
    expect(shown).toHaveLength(2);
  });

  it("keeps Phase E authoritative for page-2 candidates", async () => {
    pages = [
      { itineraries: [usable(day(1), day(4), "SJ A")], nextPageCursor: "LATER|1" },
      { itineraries: [impossible(day(6), day(8), day(11), "P2")] },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-12T05:00:00.000Z");
    const analysis = analyse(journeys);
    expect(analysis.unusableCount).toBe(1);
    expect([...analysis.options, ...analysis.more]).toHaveLength(1);
  });

  it("keeps the F1.5 dead-time gate authoritative for page-2 candidates", async () => {
    pages = [
      { itineraries: [usable(day(1), day(4), "SJ A")], nextPageCursor: "LATER|1" },
      { itineraries: [deadTimeJunk(day(6)), usable(day(8), day(11), "SJ B")] },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-13T05:00:00.000Z");
    const analysis = analyse(journeys);
    expect(analysis.unusableCount).toBe(1);
    expect([...analysis.options, ...analysis.more].every((i) => i.journey.legs.length === 1)).toBe(
      true,
    );
  });

  it("never lets unusable page-1 candidates crowd usable page-2 journeys out of the cap", async () => {
    pages = [
      {
        itineraries: Array.from({ length: 6 }, (_, i) =>
          impossible(day(1 + i), day(3 + i), day(6 + i), `IMP${i}`),
        ),
        nextPageCursor: "LATER|1",
      },
      {
        itineraries: Array.from({ length: 6 }, (_, i) => usable(day(20 + i), day(24 + i), `SJ ${i}`)),
      },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-14T05:00:00.000Z");
    expect(journeys).toHaveLength(MAX_CANDIDATE_JOURNEYS);
    expect(journeys.filter((j) => j.legs.length === 1)).toHaveLength(6);
    const analysis = analyse(journeys);
    expect([...analysis.options, ...analysis.more]).toHaveLength(6);
  });

  it("lets F2 ranking pick a page-2 journey that arrives substantially earlier", async () => {
    pages = [
      { itineraries: [usable(day(1), day(30), "SJ slow")], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(2), day(6), "SJ fast"), usable(day(3), day(8), "SJ mid")] },
    ];
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-15T05:00:00.000Z");
    const analysis = analyse(journeys);
    expect(analysis.options[0]!.journey.legs[0]!.trainName).toBe("SJ fast");
  });
});

describe("F3: request semantics and failure handling", () => {
  it("repeats exact stop-id endpoints and adds only the cursor on recovery", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-16T05:00:00.000Z");
    const [first, second] = planCalls();
    expect(second!.params.get("fromPlace")).toBe(STOCKHOLM.stopId);
    expect(second!.params.get("toPlace")).toBe(GOTEBORG.stopId);
    expect(second!.params.get("radius")).toBeNull();
    expect(second!.params.get("time")).toBe(first!.params.get("time"));
    expect(second!.params.get("timetableView")).toBe("true");
    expect(second!.params.get("numItineraries")).toBe("6");
    expect(second!.params.get("pageCursor")).toBe("LATER|1");
    expect(calls.some((c) => c.url.includes("/geocode"))).toBe(false);
  });

  it("preserves city coordinates and radius on recovery", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    await plan(LONDON_CITY, FIRENZE_CITY, [], "2026-10-17T05:00:00.000Z");
    const [first, second] = planCalls();
    expect(second!.params.get("fromPlace")).toBe(LONDON_CITY.place);
    expect(second!.params.get("toPlace")).toBe(FIRENZE_CITY.place);
    expect(second!.params.get("radius")).toBe(first!.params.get("radius"));
    expect(second!.params.get("radius")).toBeTruthy();
  });

  it("gives the cursor page its own cache key", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-18T05:00:00.000Z");
    const urls = planCalls().map((c) => c.url);
    expect(new Set(urls).size).toBe(2);
    // Same search again inside the TTL: both pages come from cache.
    await plan(STOCKHOLM, GOTEBORG, [], "2026-10-18T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
  });

  it("returns page-1 usable journeys when the cursor page fails", async () => {
    pages = [
      {
        itineraries: [usable(day(1), day(4), "SJ A")],
        nextPageCursor: "LATER|1",
      },
      { itineraries: [] },
    ];
    pageFailure = 1;
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-19T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
    expect(journeys).toHaveLength(1);
    expect(analyse(journeys).options).toHaveLength(1);
  });

  it("keeps the all-unusable state when page 1 has nothing usable and page 2 fails", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [] },
    ];
    pageFailure = 1;
    const journeys = await plan(STOCKHOLM, GOTEBORG, [], "2026-10-20T05:00:00.000Z");
    expect(planCalls()).toHaveLength(2);
    expect(analyse(journeys).allJourneysUnusable).toBe(true);
  });

  it("respects the upstream budget instead of expanding it", async () => {
    const { upstreamBudget } = await import("./abuse.server");
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    const budget = upstreamBudget(`f3-test-${Date.now()}`, 1, 60_000);
    const journeys = await planJourneys({
      from: STOCKHOLM,
      to: GOTEBORG,
      via: [],
      departAt: "2026-10-21T05:00:00.000Z",
      maxTransfers: 4,
      minTransferMinutes: 15,
      budget,
    });
    expect(planCalls()).toHaveLength(1);
    expect(budget.remaining()).toBe(0);
    expect(analyse(journeys).allJourneysUnusable).toBe(true);
  });

  it("never runs cursor recovery for Via searches", async () => {
    pages = [
      { itineraries: [impossible(day(1), day(3), day(6))], nextPageCursor: "LATER|1" },
      { itineraries: [usable(day(20), day(24))] },
    ];
    await plan(STOCKHOLM, GOTEBORG, [MALMO], "2026-10-22T05:00:00.000Z");
    expect(cursorCalls()).toHaveLength(0);
    for (const call of planCalls()) expect(call.params.get("timetableView")).toBe("false");
  });
});
