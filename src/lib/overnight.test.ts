import { describe, expect, it } from "vitest";

import { journeyFacts, type JourneyPreferences } from "./journey-intelligence";
import type { Leg } from "./journey";
import {
  buildOvernightPlan,
  isOvernightStationWait,
  journeyFromLegs,
  nightCoverageMinutes,
  overnightConfidence,
  overnightStationWaits,
  restWindowQuality,
} from "./overnight";
import {
  displayOvernightBenefits,
  displayOvernightWarnings,
  stationNightIntro,
  stationNightReason,
} from "./overnight-copy";

/**
 * All times below are written as local Europe/Stockholm wall-clock times with
 * an explicit +02:00 offset (September, CEST), so the tests describe exactly
 * the traveller-visible pattern.
 */
const t = (day: number, hhmm: string) =>
  `2026-09-${String(day).padStart(2, "0")}T${hhmm}:00+02:00`;

const leg = (args: {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  mode?: string;
  operator?: string;
}): Leg => ({
  kind: "train",
  mode: args.mode ?? "HIGHSPEED_RAIL",
  modeLabel: "Tåg",
  fromName: args.from,
  toName: args.to,
  fromPlace: "0,0",
  toPlace: "1,1",
  departure: args.departure,
  arrival: args.arrival,
  durationMinutes: Math.round(
    (new Date(args.arrival).getTime() - new Date(args.departure).getTime()) / 60000,
  ),
  operator: args.operator ?? "OP",
  realTime: false,
});

const prefs: JourneyPreferences = {
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

describe("overnight station wait detection", () => {
  it("A: 21:57 -> 06:45 next day (8 h 48 min) is an overnight station wait", () => {
    expect(isOvernightStationWait({ arrival: t(8, "21:57"), departure: t(9, "06:45") })).toBe(true);
    expect(nightCoverageMinutes(t(8, "21:57"), t(9, "06:45"))).toBe(420);
  });

  it("B: 22:30 -> 23:15 same day (45 min) is an ordinary late-evening transfer", () => {
    expect(isOvernightStationWait({ arrival: t(8, "22:30"), departure: t(8, "23:15") })).toBe(false);
  });

  it("C: 14:00 -> 22:00 same day is a long daytime wait, not a station night", () => {
    expect(isOvernightStationWait({ arrival: t(8, "14:00"), departure: t(8, "22:00") })).toBe(false);
    expect(nightCoverageMinutes(t(8, "14:00"), t(8, "22:00"))).toBe(0);
  });

  it("finds the station night on a real itinerary", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "07:00"), arrival: t(8, "21:57") }),
        leg({ from: "Hamburg Hbf", to: "Firenze SMN", departure: t(9, "06:45"), arrival: t(9, "20:30") }),
      ],
      "base",
    );
    const waits = overnightStationWaits(base);
    expect(waits).toHaveLength(1);
    expect(waits[0]!.station).toBe("Hamburg Hbf");
    expect(waits[0]!.waitMinutes).toBe(528);
  });
});

describe("rest window quality", () => {
  it("G: 21:57 -> 06:45 is a meaningful overnight window despite being under 9 h", () => {
    const quality = restWindowQuality({
      arrivalHour: 21,
      departureHour: 6,
      waitMinutes: 528,
      nightMinutes: nightCoverageMinutes(t(8, "21:57"), t(9, "06:45")),
    });
    expect(quality).toBe("veryGood");
  });

  it("does not upgrade a daytime wait of the same length", () => {
    expect(restWindowQuality({ arrivalHour: 14, departureHour: 22, waitMinutes: 480 })).toBe(
      "short",
    );
  });
});

/* ---------------------------------------------------------------- *
 * Plan-level behaviour
 * ---------------------------------------------------------------- */

const baseWithStationNight = journeyFromLegs(
  [
    leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "07:00"), arrival: t(8, "21:57") }),
    leg({ from: "Hamburg Hbf", to: "Firenze SMN", departure: t(9, "06:45"), arrival: t(9, "20:30") }),
  ],
  "base",
);
const baseFacts = journeyFacts(baseWithStationNight, prefs.minTransferMinutes);

const day1Natural = journeyFromLegs(
  [leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "07:00"), arrival: t(8, "21:57") })],
  "d1",
);
const day2Natural = journeyFromLegs(
  [leg({ from: "Hamburg Hbf", to: "Firenze SMN", departure: t(9, "06:45"), arrival: t(9, "20:30") })],
  "d2",
);

const naturalPlan = () =>
  buildOvernightPlan({
    days: [day1Natural, day2Natural],
    stays: [
      {
        station: "Hamburg Hbf",
        place: "1,1",
        arrival: day1Natural.arrival,
        departure: day2Natural.departure,
      },
    ],
    base: baseWithStationNight,
    baseFacts,
    preferences: prefs,
  });

