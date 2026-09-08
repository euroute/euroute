/**
 * Phase C regression suite: OPTIONAL overnight candidates.
 *
 * Deterministic fixtures only – no live Transitous data. Fixture shapes mirror
 * the itineraries observed in the beta matrix (London→Firenze, Stockholm→
 * Firenze, Wien→Roma) so the rules are exercised against realistic journeys.
 */

import { describe, expect, it } from "vitest";

import { journeyFacts, type JourneyPreferences } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";
import { buildOvernightPlan, journeyFromLegs, overnightMode, type OvernightPlan } from "./overnight";
import {
  optionalStopPlace,
  optionalUsefulness,
  optionalViability,
  reconcileRequestedStop,
  selectOptionalCandidates,
} from "./overnight-optional";
import { requestedViability } from "./overnight-viability";

const t = (day: number, hhmm: string) =>
  `2026-09-${String(day).padStart(2, "0")}T${hhmm}:00+02:00`;

const leg = (args: {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  kind?: Leg["kind"];
}): Leg => ({
  kind: args.kind ?? "train",
  mode: "HIGHSPEED_RAIL",
  modeLabel: "Tåg",
  fromName: args.from,
  toName: args.to,
  fromPlace: "59.330,18.058",
  toPlace: "52.520,13.405",
  departure: args.departure,
  arrival: args.arrival,
  durationMinutes: Math.round(
    (new Date(args.arrival).getTime() - new Date(args.departure).getTime()) / 60000,
  ),
  operator: "OP",
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

const journey = (id: string, legs: Leg[]): Journey => journeyFromLegs(legs, id);

const baseJourney = (args: { from: string; to: string; departure: string; arrival: string }) =>
  journey("base", [leg(args)]);

function plan(args: {
  base: Journey;
  station: string;
  day1: Journey;
  day2: Journey;
  mode?: "recommended" | "optional" | "requested";
}): OvernightPlan {
  return buildOvernightPlan({
    days: [args.day1, args.day2],
    stays: [
      {
        station: args.station,
        place: "52.520,13.405",
        arrival: args.day1.arrival,
        departure: args.day2.departure,
      },
    ],
    base: args.base,
    baseFacts: journeyFacts(args.base, prefs.minTransferMinutes),
    preferences: prefs,
    ...(args.mode ? { mode: args.mode } : {}),
  });
}

/* ------------------------------- fixtures -------------------------------- */

const londonFirenzeBase = baseJourney({
  from: "London St Pancras",
  to: "Firenze S.M.N.",
  departure: t(8, "08:00"),
  arrival: t(8, "22:00"), // 14 h continuous
});

const sthlmFirenzeBase = baseJourney({
  from: "Stockholm C",
  to: "Firenze S.M.N.",
  departure: t(8, "08:00"),
  arrival: t(9, "14:17"), // 30 h 17 min continuous
});

const wienRomaBase = baseJourney({
  from: "Wien Hbf",
  to: "Roma Termini",
  departure: t(8, "08:00"),
  arrival: t(8, "20:30"), // 12 h 30 min continuous
});

/** London → Firenze, split in Basel: 6 h / night / 6 h 40. */
const baselFromLondon = () =>
  plan({
    base: londonFirenzeBase,
    station: "Basel SBB",
    day1: journey("d1-basel", [
      leg({ from: "London St Pancras", to: "Basel SBB", departure: t(8, "08:00"), arrival: t(8, "17:00") }),
    ]),
    day2: journey("d2-basel", [
      leg({ from: "Basel SBB", to: "Firenze S.M.N.", departure: t(9, "07:20"), arrival: t(9, "14:00") }),
    ]),
  });

/** London → Firenze, split in Paris after 2 h 29: day 1 is too short. */
const parisFromLondon = () =>
  plan({
    base: londonFirenzeBase,
    station: "Paris Nord",
    day1: journey("d1-paris", [
      leg({ from: "London St Pancras", to: "Paris Nord", departure: t(8, "16:00"), arrival: t(8, "18:29") }),
    ]),
    day2: journey("d2-paris", [
      leg({ from: "Paris Nord", to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "20:00") }),
    ]),
  });

/** Stockholm → Firenze, split in Hamburg: 10 h 27 / night / 13 h 55. */
const hamburgFromStockholm = () =>
  plan({
    base: sthlmFirenzeBase,
    station: "Hamburg Hbf",
    day1: journey("d1-hamburg", [
      leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:27") }),
    ]),
    day2: journey("d2-hamburg", [
      leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(9, "20:55") }),
    ]),
  });

/** Stockholm → Firenze, split in København: day 2 remains extreme (25 h 40). */
const copenhagenFromStockholm = () =>
  plan({
    base: sthlmFirenzeBase,
    station: "København H",
    day1: journey("d1-cph", [
      leg({ from: "Stockholm C", to: "København H", departure: t(8, "08:00"), arrival: t(8, "13:30") }),
    ]),
    day2: journey("d2-cph", [
      leg({ from: "København H", to: "Firenze S.M.N.", departure: t(9, "07:00"), arrival: t(10, "08:40") }),
    ]),
  });

