/**
 * Phase F4E: minimal ABSOLUTE dead-time guard.
 *
 * Generic fixtures only – no station, city, country, operator or date is
 * special. The subject under test is: which candidates consist mostly of one
 * enormous block of waiting, and when the survivor guard permits removing them.
 */

import { describe, expect, it } from "vitest";

import {
  EXTREME_ABSOLUTE_LONGEST_WAIT_MINUTES,
  EXTREME_ABSOLUTE_TOTAL_WAIT_MINUTES,
  EXTREME_ABSOLUTE_WAIT_SHARE,
  isExtremeAbsoluteDeadTime,
  journeyDeadTimeMetrics,
  journeyFacts,
  preAnalyseJourneys,
} from "./journey-intelligence";
import { MIN_USABLE_JOURNEYS } from "./journey-limits";
import type { Journey, Leg } from "./journey";

const MIN_TRANSFER = 15;
const BASE = Date.UTC(2026, 8, 3, 6, 0);
const iso = (minutes: number) => new Date(BASE + minutes * 60_000).toISOString();

function leg(fromName: string, toName: string, from: number, to: number): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName,
    toName,
    departure: iso(from),
    arrival: iso(to),
    durationMinutes: to - from,
    realTime: false,
    trainName: `${fromName}-${toName}`,
  };
}

/**
 * A journey with explicit wait blocks. `segments` are onboard minutes,
 * `waits` the gaps between them. Station names are distinct per journey so
 * F2.5 dedupe never collapses fixtures.
 */
function journeyOf(id: string, segments: number[], waits: number[], startAt = 0): Journey {
  const legs: Leg[] = [];
  let clock = startAt;
  segments.forEach((ride, index) => {
    const from = index === 0 ? `${id}-origin` : `${id}-stop${index}`;
    const to = index === segments.length - 1 ? `${id}-dest` : `${id}-stop${index + 1}`;
    legs.push(leg(from, to, clock, clock + ride));
    clock += ride + (waits[index] ?? 0);
  });
  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  const elapsed = Math.round(
    (Date.parse(last.arrival) - Date.parse(first.departure)) / 60_000,
  );
  return {
    id,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: elapsed,
    transfers: legs.length - 1,
    legs,
    operators: [],
    hasNightLeg: false,
    chained: false,
  };
}

const metricsOf = (journey: Journey, best: number | null = null) =>
  journeyDeadTimeMetrics(journey, journeyFacts(journey, MIN_TRANSFER), best);

const usableIds = (journeys: Journey[]) =>
  preAnalyseJourneys(journeys, MIN_TRANSFER).usable.map((item) => item.journey.id);

/**
 * A clean padding journey. Deliberately long-elapsed (25h, 40 min of waiting)
 * so the existing RELATIVE F1.5 rules never fire against the extreme fixtures:
 * these tests must isolate the new absolute clause, not re-test F1.5.
 */
const clean = (id: string, startAt = 0) => journeyOf(id, [730, 730], [40], startAt);

/* ---------------------------------------------------------------- *
 * Identification predicate: the three absolute conditions
 * ---------------------------------------------------------------- */