describe("convertsStationNightToStay", () => {
  it("D: a stay at the station-night city converts it into a hotel night", () => {
    const plan = naturalPlan();
    expect(plan.convertsStationNightToStay).toBe(true);
    expect(plan.retainedStationNights).toBe(0);
    expect(plan.benefits.some((b) => b.key === "on.benefit.stationNightToStay")).toBe(true);
  });

  it("lets the plan pass the improvements === 0 rejection gate", () => {
    const { confidence } = overnightConfidence({
      plan: naturalPlan(),
      base: baseWithStationNight,
      baseFacts,
      preferences: prefs,
      style: "recommended",
    });
    expect(confidence).not.toBe("weak");
  });

  it("is false, and penalised, when the plan travels through the station night", () => {
    // Day 1 continues through the Hamburg night to reach a further city.
    const day1Extreme = journeyFromLegs(
      [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "07:00"), arrival: t(8, "21:57") }),
        leg({ from: "Hamburg Hbf", to: "Zürich HB", departure: t(9, "06:45"), arrival: t(9, "15:00") }),
      ],
      "z1",
    );
    const day2Short = journeyFromLegs(
      [leg({ from: "Zürich HB", to: "Firenze SMN", departure: t(10, "08:00"), arrival: t(10, "13:00") })],
      "z2",
    );
    const zurich = buildOvernightPlan({
      days: [day1Extreme, day2Short],
      stays: [
        {
          station: "Zürich HB",
          place: "2,2",
          arrival: day1Extreme.arrival,
          departure: day2Short.departure,
        },
      ],
      base: baseWithStationNight,
      baseFacts,
      preferences: prefs,
    });

    expect(zurich.convertsStationNightToStay).toBe(false);
    expect(zurich.retainedStationNights).toBe(1);
    expect(zurich.warnings.some((w) => w.key === "on.warn.stationNight")).toBe(true);

    // E: the longer theoretical rest window must not outrank the natural stop.
    expect(zurich.restQuality).toBe("veryGood");
    expect(zurich.score).toBeLessThan(naturalPlan().score);
    expect(zurich.dayStats[0]!.burden).toBe("extreme");
  });
});

describe("Smart Overnight display copy helpers", () => {
  it("uses station-night-specific insight and simplified benefits only for converting plans", () => {
    const plan = naturalPlan();

    expect(stationNightIntro(plan)).toEqual({
      key: "on.stationNightIntro",
      vars: { city: "Hamburg", time: "8 h 48 min" },
    });
    expect(displayOvernightBenefits(plan).map((benefit) => benefit.key)).toEqual([
      "on.benefit.noNightTravel",
      "on.benefit.stationNightToStay",
      "on.benefit.rest.veryGood",
    ]);
  });

  it("keeps generic fallback copy for non-station-night recommendations", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "Stockholm C", to: "Berlin Hbf", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
        leg({ from: "Berlin Hbf", to: "Firenze SMN", departure: t(8, "18:30"), arrival: t(9, "08:30") }),
      ],
      "generic-base",
    );
    const day1 = journeyFromLegs(
      [leg({ from: "Stockholm C", to: "Berlin Hbf", departure: t(8, "08:00"), arrival: t(8, "18:00") })],
      "generic-d1",
    );
    const day2 = journeyFromLegs(
      [leg({ from: "Berlin Hbf", to: "Firenze SMN", departure: t(9, "08:00"), arrival: t(9, "18:00") })],
      "generic-d2",
    );
    const plan = buildOvernightPlan({
      days: [day1, day2],
      stays: [
        {
          station: "Berlin Hbf",
          place: "1,1",
          arrival: day1.arrival,
          departure: day2.departure,
        },
      ],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
      comparedCities: 2,
    });

    expect(plan.convertsStationNightToStay).toBe(false);
    expect(stationNightIntro(plan)).toBeNull();
    expect(stationNightReason(plan)).toBeNull();
    expect(displayOvernightBenefits(plan).map((benefit) => benefit.key)).not.toContain(
      "on.benefit.realNightRest",
    );
  });

  it("uses singular Swedish-compatible station-change warning keys", () => {
    const plan = { ...naturalPlan(), warnings: [{ key: "on.warn.stationChange", vars: { n: 1 } }] };

    expect(displayOvernightWarnings(plan).map((warning) => warning.key)).toEqual([
      "on.warn.stationChange1",
    ]);
  });
});

