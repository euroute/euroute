import { describe, expect, it } from "vitest";

import {
  dedupePassengerJourneys,
  journeyFingerprint,
  legServiceIdentity,
  metadataRichness,
} from "./journey-dedupe";
import { DEFAULT_PREFERENCES, analyseJourneys } from "./journey-intelligence";
import type { Journey, Leg } from "./journey";

function leg(partial: Partial<Leg>): Leg {
  return {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Höghastighetståg",
    fromName: "Paris Gare de Lyon",
    toName: "Lyon Part Dieu",
    departure: "2026-08-28T06:46:00Z",
    arrival: "2026-08-28T08:40:00Z",
    durationMinutes: 114,
    realTime: false,
    ...partial,
  };
}

function journey(id: string, legs: Leg[], extra: Partial<Journey> = {}): Journey {
  const transit = legs.filter((l) => l.kind !== "walk");
  const departure = legs[0]!.departure;
  const arrival = legs[legs.length - 1]!.arrival;
  return {
    id,
    departure,
    arrival,
    durationMinutes: Math.round(
      (new Date(arrival).getTime() - new Date(departure).getTime()) / 60000,
    ),
    transfers: Math.max(0, transit.length - 1),
    legs,
    operators: Array.from(new Set(transit.map((l) => l.operator ?? "").filter(Boolean))),
    hasNightLeg: false,
    chained: false,
    ...extra,
  };
}

const parisLyon = journey("a", [
  leg({ trainName: "TGV INOUI 6645", operator: "SNCF VOYAGEURS", fromStopId: "x", toStopId: "y" }),
]);

