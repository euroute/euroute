import { describe, expect, it } from "vitest";

import {
  bookingActionLabelKey,
  bookingPlanForLeg,
  legBookability,
  plannerTargetForLeg,
  verifiedRetailerTargetForLeg,
} from "./booking-actions";
import { segmentsForDay } from "./trip-plan";
import { en, sv } from "./i18n";
import type { Journey, Leg } from "./journey";

function leg(partial: Partial<Leg>): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: "London St Pancras International",
    toName: "Lille Europe",
    departure: "2026-09-15T09:01:00Z",
    arrival: "2026-09-15T11:24:00Z",
    durationMinutes: 83,
    realTime: false,
    ...partial,
  };
}

describe("bookability classification", () => {
  it("treats intercity rail modes as bookable", () => {
    for (const mode of [
      "HIGHSPEED_RAIL",
      "LONG_DISTANCE",
      "NIGHT_RAIL",
      "REGIONAL_FAST_RAIL",
      "REGIONAL_RAIL",
      "RAIL",
    ]) {
      expect(legBookability(leg({ mode }))).toBe("rail");
    }
  });

  it("treats local modes and walking as non-bookable", () => {
    for (const mode of ["METRO", "SUBWAY", "TRAM", "SUBURBAN", "BUS", "COACH", "FERRY"]) {
      expect(legBookability(leg({ kind: "other", mode }))).toBe("local");
    }
    expect(legBookability(leg({ kind: "walk", mode: "WALK" }))).toBe("local");
  });

  it("renders no booking action at all for local transit", () => {
    const plan = bookingPlanForLeg(leg({ kind: "other", mode: "METRO", operator: "RATP" }));
    expect(plan.kind).toBe("local");
    expect(plan.actions).toEqual([]);
  });
});

describe("reliability hierarchy", () => {
  it("puts the known operator first and emits nothing else", () => {
    const plan = bookingPlanForLeg(leg({ operator: "Eurostar" }));
    expect(plan.kind).toBe("rail");
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0]).toMatchObject({ target: "operator", label: "Eurostar" });
    expect(plan.actions[0]!.url).toBe("https://www.eurostar.com/");
  });

  it("resolves SNCF, DB and SJ legs to their own operator target", () => {
    expect(bookingPlanForLeg(leg({ operator: "SNCF Voyageurs" })).actions[0]).toMatchObject({
      target: "operator",
      label: "SNCF Connect",
    });
    expect(bookingPlanForLeg(leg({ operator: "DB Fernverkehr" })).actions[0]).toMatchObject({
      label: "Deutsche Bahn",
      url: "https://int.bahn.de/en",
    });
    expect(bookingPlanForLeg(leg({ operator: "SJ AB" })).actions[0]).toMatchObject({ label: "SJ" });
  });

  it("never emits a generic planner or unverified retailer link", () => {
    const l = leg({ operator: "Eurostar" });
    expect(plannerTargetForLeg(l)).toBeNull();
    expect(verifiedRetailerTargetForLeg(l)).toBeNull();
    const plan = bookingPlanForLeg(leg({ operator: "Trenitalia" }));
    expect(plan.actions.some((a) => a.target === "planner")).toBe(false);
    expect(plan.actions.some((a) => a.target === "retailer")).toBe(false);
    expect(plan.actions.every((a) => !a.url.includes("bahn.de/en/buchung"))).toBe(true);
    expect(plan.actions.every((a) => !a.url.includes("thetrainline.com"))).toBe(true);
  });

  it("gives an honest empty state for an unknown operator", () => {
    expect(bookingPlanForLeg(leg({ operator: "Joint Venture Rail Consortium" })).actions).toEqual(
      [],
    );
    expect(bookingPlanForLeg(leg({ operator: undefined })).actions).toEqual([]);
  });

  it("does not loose-match short codes or codeshare strings", () => {
    for (const operator of ["SJ Cargo Logistics", "NS Shipping", "VR Bus Oy Turku", "CD Projekt"]) {
      expect(bookingPlanForLeg(leg({ operator })).actions).toEqual([]);
    }
  });

  it("uses the feed's own operator URL when the alias is unknown", () => {
    const plan = bookingPlanForLeg(
      leg({ operator: "Ferrovie Locali", operatorUrl: "https://example.railway/" }),
    );
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0]).toMatchObject({
      target: "operator",
      label: "Ferrovie Locali",
      contextual: false,
    });
  });

  it("labels homepage targets 'open' and never claims prefill", () => {
    const action = bookingPlanForLeg(leg({ operator: "ÖBB" })).actions[0]!;
    expect(action.contextual).toBe(false);
    expect(bookingActionLabelKey(action)).toBe("booking.open");
    expect(bookingActionLabelKey({ ...action, contextual: true })).toBe("booking.bookWith");
  });
});

describe("copy", () => {
  it("has SV and EN strings for every booking state", () => {
    for (const key of ["booking.open", "booking.bookWith", "booking.local", "booking.none"]) {
      expect(sv[key]).toBeTruthy();
      expect(en[key]).toBeTruthy();
    }
    expect(sv["booking.local"]).toBe("Lokaltrafik – biljett köps enligt lokala villkor.");
    expect(en["booking.none"]).toBe("No reliable booking link is available for this leg.");
  });
});

describe("trip snapshots", () => {
  const journey: Journey = {
    id: "j1",
    departure: "2026-09-15T09:01:00Z",
    arrival: "2026-09-15T12:34:00Z",
    durationMinutes: 213,
    transfers: 1,
    legs: [
      leg({ operator: "Eurostar" }),
      leg({
        mode: "METRO",
        kind: "other",
        operator: "RATP",
        fromName: "Lille Europe",
        toName: "Lille Flandres",
        departure: "2026-09-15T11:30:00Z",
        arrival: "2026-09-15T11:40:00Z",
      }),
      leg({
        operator: "SNCF Voyageurs",
        fromName: "Lille Flandres",
        toName: "Paris Gare du Nord",
        departure: "2026-09-15T11:50:00Z",
        arrival: "2026-09-15T12:34:00Z",
      }),
    ],
    operators: ["Eurostar", "SNCF Voyageurs"],
    hasNightLeg: false,
    chained: false,
  };

  it("stores classified actions and no guessed URLs", () => {
    const segments = segmentsForDay(journey, 1);
    expect(segments).toHaveLength(3);
    expect(segments[0]!.bookability).toBe("rail");
    expect(segments[0]!.actions?.[0]).toMatchObject({ target: "operator", label: "Eurostar" });
    expect(segments[1]!.bookability).toBe("local");
    expect(segments[1]!.actions).toEqual([]);
    expect(segments[2]!.actions?.[0]).toMatchObject({ label: "SNCF Connect" });
    for (const segment of segments) {
      expect(segment.bookingUrl).toBeUndefined();
      expect(segment.retailerUrl).toBeUndefined();
    }
  });

  it("keeps legacy snapshot fields assignable so old trips render unchanged", () => {
    const legacy = {
      ...segmentsForDay(journey, 1)[0]!,
      bookability: undefined,
      actions: undefined,
      bookingUrl: "https://int.bahn.de/en/buchung/fahrplan/suche#old",
      retailerUrl: "https://www.thetrainline.com/train-times/london-to-lille",
    };
    expect(legacy.bookingUrl).toContain("int.bahn.de");
    expect(legacy.actions).toBeUndefined();
  });

  it("preserves the planner|operator|retailer analytics taxonomy", () => {
    const targets = segmentsForDay(journey, 1).flatMap((s) => s.actions ?? []).map((a) => a.target);
    expect(new Set(targets)).toEqual(new Set(["operator"]));
  });
});