describe("F4E identification predicate", () => {
  it("uses the approved absolute thresholds", () => {
    expect(EXTREME_ABSOLUTE_LONGEST_WAIT_MINUTES).toBe(600);
    expect(EXTREME_ABSOLUTE_TOTAL_WAIT_MINUTES).toBe(600);
    expect(EXTREME_ABSOLUTE_WAIT_SHARE).toBe(0.35);
  });

  /* Test 1: the demonstrated 11h31 / 54% tail candidate. */
  it("catches an 11h31 longest wait at 54% wait share", () => {
    // 11h31 + 11h19 waiting, 19h24 onboard → 42h14 elapsed, share 0.54.
    const m = metricsOf(journeyOf("hostile", [400, 400, 364], [691, 679]));
    expect(m.longestWaitMinutes).toBe(691);
    expect(m.totalWaitMinutes).toBe(1370);
    expect(m.waitShare).toBeCloseTo(0.54, 2);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(true);
  });

  /* Test 2: just below the 10h longest-wait line. */
  it("retains a 9h59 longest wait even at a high share", () => {
    const m = metricsOf(journeyOf("just-under", [200, 200], [599]));
    expect(m.longestWaitMinutes).toBe(599);
    expect(m.waitShare).toBeGreaterThan(0.35);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });

  /* Test 3: exactly on the wait-share boundary. */
  it("catches exactly 35% share with a >= 10h wait", () => {
    // 700 waiting inside 2000 elapsed = exactly 0.35.
    const m = metricsOf(journeyOf("boundary", [650, 650], [700]));
    expect(m.longestWaitMinutes).toBe(700);
    expect(m.totalWaitMinutes).toBe(700);
    expect(m.elapsedMinutes).toBe(2000);
    expect(m.waitShare).toBeCloseTo(0.35, 10);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(true);
  });

  /* Test 4: share just under 35% is retained. */
  it("retains a >= 10h wait at 34.9% share", () => {
    // 698 waiting inside 2000 elapsed = exactly 0.349.
    const m = metricsOf(journeyOf("low-share", [651, 651], [698]));
    expect(m.longestWaitMinutes).toBe(698);
    expect(m.totalWaitMinutes).toBe(698);
    expect(m.waitShare).toBeCloseTo(0.349, 10);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });

  /* Test 3b: the live 11h31 / 36.9% København evening tail now qualifies. */
  it("catches an 11h31-style wait at 36.9% share", () => {
    // 738 waiting inside 2000 elapsed = exactly 0.369.
    const m = metricsOf(journeyOf("kbh-evening", [631, 631], [738]));
    expect(m.longestWaitMinutes).toBe(738);
    expect(m.waitShare).toBeCloseTo(0.369, 10);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(true);
  });

  /* Test 5: metric consistency — total can never be below longest. */
  it("keeps totalWaitMinutes >= longestWaitMinutes for every fixture", () => {
    for (const j of [
      journeyOf("c1", [400, 400, 364], [691, 679]),
      journeyOf("c2", [450, 450], [600]),
      journeyOf("c3", [120, 120, 120], [240, 240]),
    ]) {
      const m = metricsOf(j);
      expect(m.totalWaitMinutes).toBeGreaterThanOrEqual(m.longestWaitMinutes);
    }
    // Therefore a 10h longest wait always satisfies the 10h total condition.
    const m = metricsOf(journeyOf("c4", [450, 450], [600]));
    expect(m.longestWaitMinutes).toBe(600);
    expect(m.totalWaitMinutes).toBeGreaterThanOrEqual(600);
  });

  /* Test 14: no time-of-day semantics. */
  it("gives the same result for an identical daytime and overnight wait", () => {
    // Same shape, one starting mid-morning and one starting in the evening.
    const day = journeyOf("day", [400, 400], [660], 180);
    const night = journeyOf("night", [400, 400], [660], 840);
    const dayMetrics = metricsOf(day);
    const nightMetrics = metricsOf(night);
    expect(dayMetrics.longestWaitIsOvernight).not.toBe(nightMetrics.longestWaitIsOvernight);
    expect(isExtremeAbsoluteDeadTime(dayMetrics)).toBe(
      isExtremeAbsoluteDeadTime(nightMetrics),
    );
    expect(isExtremeAbsoluteDeadTime(dayMetrics)).toBe(true);
  });

  /* Test 15: two moderate waits are not one extreme block. */
  it("does not catch two 4h waits", () => {
    const m = metricsOf(journeyOf("two-fours", [120, 120, 120], [240, 240]));
    expect(m.totalWaitMinutes).toBe(480);
    expect(m.longestWaitMinutes).toBe(240);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });

  /* Test 16: a 6h wait in a 10h itinerary. */
  it("does not catch a 6h wait inside a 10h itinerary", () => {
    const m = metricsOf(journeyOf("six-in-ten", [30, 30], [360]));
    expect(m.longestWaitMinutes).toBe(360);
    expect(m.waitShare).toBeGreaterThan(0.4);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });

  /* Test 11: an 8h overnight sparse fallback. */
  it("does not catch an 8h overnight sparse-corridor wait", () => {
    const m = metricsOf(journeyOf("sparse", [300, 300], [480], 780));
    expect(m.longestWaitMinutes).toBe(480);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });

  /* Test 12: the observed København-style arrival-justified candidate. */
  it("does not catch a 9h05 København-style arrival-justified journey", () => {
    // 9h05 wait, 21h05 onboard → 30h10 elapsed, share 0.30.
        const m = metricsOf(journeyOf("kbh-style", [400, 500, 365], [545, 0]));
    expect(m.longestWaitMinutes).toBe(545);
    expect(m.longestWaitMinutes).toBeLessThan(EXTREME_ABSOLUTE_LONGEST_WAIT_MINUTES);
    expect(isExtremeAbsoluteDeadTime(m)).toBe(false);
  });
});

