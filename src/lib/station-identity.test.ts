import { describe, expect, it } from "vitest";

import {
  coordinateDistanceMeters,
  exactSameStopId,
  normalizeStationName,
  normalizedName,
  overnightStationKey,
  parseCoords,
  sameParentId,
} from "./station-identity";
import { STATION_PAIR_FIXTURES } from "./__fixtures__/station-pairs";

describe("normalizeStationName", () => {
  it("A. identical names normalise equal", () => {
    expect(normalizeStationName("Hamburg Hbf")).toBe(normalizeStationName("Hamburg Hbf"));
  });

  it("B. case differences are ignored", () => {
    expect(normalizeStationName("ROMA TERMINI")).toBe(normalizeStationName("Roma Termini"));
  });

  it("C. punctuation differences are ignored", () => {
    expect(normalizeStationName("Firenze S.M.N")).toBe(normalizeStationName("Firenze-SMN"));
  });

  it("D. spacing differences are ignored", () => {
    expect(normalizeStationName("Gare  du   Nord")).toBe(normalizeStationName("Gare du Nord"));
  });

  it("E. supported variants: generic station words and transliterations", () => {
    expect(normalizeStationName("Hamburg Hbf")).toBe(normalizeStationName("Hamburg Hauptbahnhof"));
    expect(normalizeStationName("Zürich HB")).toBe(normalizeStationName("Zuerich HB"));
    expect(normalizeStationName("Berlin Hbf, Berlin")).toBe(normalizeStationName("Berlin Hbf"));
  });

  it("F. clearly different stations stay different", () => {
    expect(normalizeStationName("Paris Gare du Nord")).not.toBe(
      normalizeStationName("Paris Gare de Lyon"),
    );
  });

  it("keeps the legacy overnight variant (no transliteration)", () => {
    expect(overnightStationKey("Zuerich HB")).not.toBe(overnightStationKey("Zürich HB"));
    expect(overnightStationKey("Hamburg Hbf")).toBe(overnightStationKey("Hamburg Hauptbahnhof"));
  });

  it("preserves the Phase 1 rule: Paris-Nord is not yet Gare du Nord", () => {
    expect(normalizeStationName("Paris-Nord")).not.toBe(normalizeStationName("Gare du Nord"));
  });
});

describe("identity primitives", () => {
  it("G. tolerates missing optional metadata", () => {
    const a = { name: "Wien Hbf" };
    const b = { name: "Wien Hauptbahnhof" };
    expect(normalizedName(a)).toBe(normalizedName(b));
    expect(exactSameStopId(a, b)).toBe(false);
    expect(sameParentId(a, b)).toBe(false);
    expect(coordinateDistanceMeters(a, b)).toBeUndefined();
  });

  it("H. exact stopId match", () => {
    expect(
      exactSameStopId({ name: "A", stopId: "de-DELFI_de:11:9002" }, { name: "B", stopId: "de-DELFI_de:11:9002" }),
    ).toBe(true);
  });

  it("I. different stopIds do not match", () => {
    expect(exactSameStopId({ name: "A", stopId: "x1" }, { name: "B", stopId: "x2" })).toBe(false);
  });

  it("J. same parentId match, verbatim only", () => {
    expect(sameParentId({ name: "A", parentId: "p1" }, { name: "B", parentId: "p1" })).toBe(true);
    expect(sameParentId({ name: "A", parentId: "p1" }, { name: "B", parentId: "p2" })).toBe(false);
    expect(sameParentId({ name: "A", parentId: "p1" }, { name: "B" })).toBe(false);
  });

  it("K. coordinate distance in metres", () => {
    const d = coordinateDistanceMeters(
      { name: "Paris-Nord", lat: 48.880959, lon: 2.35519 },
      { name: "Gare du Nord", lat: 48.880337, lon: 2.354979 },
    );
    expect(d).toBeDefined();
    expect(d!).toBeLessThan(150);
    const far = coordinateDistanceMeters(
      { name: "Gare du Nord", lat: 48.880337, lon: 2.354979 },
      { name: "Gare de Lyon", lat: 48.844922, lon: 2.373464 },
    )!;
    expect(far).toBeGreaterThan(3000);
    expect(Number.isInteger(far)).toBe(true);
  });

  it("L. malformed or missing coordinates return undefined", () => {
    expect(
      coordinateDistanceMeters({ name: "A", lat: Number.NaN, lon: 1 }, { name: "B", lat: 2, lon: 3 }),
    ).toBeUndefined();
    expect(
      coordinateDistanceMeters({ name: "A", lat: 999, lon: 1 }, { name: "B", lat: 2, lon: 3 }),
    ).toBeUndefined();
    expect(coordinateDistanceMeters({ name: "A", lat: 1, lon: 2 }, { name: "B" })).toBeUndefined();
    expect(parseCoords("nonsense")).toBeNull();
    expect(parseCoords(undefined)).toBeNull();
    expect(parseCoords("48.8,2.3")).toEqual({ lat: 48.8, lon: 2.3 });
  });
});

describe("station pair fixtures", () => {
  it("are well formed reference data for Phase 2", () => {
    expect(STATION_PAIR_FIXTURES.length).toBeGreaterThanOrEqual(10);
    for (const f of STATION_PAIR_FIXTURES) {
      expect(f.a.name.length).toBeGreaterThan(0);
      expect(f.b.name.length).toBeGreaterThan(0);
      expect(coordinateDistanceMeters(f.a, f.b)).toBeDefined();
    }
  });
});