/** Wien → Roma, split in Bologna: 10 h 16 / night / 2 h 03. */
const bolognaFromWien = () =>
  plan({
    base: wienRomaBase,
    station: "Bologna Centrale",
    day1: journey("d1-bologna", [
      leg({ from: "Wien Hbf", to: "Bologna Centrale", departure: t(8, "08:00"), arrival: t(8, "18:16") }),
    ]),
    day2: journey("d2-bologna", [
      leg({ from: "Bologna Centrale", to: "Roma Termini", departure: t(9, "07:10"), arrival: t(9, "09:13") }),
    ]),
  });

/* ------------------------------ the rules -------------------------------- */

describe("optional viability", () => {
  it("1. London → Firenze / Basel is a viable optional split", () => {
    const v = optionalViability({ plan: baselFromLondon(), base: londonFirenzeBase });
    expect(v.viable).toBe(true);
    expect(v.reasons).toEqual([]);
  });

  it("2. London → Firenze / Paris is rejected: day 1 is insufficient", () => {
    const v = optionalViability({ plan: parisFromLondon(), base: londonFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("insufficientDay1");
  });

  it("3. Stockholm → Firenze / Hamburg is evaluated honestly", () => {
    const v = optionalViability({ plan: hamburgFromStockholm(), base: sthlmFirenzeBase });
    // Recorded outcome: both days are real and long; the split is rejected only
    // if a day reaches `extreme` burden.
    if (!v.viable) expect(v.reasons).toContain("extremeTravelDay");
    else expect(v.warnings).toContain("veryLongTravelDay");
  });

  it("4. Stockholm → Firenze / København is rejected: day 2 stays extreme", () => {
    const v = optionalViability({ plan: copenhagenFromStockholm(), base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("extremeTravelDay");
  });

  it("5. Wien → Roma / Bologna is viable at fixture level", () => {
    const v = optionalViability({ plan: bolognaFromWien(), base: wienRomaBase });
    expect(v.viable).toBe(true);
  });

  it("6. a pathological detour is rejected", () => {
    // A 10 h direct journey turned into 25 h of on-board time via a stop that
    // sits far off the corridor.
    const shortBase = baseJourney({
      from: "Wien Hbf",
      to: "Roma Termini",
      departure: t(8, "08:00"),
      arrival: t(8, "18:00"),
    });
    const detour = plan({
      base: shortBase,
      station: "Zürich HB",
      day1: journey("d1-zrh", [
        leg({ from: "Wien Hbf", to: "Zürich HB", departure: t(8, "08:00"), arrival: t(8, "21:00") }),
      ]),
      day2: journey("d2-zrh", [
        leg({ from: "Zürich HB", to: "Roma Termini", departure: t(9, "07:00"), arrival: t(9, "19:00") }),
      ]),
    });
    const v = optionalViability({ plan: detour, base: shortBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("materialDetour");
  });

  it("7. an arrival at 04:00 is rejected", () => {
    const late = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1-late", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "18:00"), arrival: t(9, "04:00") }),
      ]),
      day2: journey("d2-late", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "18:00"), arrival: t(10, "04:00") }),
      ]),
    });
    const v = optionalViability({ plan: late, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("arrivalTooLate");
  });

  it("8. a rest window under 9 hours is rejected", () => {
    const short = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1-short", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
      ]),
      day2: journey("d2-short", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "01:00"), arrival: t(9, "12:00") }),
      ]),
    });
    const v = optionalViability({ plan: short, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("restTooShort");
  });

  it("9. an extreme day 1 is rejected", () => {
    const extremeDay1 = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1-extreme", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "06:00"), arrival: t(8, "22:30") }),
      ]),
      day2: journey("d2-extreme", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "16:00") }),
      ]),
    });
    const v = optionalViability({ plan: extremeDay1, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("extremeTravelDay");
  });

  it("10. an extreme day 2 is rejected", () => {
    const v = optionalViability({ plan: copenhagenFromStockholm(), base: sthlmFirenzeBase });
    expect(v.reasons).toContain("extremeTravelDay");
    expect(copenhagenFromStockholm().dayStats[1]!.burden).toBe("extreme");
  });

  it("11. a veryLong day is allowed, with a warning", () => {
    const veryLong = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1-vl", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "21:30") }),
      ]),
      day2: journey("d2-vl", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "16:00") }),
      ]),
    });
    expect(veryLong.dayStats[0]!.burden).toBe("veryLong");
    const v = optionalViability({ plan: veryLong, base: sthlmFirenzeBase });
    expect(v.viable).toBe(true);
    expect(v.warnings).toContain("veryLongTravelDay");
  });

  it("12. day 2 must also be meaningful", () => {
    const tinyDay2 = plan({
      base: sthlmFirenzeBase,
      station: "Hamburg Hbf",
      day1: journey("d1-tiny", [
        leg({ from: "Stockholm C", to: "Hamburg Hbf", departure: t(8, "08:00"), arrival: t(8, "18:00") }),
      ]),
      day2: journey("d2-tiny", [
        leg({ from: "Hamburg Hbf", to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "08:45") }),
      ]),
    });
    const v = optionalViability({ plan: tinyDay2, base: sthlmFirenzeBase });
    expect(v.viable).toBe(false);
    expect(v.reasons).toContain("insufficientDay2");
  });
});