describe("muchShorterDays unit consistency", () => {
  it("F: compares onboard minutes on both sides", () => {
    const plan = naturalPlan();
    // Base onboard minutes for the busiest calendar day.
    expect(baseFacts.longestTravelDayMinutes).toBe(
      Math.max(
        baseWithStationNight.legs[0]!.durationMinutes,
        baseWithStationNight.legs[1]!.durationMinutes,
      ),
    );
    // The plan's comparable figure is onboard minutes, not the day window.
    expect(plan.longestDayTrainMinutes).toBe(
      Math.max(day1Natural.durationMinutes, day2Natural.durationMinutes),
    );
    // Same units => the "much shorter days" claim is not falsely triggered by
    // a split that keeps identical onboard time.
    const { confidence } = overnightConfidence({
      plan,
      base: baseWithStationNight,
      baseFacts,
      preferences: prefs,
      style: "recommended",
    });
    expect(["strong", "alternative"]).toContain(confidence);
    expect(plan.longestDayTrainMinutes).toBeGreaterThan(baseFacts.longestTravelDayMinutes - 180);
  });
});

/* ------------------------------------------------------------------ *
 * Phase 1: honest elapsed cost of inserting an overnight
 * ------------------------------------------------------------------ */

describe("honest elapsed cost", () => {
  /** Continuous journey: one change, arrives the same evening. */
  const sameDayBase = () =>
    journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:28"), arrival: t(8, "13:11") }),
        leg({ from: "M", to: "B", departure: t(8, "13:41"), arrival: t(8, "20:59") }),
      ],
      "same-day-base",
    );

  /** Split at M with a 20 h stop: the shape observed live on Wien -> Roma. */
  const hugeCostPlan = (base = sameDayBase()) =>
    buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:28"), arrival: t(8, "13:11") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "09:24"), arrival: t(9, "17:10") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "13:11"), departure: t(9, "09:24") }],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });

  it("A: measures the real elapsed cost of a 20 h stop that costs no travel time", () => {
    const base = sameDayBase();
    const plan = hugeCostPlan(base);

    expect(base.durationMinutes).toBe(751);
    expect(plan.elapsedMinutes).toBe(1962);
    expect(plan.addedElapsedMinutes).toBe(1211);
    // The travel-burden measure genuinely sees no extra travel time.
    expect(plan.addedTravelMinutes).toBe(0);
    expect(plan.arrivalDayDelta).toBe(1);
    expect(plan.arrivesLaterDay).toBe(true);

    // The warning states ~20 h, never 0.
    const warning = plan.warnings.find((w) => w.key === "on.warn.addedElapsed");
    expect(warning?.vars?.["time"]).toBe("20 h 11 min");

    // Days look good on paper, so the score-based path must not sell it.
    const { confidence } = overnightConfidence({
      plan,
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
      style: "recommended",
    });
    expect(confidence).toBe("weak");
  });

  it("B: a modest elapsed cost with genuine benefits is not rejected", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "19:30") }),
        leg({ from: "M", to: "B", departure: t(8, "20:00"), arrival: t(9, "03:30") }),
      ],
      "night-base",
    );
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "19:30") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "07:00"), arrival: t(9, "14:30") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "19:30"), departure: t(9, "07:00") }],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });

    expect(plan.addedElapsedMinutes).toBe(660);
    const { confidence } = overnightConfidence({
      plan,
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
      style: "recommended",
    });
    // Removes the night-time arrival: still worth offering.
    expect(confidence).not.toBe("weak");
  });

  it("C: a base that crosses the night keeps its overnight option", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
        leg({ from: "M", to: "B", departure: t(8, "23:30"), arrival: t(9, "08:00") }),
      ],
      "crosses-night",
    );
    const baseFacts = journeyFacts(base, prefs.minTransferMinutes);
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "08:00"), arrival: t(9, "16:30") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "18:00"), departure: t(9, "08:00") }],
      base,
      baseFacts,
      preferences: prefs,
    });
    const { confidence } = overnightConfidence({
      plan,
      base,
      baseFacts,
      preferences: prefs,
      style: "recommended",
    });
    expect(plan.addedElapsedMinutes).toBeGreaterThan(0);
    expect(confidence).not.toBe("weak");
  });

  it("D: station-night relief survives the elapsed-cost correction", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "21:57") }),
        leg({ from: "M", to: "B", departure: t(9, "06:45"), arrival: t(9, "12:00") }),
      ],
      "station-night",
    );
    const baseFacts = journeyFacts(base, prefs.minTransferMinutes);
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "21:57") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "09:00"), arrival: t(9, "14:15") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "21:57"), departure: t(9, "09:00") }],
      base,
      baseFacts,
      preferences: prefs,
    });
    expect(plan.convertsStationNightToStay).toBe(true);
    const { confidence } = overnightConfidence({
      plan,
      base,
      baseFacts,
      preferences: prefs,
      style: "recommended",
    });
    expect(confidence).not.toBe("weak");
  });

  it("E: a near-zero delta produces no elapsed warning", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
        leg({ from: "M", to: "B", departure: t(9, "08:00"), arrival: t(9, "16:00") }),
      ],
      "already-two-days",
    );
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "08:00"), arrival: t(9, "16:00") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "18:00"), departure: t(9, "08:00") }],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });
    expect(plan.addedElapsedMinutes).toBe(0);
    expect(plan.arrivesLaterDay).toBe(false);
    expect(plan.warnings.some((w) => w.key === "on.warn.addedElapsed")).toBe(false);
  });

  it("F: a negative delta stays valid and warning-free", () => {
    const base = journeyFromLegs(
      [
        leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
        leg({ from: "M", to: "B", departure: t(9, "10:00"), arrival: t(9, "18:00") }),
      ],
      "slow-base",
    );
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs(
          [leg({ from: "A", to: "M", departure: t(8, "08:00"), arrival: t(8, "18:00") })],
          "d1",
        ),
        journeyFromLegs(
          [leg({ from: "M", to: "B", departure: t(9, "07:00"), arrival: t(9, "15:00") })],
          "d2",
        ),
      ],
      stays: [{ station: "M", place: "1,1", arrival: t(8, "18:00"), departure: t(9, "07:00") }],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });
    expect(plan.addedElapsedMinutes).toBe(-180);
    expect(plan.arrivalDayDelta).toBe(0);
    expect(plan.warnings.some((w) => w.key === "on.warn.addedElapsed")).toBe(false);
  });

  it("G: arithmetic is correct across calendar boundaries (month end)", () => {
    const baseLegs = [
      leg({
        from: "A",
        to: "M",
        departure: "2026-10-31T08:00:00+01:00",
        arrival: "2026-10-31T20:00:00+01:00",
      }),
      leg({
        from: "M",
        to: "B",
        departure: "2026-10-31T20:30:00+01:00",
        arrival: "2026-11-01T02:30:00+01:00",
      }),
    ];
    const base = journeyFromLegs(baseLegs, "month-end");
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs([baseLegs[0]!], "d1"),
        journeyFromLegs(
          [
            leg({
              from: "M",
              to: "B",
              departure: "2026-11-01T08:00:00+01:00",
              arrival: "2026-11-01T14:00:00+01:00",
            }),
          ],
          "d2",
        ),
      ],
      stays: [
        {
          station: "M",
          place: "1,1",
          arrival: "2026-10-31T20:00:00+01:00",
          departure: "2026-11-01T08:00:00+01:00",
        },
      ],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });
    expect(base.durationMinutes).toBe(1110);
    expect(plan.elapsedMinutes).toBe(1800);
    expect(plan.addedElapsedMinutes).toBe(690);
    // The base itself already arrived on 1 November, so the plan does not add a
    // calendar day even though it costs 11 h 30 min of elapsed time.
    expect(plan.arrivalDayDelta).toBe(0);
  });

  it("H: elapsed arithmetic uses instants, so the DST night is not 24 h", () => {
    // Europe/Stockholm gains an hour at 03:00 on 25 October 2026.
    const baseLegs = [
      leg({
        from: "A",
        to: "M",
        departure: "2026-10-24T18:00:00+02:00",
        arrival: "2026-10-24T22:00:00+02:00",
      }),
      leg({
        from: "M",
        to: "B",
        departure: "2026-10-24T22:30:00+02:00",
        arrival: "2026-10-25T04:00:00+01:00",
      }),
    ];
    const base = journeyFromLegs(baseLegs, "dst-base");
    const plan = buildOvernightPlan({
      days: [
        journeyFromLegs([baseLegs[0]!], "d1"),
        journeyFromLegs(
          [
            leg({
              from: "M",
              to: "B",
              departure: "2026-10-25T09:00:00+01:00",
              arrival: "2026-10-25T14:30:00+01:00",
            }),
          ],
          "d2",
        ),
      ],
      stays: [
        {
          station: "M",
          place: "1,1",
          arrival: "2026-10-24T22:00:00+02:00",
          departure: "2026-10-25T09:00:00+01:00",
        },
      ],
      base,
      baseFacts: journeyFacts(base, prefs.minTransferMinutes),
      preferences: prefs,
    });
    // Local clocks would say 22:00 -> 09:00 = 11 h; the real gap is 12 h.
    expect(plan.stays[0]!.waitMinutes).toBe(720);
    expect(base.durationMinutes).toBe(660);
    expect(plan.elapsedMinutes).toBe(1290);
    expect(plan.addedElapsedMinutes).toBe(630);
  });
});