/* ---------------------------------------------------------------- *
 * Survivor guard
 * ---------------------------------------------------------------- */

describe("F4E survivor guard", () => {
  const hostile = (id: string, startAt = 0) => journeyOf(id, [400, 400, 364], [691, 679], startAt);

  /* Test 1 (pool level) + test 13. */
  it("removes the extreme candidate when 3 baseline-usable journeys exist", () => {
    const pool = [hostile("tail"), clean("a"), clean("b", 60)];
    expect(usableIds(pool)).toEqual(["a", "b"]);
  });

  /* Test 3 (pool level): the 0.369-share tail is removed when the guard permits. */
  it("removes a 36.9%-share extreme candidate when 3 baseline-usable journeys exist", () => {
    const tail = journeyOf("tail", [631, 631], [738]);
    const pool = [tail, clean("a"), clean("b", 60)];
    expect(usableIds(pool)).toEqual(["a", "b"]);
  });

  /* Test 6: the only usable journey is always retained. */
  it("retains an 11h-wait candidate that is the only usable journey", () => {
    expect(usableIds([hostile("only")])).toEqual(["only"]);
  });

  /* Test 7: exactly MIN_USABLE_JOURNEYS baseline usable. */
  it("retains the extreme candidate when only 2 baseline-usable journeys exist", () => {
    expect(MIN_USABLE_JOURNEYS).toBe(2);
    const pool = [hostile("tail"), clean("a")];
    expect(new Set(usableIds(pool))).toEqual(new Set(["tail", "a"]));
  });

  /* Test 8: 3 baseline usable → at most one removal. */
  it("removes at most one journey when that leaves exactly 2", () => {
    const pool = [hostile("tail1"), hostile("tail2", 30), clean("a")];
    const ids = usableIds(pool);
    expect(ids.length).toBe(2);
    expect(ids).toContain("a");
  });

  /* Test 9: deterministic worst-first, never below the floor. */
  it("removes worst dead-time burden first and never drops below 2 usable", () => {
    // worst share first: heavier waits inside a shorter itinerary rank worse.
    const worst = journeyOf("worst", [200, 200, 200], [700, 700]);
    const middle = journeyOf("middle", [300, 300, 300], [700, 700]);
    const mild = journeyOf("mild", [400, 400, 400], [650, 650]);
    const ids = usableIds([mild, worst, middle, clean("a")]);
    expect(ids.length).toBe(2);
    // "a" survives (never qualifying); of the three extremes the mildest stays.
    expect(new Set(ids)).toEqual(new Set(["a", "mild"]));
  });

  /* Test 10: order independence. */
  it("retains identical journey ids for every input order", () => {
    const pool = [
      journeyOf("worst", [200, 200, 200], [700, 700]),
      journeyOf("middle", [300, 300, 300], [700, 700]),
      journeyOf("mild", [400, 400, 400], [650, 650]),
      clean("a"),
      clean("b", 45),
    ];
    const expected = new Set(usableIds(pool));
    const orders = [
      [...pool].reverse(),
      [pool[3]!, pool[0]!, pool[4]!, pool[2]!, pool[1]!],
      [pool[2]!, pool[4]!, pool[1]!, pool[3]!, pool[0]!],
      [pool[1]!, pool[2]!, pool[0]!, pool[4]!, pool[3]!],
    ];
    for (const order of orders) {
      expect(new Set(usableIds(order))).toEqual(expected);
    }
  });

  /* Test 20: a lone sparse safety-valve journey cannot be eliminated. */
  it("never eliminates the pool when only 1-2 usable journeys exist", () => {
    for (const pool of [[hostile("x")], [hostile("x"), hostile("y", 20)]]) {
      const result = preAnalyseJourneys(pool, MIN_TRANSFER);
      expect(result.usable.length).toBe(pool.length);
    }
  });

  it("leaves a pool without qualifying candidates completely untouched", () => {
    const pool = [clean("a"), clean("b", 30), clean("c", 60), journeyOf("d", [120, 120, 120], [240, 240])];
    expect(usableIds(pool)).toEqual(["a", "b", "c", "d"]);
  });
});