/* --------------------------- selection & modes ---------------------------- */

describe("optional candidate selection", () => {
  it("13. a city already recommended never appears as optional", () => {
    const basel = baselFromLondon();
    const picked = selectOptionalCandidates({
      plans: [basel],
      base: londonFirenzeBase,
      exclude: [basel],
    });
    expect(picked).toEqual([]);
  });

  it("14. selected candidates are mode 'optional' and never recommended", () => {
    const picked = selectOptionalCandidates({
      plans: [baselFromLondon()],
      base: londonFirenzeBase,
    });
    expect(picked.length).toBe(1);
    expect(picked[0]!.plan.mode).toBe("optional");
    expect(overnightMode(picked[0]!.plan)).toBe("optional");
    expect(picked[0]!.plan.confidence).not.toBe("strong");
  });

  it("15. never more than three candidates, and non-viable ones are dropped", () => {
    const viable = [1, 2, 3, 4, 5].map((n) =>
      plan({
        base: sthlmFirenzeBase,
        station: `City ${n}`,
        day1: journey(`d1-${n}`, [
          leg({ from: "Stockholm C", to: `City ${n}`, departure: t(8, "08:00"), arrival: t(8, `1${n}:00`) }),
        ]),
        day2: journey(`d2-${n}`, [
          leg({ from: `City ${n}`, to: "Firenze S.M.N.", departure: t(9, "08:00"), arrival: t(9, "16:00") }),
        ]),
      }),
    );
    const picked = selectOptionalCandidates({
      plans: [...viable, parisFromLondon(), copenhagenFromStockholm()],
      base: sthlmFirenzeBase,
    });
    expect(picked.length).toBeLessThanOrEqual(3);
    expect(picked.every((c) => c.usefulness >= 30)).toBe(true);
  });

  it("16. no viable candidates returns none – nothing is manufactured", () => {
    const picked = selectOptionalCandidates({
      plans: [parisFromLondon(), copenhagenFromStockholm()],
      base: sthlmFirenzeBase,
    });
    expect(picked).toEqual([]);
  });

  it("17. usefulness prefers balanced days with a good rest window", () => {
    const balanced = optionalUsefulness(baselFromLondon());
    const lopsided = optionalUsefulness(bolognaFromWien());
    expect(balanced).toBeGreaterThan(lopsided);
  });

  it("18. requested-mode behaviour is unchanged by optional rules", () => {
    const requested = plan({ ...{ base: londonFirenzeBase }, ...requestedFixture() });
    expect(requestedViability({ plan: requested, base: londonFirenzeBase }).viable).toBe(true);
    expect(overnightMode(requested)).toBe("requested");
  });

  it("19. a legacy plan without `mode` still reads as recommended", () => {
    const legacy = { ...baselFromLondon() } as OvernightPlan & { mode?: unknown };
    delete legacy.mode;
    expect(overnightMode(legacy as OvernightPlan)).toBe("recommended");
  });

  it("20. choosing an optional stop keeps intent and stopId", () => {
    const stay = baselFromLondon().stays[0]!;
    const chosen = optionalStopPlace(stay);
    expect(chosen.intent).toBe("station");
    expect(chosen.place).toBe(stay.place);

    const withId = { ...chosen, stopId: "de:11000:900003201" };
    const fromUrl = { name: stay.station, place: stay.place };
    const reconciled = reconcileRequestedStop(fromUrl, withId);
    expect(reconciled?.intent).toBe("station");
    expect(reconciled?.stopId).toBe("de:11000:900003201");

    // A different stop in the URL must not inherit the previous selection.
    const other = { name: "Milano Centrale", place: "45.486,9.204" };
    expect(reconcileRequestedStop(other, withId)).toEqual(other);
    expect(reconcileRequestedStop(null, withId)).toBeNull();
  });
});

function requestedFixture() {
  return {
    station: "Basel SBB",
    day1: journey("d1-req", [
      leg({ from: "London St Pancras", to: "Basel SBB", departure: t(8, "08:00"), arrival: t(8, "17:00") }),
    ]),
    day2: journey("d2-req", [
      leg({ from: "Basel SBB", to: "Firenze S.M.N.", departure: t(9, "07:20"), arrival: t(9, "14:00") }),
    ]),
    mode: "requested" as const,
  };
}