describe("passenger-visible dedupe", () => {
  it("collapses two upstream representations of the same train journey", () => {
    // Same train number, same stations and times, different feed spelling/ids.
    const other = journey("b", [
      leg({
        fromName: "PARIS GARE DE LYON",
        toName: "LYON-PART-DIEU",
        trainName: "FR 6645",
        operator: "Trenitalia",
      }),
    ]);
    const { kept, removed } = dedupePassengerJourneys([parisLyon, other].map((j) => ({ journey: j })));
    expect(kept).toHaveLength(1);
    expect(removed).toHaveLength(1);
    // Richer bookability metadata wins deterministically.
    expect(kept[0]!.journey.id).toBe("a");
  });

  it("collapses the Paris → Lyon production case: many variants, one card", () => {
    const variants = [0, 1, 2, 3, 4, 5].map((i) =>
      journey(`v${i}`, [
        leg({ trainName: "TGV INOUI 6645", operator: "SNCF VOYAGEURS" }),
      ]),
    );
    const analysis = analyseJourneys({
      journeys: variants,
      preferences: DEFAULT_PREFERENCES,
      style: "recommended",
      requestedDepartureIso: "2026-08-28T06:00:00Z",
    });
    expect(analysis.options).toHaveLength(1);
    // Duplicate copies must not inflate "Visa fler resor".
    expect(analysis.more).toHaveLength(0);
  });

  it("preserves different departure times", () => {
    const departures = ["06:46", "07:46", "08:46"];
    const items = departures.map((hhmm, i) =>
      journey(`d${i}`, [
        leg({
          departure: `2026-08-28T${hhmm}:00Z`,
          arrival: `2026-08-28T${Number(hhmm.slice(0, 2)) + 2}:40:00Z`,
          trainName: `TGV INOUI 66${i}5`,
          operator: "SNCF VOYAGEURS",
        }),
      ]),
    );
    expect(dedupePassengerJourneys(items.map((j) => ({ journey: j }))).kept).toHaveLength(3);
  });

  it("preserves different services with identical timestamps", () => {
    const b = journey("b", [leg({ trainName: "TGV INOUI 6701", operator: "SNCF VOYAGEURS" })]);
    expect(
      dedupePassengerJourneys([parisLyon, b].map((j) => ({ journey: j }))).kept,
    ).toHaveLength(2);
  });

  it("preserves a different transfer structure with identical overall times", () => {
    const withChange = journey("b", [
      leg({
        toName: "Dijon",
        trainName: "TGV INOUI 6801",
        operator: "SNCF VOYAGEURS",
        arrival: "2026-08-28T07:40:00Z",
      }),
      leg({
        fromName: "Dijon",
        trainName: "TER 12",
        operator: "SNCF",
        departure: "2026-08-28T08:00:00Z",
      }),
    ]);
    expect(
      dedupePassengerJourneys([parisLyon, withChange].map((j) => ({ journey: j }))).kept,
    ).toHaveLength(2);
  });

  it("preserves materially different intermediate routing", () => {
    const viaOther = journey("b", [
      leg({
        toName: "Lyon Perrache",
        trainName: "TGV INOUI 6645",
        operator: "SNCF VOYAGEURS",
        arrival: "2026-08-28T08:20:00Z",
      }),
      leg({
        fromName: "Lyon Perrache",
        trainName: "TER 5",
        operator: "SNCF",
        departure: "2026-08-28T08:30:00Z",
      }),
    ]);
    expect(
      dedupePassengerJourneys([parisLyon, viaOther].map((j) => ({ journey: j }))).kept,
    ).toHaveLength(2);
  });

  it("selects the representative deterministically and stably", () => {
    const poor = journey("a", [leg({ trainName: "FR 6645" })]);
    const rich = journey("z", [
      leg({
        trainName: "FR 6645",
        operator: "Trenitalia",
        operatorUrl: "https://example.test",
        fromStopId: "p",
        toStopId: "l",
      }),
    ]);
    expect(metadataRichness(rich)).toBeGreaterThan(metadataRichness(poor));
    for (const order of [[poor, rich], [rich, poor]]) {
      const { kept } = dedupePassengerJourneys(order.map((j) => ({ journey: j })));
      expect(kept).toHaveLength(1);
      expect(kept[0]!.journey.id).toBe("z");
    }
  });

  it("uses train numbers as cross-feed service identity", () => {
    expect(legServiceIdentity(leg({ trainName: "TGV INOUI 6645" }))).toBe(
      legServiceIdentity(leg({ trainName: "FR 6645" })),
    );
    expect(legServiceIdentity(leg({ trainName: "ICE 71" }))).not.toBe(
      legServiceIdentity(leg({ trainName: "ICE 73" })),
    );
  });

  it("fingerprints ignore walk-only representation differences", () => {
    const withWalk = journey("w", [
      leg({
        kind: "walk",
        mode: "WALK",
        fromName: "Paris Gare de Lyon Hall 1 - 2",
        toName: "Paris Gare de Lyon",
        departure: "2026-08-28T06:41:00Z",
        arrival: "2026-08-28T06:46:00Z",
        durationMinutes: 5,
      }),
      leg({ trainName: "TGV INOUI 6645", operator: "SNCF VOYAGEURS" }),
    ]);
    // Overall journey timestamps differ (the walk moves the start), so these are
    // still distinct passenger choices – the fingerprint must not merge them.
    expect(journeyFingerprint(withWalk)).not.toBe(journeyFingerprint(parisLyon));
  });

  it("duplicate copies do not change the profile winner", () => {
    const early = journey("early", [
      leg({ trainName: "TGV INOUI 6607", operator: "SNCF VOYAGEURS" }),
    ]);
    const later = journey("later", [
      leg({
        departure: "2026-08-28T09:00:00Z",
        arrival: "2026-08-28T10:56:00Z",
        trainName: "TGV INOUI 6611",
        operator: "SNCF VOYAGEURS",
      }),
    ]);
    const clean = analyseJourneys({
      journeys: [early, later],
      preferences: DEFAULT_PREFERENCES,
      style: "recommended",
      requestedDepartureIso: "2026-08-28T06:00:00Z",
    });
    const withDupes = analyseJourneys({
      journeys: [early, { ...later, id: "later-copy" }, later, { ...early, id: "early-copy" }],
      preferences: DEFAULT_PREFERENCES,
      style: "recommended",
      requestedDepartureIso: "2026-08-28T06:00:00Z",
    });
    expect(withDupes.options[0]!.journey.departure).toBe(clean.options[0]!.journey.departure);
    expect(withDupes.options.length + withDupes.more.length).toBe(
      clean.options.length + clean.more.length,
    );
  });
});
