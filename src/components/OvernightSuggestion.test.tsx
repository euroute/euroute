import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { OvernightPlan } from "@/lib/overnight";
import type { OvernightResult } from "@/lib/overnight.server";

const langState = vi.hoisted(() => ({ current: "sv" as "sv" | "en" }));

vi.mock("@/lib/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/lib/i18n")>("@/lib/i18n");
  return {
    ...actual,
    useI18n: () => ({
      lang: langState.current,
      setLang: vi.fn(),
      t: (key: string, vars?: Record<string, string | number>) =>
        actual.translate(langState.current, key, vars),
    }),
  };
});

vi.mock("@/components/JourneyCard", () => ({ JourneyCard: () => null }));
vi.mock("@/components/StationField", () => ({ StationField: () => null }));

const { OvernightSuggestion } = await import("@/components/OvernightSuggestion");

const t = (day: number, hhmm: string) =>
  `2026-09-${String(day).padStart(2, "0")}T${hhmm}:00+02:00`;

function textFor(plan: OvernightPlan, lang: "sv" | "en", alternatives: OvernightPlan[] = []) {
  langState.current = lang;
  const result: OvernightResult = {
    considered: true,
    recommended: plan,
    alternatives,
    maxHoursPerDay: null,
    maxPerDayAchievable: true,
    closestLongestDayMinutes: 0,
    requestedStopUnavailable: null,
    comparedCities: 2,
    requested: null,
    requestedRejection: null,
  };

  return renderToStaticMarkup(
    <OvernightSuggestion
      result={result}
      loading={false}
      minTransferMinutes={15}
      requestedStop={null}
      onRequestStop={() => undefined}
    />,
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countText(text: string, needle: string) {
  return text.split(needle).length - 1;
}

function planFixture(overrides: Partial<OvernightPlan>): OvernightPlan {
  return {
    id: "fixture",
    days: [],
    dayStats: [
      {
        day: 1,
        fromName: "Stockholm C",
        toName: "Hamburg Hbf",
        departure: t(8, "07:00"),
        arrival: t(8, "21:57"),
        windowMinutes: 897,
        trainMinutes: 897,
        changes: 0,
        risky: 0,
        tight: 0,
        stationChanges: 0,
        overnight: false,
        burden: "veryLong",
      },
      {
        day: 2,
        fromName: "Hamburg Hbf",
        toName: "Firenze Santa Maria Novella",
        departure: t(9, "06:59"),
        arrival: t(9, "20:30"),
        windowMinutes: 811,
        trainMinutes: 811,
        changes: 1,
        risky: 0,
        tight: 0,
        stationChanges: 1,
        overnight: false,
        burden: "veryLong",
      },
    ],
    stays: [
      {
        station: "Hamburg Hbf",
        place: "53.552700,10.006500",
        arrival: t(8, "21:57"),
        departure: t(9, "06:59"),
        waitMinutes: 542,
        arrivalDate: "2026-09-08",
        departureDate: "2026-09-09",
        nights: 1,
      },
    ],
    travelMinutes: 1708,
    longestDayMinutes: 897,
    longestDayTrainMinutes: 897,
    elapsedMinutes: 2250,
    addedTravelMinutes: 0,
    addedElapsedMinutes: 0,
    arrivalDayDelta: 0,
    arrivesLaterDay: false,
    changes: 1,
    stationChanges: 1,
    riskyConnections: 0,
    tightConnections: 0,
    hasNightTravel: false,
    meetsMaxPerDay: true,
    convertsStationNightToStay: true,
    retainedStationNights: 0,
    restQuality: "veryGood",
    score: 50,
    benefits: [
      { key: "on.benefit.noNightTravel" },
      { key: "on.benefit.stationNightToStay", vars: { city: "Hamburg", time: "8 h 48 min" } },
    ],
    warnings: [{ key: "on.warn.stationChange", vars: { n: 1 } }],
    reason: { key: "on.reason.bestOfCompared", vars: { city: "Hamburg", n: 2 } },
    confidence: "alternative",
    tradeoff: null,
    ...overrides,
  };
}

function genericPlanFixture(stationChanges: number): OvernightPlan {
  return planFixture({
    id: "generic-fixture",
    dayStats: [
      {
        day: 1,
        fromName: "Stockholm C",
        toName: "Berlin Hbf",
        departure: t(8, "08:00"),
        arrival: t(8, "18:00"),
        windowMinutes: 600,
        trainMinutes: 600,
        changes: 0,
        risky: 0,
        tight: 0,
        stationChanges: 0,
        overnight: false,
        burden: "reasonable",
      },
      {
        day: 2,
        fromName: "Berlin Hbf",
        toName: "Firenze Santa Maria Novella",
        departure: t(9, "08:00"),
        arrival: t(9, "18:00"),
        windowMinutes: 600,
        trainMinutes: 600,
        changes: stationChanges,
        risky: 0,
        tight: 0,
        stationChanges,
        overnight: false,
        burden: "reasonable",
      },
    ],
    stays: [
      {
        station: "Berlin Hbf",
        place: "52.525000,13.369000",
        arrival: t(8, "18:00"),
        departure: t(9, "08:00"),
        waitMinutes: 840,
        arrivalDate: "2026-09-08",
        departureDate: "2026-09-09",
        nights: 1,
      },
    ],
    longestDayMinutes: 600,
    longestDayTrainMinutes: 600,
    stationChanges,
    convertsStationNightToStay: false,
    restQuality: "veryGood",
    benefits: [
      { key: "on.benefit.manageableDays", vars: { time: "10 h" } },
      { key: "on.benefit.rest.veryGood" },
    ],
    warnings: [{ key: "on.warn.stationChange", vars: { n: stationChanges } }],
    reason: { key: "on.reason.bestOfCompared", vars: { city: "Berlin", n: 2 } },
  });
}

describe("OvernightSuggestion deterministic Smart Overnight copy", () => {
  it("renders the Swedish station-night conversion copy", () => {
    const text = textFor(planFixture({}), "sv");

    expect(text).toContain("Smart övernattning");
    expect(text).toContain("Övernatta i Hamburg");
    expect(text).toContain("Dela resan i två dagar och få en riktig nattpaus i Hamburg.");
    expect(text).toContain("Ankomst 21:57 · Avgång nästa morgon 06:59");
    expect(text).toContain("9 h 2 min för natten i Hamburg");
    expect(text).toContain("Riktig nattpaus i Hamburg");
    expect(text).toContain("Gott om tid för kväll och natt före nästa resdag");
    expect(text).toContain("1 stationsbyte");
    expect(text).toContain("Din ursprungliga resa har redan 8 h 48 min väntan här under natten");
    expect(countText(text, "Av de 2 stopp vi jämförde ger Hamburg")).toBe(1);
  });

  it("renders the English station-night conversion copy", () => {
    const text = textFor(planFixture({}), "en");

    expect(text).toContain("Smart overnight");
    expect(text).toContain("Stay overnight in Hamburg");
    expect(text).toContain(
      "Split the journey across two days and get a proper night's rest in Hamburg.",
    );
    expect(text).toContain("Arrive 21:57 · Depart next morning 06:59");
    expect(text).toContain("9 h 2 min overnight in Hamburg");
    expect(text).toContain("A proper night's rest in Hamburg");
    expect(text).toContain("Plenty of time for an evening and a night before the next travel day");
    expect(text).toContain("1 station change");
    expect(text).toContain("Your original journey already has a 8 h 48 min overnight wait here");
    expect(countText(text, "Of the 2 stops we compared, Hamburg")).toBe(1);
  });

  it("renders generic Smart Overnight copy without station-night leakage", () => {
    const svText = textFor(genericPlanFixture(2), "sv");
    const enText = textFor(genericPlanFixture(2), "en");

    expect(svText).toContain("Smart övernattning");
    expect(svText).toContain("Övernatta i Berlin");
    expect(svText).toContain("Dela resan i två dagar och få en riktig nattpaus i Berlin.");
    expect(svText).toContain("Av de 2 stopp vi jämförde ger Berlin");
    expect(svText).toContain("2 stationsbyten");
    expect(svText).not.toContain("väntan här under natten");
    expect(svText).not.toContain("nattväntan på stationen");
    expect(svText).not.toContain("vänta natten på stationen");

    expect(enText).toContain("Smart overnight");
    expect(enText).toContain("Stay overnight in Berlin");
    expect(enText).toContain(
      "Split the journey across two days and get a proper night's rest in Berlin.",
    );
    expect(enText).toContain("Of the 2 stops we compared, Berlin");
    expect(enText).toContain("2 station changes");
    expect(enText).not.toContain("overnight wait here");
    expect(enText).not.toContain("overnight wait at the station");
    expect(enText).not.toContain("spending the night waiting at the station");
  });

  it("keeps Swedish station-change pluralisation distinct", () => {
    expect(textFor(genericPlanFixture(1), "sv")).toContain("1 stationsbyte");
    expect(textFor(genericPlanFixture(2), "sv")).toContain("2 stationsbyten");
  });

  it("does not display longest-day benefit copy while retaining the long-day warning", () => {
    const text = textFor(
      genericPlanFixture(0),
      "sv",
    );

    const warningPlan = genericPlanFixture(0);
    warningPlan.benefits = [
      { key: "on.benefit.shorterDays", vars: { time: "14 h 8 min" } },
      { key: "on.benefit.rest.veryGood" },
    ];
    warningPlan.warnings = [{ key: "on.warn.extremeDay", vars: { n: 2, time: "14 h 8 min" } }];

    const warningText = textFor(warningPlan, "sv");
    expect(text).not.toContain("Längsta resdag 14 h 8 min");
    expect(warningText).not.toContain("Längsta resdag 14 h 8 min");
    expect(warningText).toContain("Mycket lång resdag 2 (14 h 8 min)");
  });

  it("hides the overnight-city options section when no alternatives are available", () => {
    const svText = textFor(planFixture({}), "sv");
    const enText = textFor(planFixture({}), "en");

    expect(svText).not.toContain("Jag vill övernatta i:");
    expect(enText).not.toContain("I want to stay overnight in:");
  });

  it("renders alternative overnight-city options below the overnight-city heading", () => {
    const svText = textFor(planFixture({}), "sv", [genericPlanFixture(1)]);
    const enText = textFor(planFixture({}), "en", [genericPlanFixture(1)]);

    expect(svText).toContain("Jag vill övernatta i:");
    expect(svText).toContain("Övernatta i Berlin");
    expect(enText).toContain("I want to stay overnight in:");
    expect(enText).toContain("Stay in Berlin");
  });
});
/** Renders the card from a raw result, for the requested-branch precedence. */
function textForResult(result: OvernightResult, lang: "sv" | "en") {
  langState.current = lang;
  return renderToStaticMarkup(
    <OvernightSuggestion
      result={result}
      loading={false}
      minTransferMinutes={15}
      requestedStop={null}
      onRequestStop={() => undefined}
    />,
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function emptyResult(overrides: Partial<OvernightResult>): OvernightResult {
  return {
    considered: true,
    recommended: null,
    alternatives: [],
    maxHoursPerDay: null,
    maxPerDayAchievable: true,
    closestLongestDayMinutes: 0,
    requestedStopUnavailable: null,
    comparedCities: 2,
    requested: null,
    requestedRejection: null,
    ...overrides,
  };
}

describe("requested overnight rejection vs true unavailable", () => {
  const rejected = emptyResult({
    requestedStopUnavailable: "København H",
    requestedRejection: {
      station: "København H",
      reasons: ["extremeTravelDay"],
      warnings: [],
    },
  });

  it("shows the viability reason instead of the generic unavailable copy (sv)", () => {
    const text = textForResult(rejected, "sv");
    expect(text).toContain("Ett uppehåll i København blir ingen bra uppdelning");
    expect(text).toContain("Minst en av resdagarna blir fortfarande orimligt lång.");
    expect(text).not.toContain("Vi hittade ingen resa som fungerar");
    expect(text).not.toContain("Smart övernattning");
    expect(text).toContain("Jag vill övernatta i:");
  });

  it("shows the viability reason in English", () => {
    const text = textForResult(rejected, "en");
    expect(text).toContain("An overnight stop in København doesn't make a good two-day split");
    expect(text).toContain("At least one of the travel days would still be unreasonably long.");
    expect(text).not.toContain("We found no journey that works");
    expect(text).not.toContain("Smart overnight");
  });

  it("renders insufficientDay1 rejections", () => {
    const text = textForResult(
      emptyResult({
        requestedStopUnavailable: "Paris Gare de Lyon",
        requestedRejection: {
          station: "Paris Gare de Lyon",
          reasons: ["insufficientDay1"],
          warnings: [],
        },
      }),
      "sv",
    );
    expect(text).toContain("Första resdagen blir för kort");
  });

  it("keeps the generic copy for a true availability failure", () => {
    const text = textForResult(emptyResult({ requestedStopUnavailable: "Basel SBB" }), "sv");
    expect(text).toContain("Vi kunde inte bygga en fungerande tvådagarsresa via Basel");
    expect(text).not.toContain("blir ingen bra uppdelning");
  });
});
