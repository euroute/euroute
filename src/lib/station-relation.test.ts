/**
 * Phase 2 relation classifier: table-driven fixture cases plus adversarial
 * over-merge protection. Nothing here touches production transfer behaviour.
 */

import { describe, expect, it } from "vitest";

import {
  classifyStationRelation,
  compareStationNames,
  isInitialismAlias,
  SAME_STATION_METERS,
  WALKABLE_METERS,
} from "./station-relation";
import { STATION_PAIR_FIXTURES } from "./__fixtures__/station-pairs";

/** Observed Phase-2 relation for each audited fixture pair. */
const EXPECTED: Record<string, string> = {
  "Paris-Nord / Gare du Nord": "SAME_COMPLEX",
  "Paris Gare du Nord / Paris Gare de Lyon": "DIFFERENT_STATION",
  // Phase 2B: shared "London" is location context, remaining tokens conflict.
  "London St Pancras / London King's Cross": "UNCERTAIN",
  // Phase 2B: only "Stockholm" is shared; "City" is a different station token.
  "Stockholm C / Stockholm City": "UNCERTAIN",
  "Stockholm C / T-Centralen": "UNCERTAIN",
  "Hamburg Hbf / Hamburg Hauptbahnhof": "SAME_STATION",
  // Phase 2B: SBB vs CFF/FFS are unrelated tokens generically.
  "Basel SBB naming variants": "UNCERTAIN",
  "Wien Hbf / Wien Hauptbahnhof": "SAME_STATION",
  "Roma Termini variants": "SAME_STATION",
  "Firenze S.M.N. / Firenze Santa Maria Novella": "SAME_STATION",
};

describe("classifyStationRelation – fixture table", () => {
  for (const f of STATION_PAIR_FIXTURES) {
    it(f.label, () => {
      const r = classifyStationRelation(f.a, f.b);
      // Reported for auditability: names, coords, distance, normalized names.
      expect({
        a: f.a.name,
        b: f.b.name,
        distance: r.distanceMeters,
        normalized: r.normalizedNames,
        relation: r.relation,
        evidence: r.evidence,
      }).toMatchObject({ relation: EXPECTED[f.label] });
      expect(r.evidence.length).toBeGreaterThan(0);
    });
  }

  it("is symmetric and deterministic", () => {
    for (const f of STATION_PAIR_FIXTURES) {
      expect(classifyStationRelation(f.a, f.b).relation).toBe(
        classifyStationRelation(f.b, f.a).relation,
      );
      expect(classifyStationRelation(f.a, f.b)).toEqual(classifyStationRelation(f.a, f.b));
    }
  });
});

describe("signal priority", () => {
  it("same stopId wins over different display names and coordinates", () => {
    const r = classifyStationRelation(
      { name: "Paris Nord", stopId: "s1", lat: 48.88, lon: 2.35 },
      { name: "Gare du Nord Souterrain", stopId: "s1", lat: 48.9, lon: 2.4 },
    );
    expect(r.relation).toBe("SAME_STATION");
    expect(r.evidence).toContain("same-stop-id");
  });

  it("different stopIds with the same parentId are one complex", () => {
    const r = classifyStationRelation(
      { name: "Paris-Nord", stopId: "a", parentId: "p", lat: 48.8809, lon: 2.3552 },
      { name: "Gare du Nord", stopId: "b", parentId: "p", lat: 48.8803, lon: 2.355 },
    );
    expect(r.relation).toBe("SAME_COMPLEX");
    expect(r.evidence).toContain("same-parent-id");
  });

  it("level values are never used as an identity signal", () => {
    const r = classifyStationRelation(
      { name: "Alpha", lat: 50, lon: 10, level: -1 },
      { name: "Beta", lat: 51, lon: 11, level: -1 },
    );
    expect(r.relation).toBe("DIFFERENT_STATION");
  });
});

describe("threshold boundaries", () => {
  // ~0.0000090 deg latitude ≈ 1 m, used to place points precisely.
  const at = (meters: number) => ({ name: "Alpha Nord", lat: 50 + meters / 111320, lon: 10 });
  const base = { name: "Alpha Nord", lat: 50, lon: 10 };

  it("below, at and above SAME_STATION_METERS", () => {
    expect(classifyStationRelation(base, at(SAME_STATION_METERS - 5)).relation).toBe("SAME_STATION");
    expect(classifyStationRelation(base, at(SAME_STATION_METERS)).relation).toBe("SAME_STATION");
    expect(classifyStationRelation(base, at(SAME_STATION_METERS + 5)).relation).toBe(
      "SAME_COMPLEX",
    );
  });

  it("below, at and above WALKABLE_METERS", () => {
    expect(classifyStationRelation(base, at(WALKABLE_METERS - 5)).relation).toBe("SAME_COMPLEX");
    expect(classifyStationRelation(base, at(WALKABLE_METERS)).relation).toBe("SAME_COMPLEX");
    // Identical names far apart never merge: conflicting evidence.
    expect(classifyStationRelation(base, at(WALKABLE_METERS + 20)).relation).toBe("UNCERTAIN");
  });
});

describe("adversarial: no over-merging", () => {
  it("same normalized name kilometres apart is UNCERTAIN, never SAME", () => {
    const r = classifyStationRelation(
      { name: "Nordby", lat: 50, lon: 10 },
      { name: "Nordby", lat: 50.5, lon: 10.5 },
    );
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.evidence).toContain("conflicting-evidence");
  });

  it("identical names in different countries are not merged", () => {
    const r = classifyStationRelation(
      { name: "Frankfurt Hbf", lat: 50.107, lon: 8.663 },
      { name: "Frankfurt Hauptbahnhof", lat: 52.34, lon: 14.55 },
    );
    expect(["UNCERTAIN"]).toContain(r.relation);
  });

  it("shared city word but different stations stays DIFFERENT_STATION", () => {
    expect(
      classifyStationRelation(
        { name: "Paris Gare de Lyon", lat: 48.8449, lon: 2.3734 },
        { name: "Paris Montparnasse", lat: 48.8414, lon: 2.3209 },
      ).relation,
    ).toBe("DIFFERENT_STATION");
  });

  it("very close coordinates with unrelated names is UNCERTAIN", () => {
    const r = classifyStationRelation(
      { name: "Alpha Kaj", lat: 50, lon: 10 },
      { name: "Beta Torg", lat: 50.0005, lon: 10 },
    );
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.evidence).toContain("conflicting-station-tokens");
  });

  it("walkable distance with unrelated names is UNCERTAIN", () => {
    expect(
      classifyStationRelation(
        { name: "Alpha Kaj", lat: 50, lon: 10 },
        { name: "Beta Torg", lat: 50.004, lon: 10 },
      ).relation,
    ).toBe("UNCERTAIN");
  });

  it("name-only legacy data is UNCERTAIN", () => {
    const same = classifyStationRelation({ name: "Paris-Nord" }, { name: "Gare du Nord" });
    expect(same.relation).toBe("UNCERTAIN");
    expect(same.evidence).toContain("coords-missing");
    expect(classifyStationRelation({ name: "Wien Hbf" }, { name: "Wien Hauptbahnhof" }).relation).toBe(
      "UNCERTAIN",
    );
  });

  it("missing IDs never block classification", () => {
    expect(
      classifyStationRelation({ name: "Wien Hbf", lat: 48.1852, lon: 16.3766 }, { name: "Wien Hauptbahnhof", lat: 48.1852, lon: 16.3766 }).relation,
    ).toBe("SAME_STATION");
  });

  it("conflicting parent and distance evidence is UNCERTAIN", () => {
    const r = classifyStationRelation(
      { name: "Alpha", parentId: "p", lat: 50, lon: 10 },
      { name: "Beta", parentId: "p", lat: 50.2, lon: 10.2 },
    );
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.evidence).toEqual(expect.arrayContaining(["same-parent-id", "conflicting-evidence"]));
  });

  it("malformed coordinates fall back to name-only handling", () => {
    const r = classifyStationRelation(
      { name: "Alpha", lat: Number.NaN, lon: 10 },
      { name: "Alpha", lat: 999, lon: 10 },
    );
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.evidence).toContain("coords-missing");
    const withParent = classifyStationRelation(
      { name: "Alpha", parentId: "p", lat: Number.NaN, lon: 10 },
      { name: "Beta", parentId: "p" },
    );
    expect(withParent.relation).toBe("SAME_COMPLEX");
  });

  it("critical regression: Gare du Nord ↔ Gare de Lyon", () => {
    const r = classifyStationRelation(
      { name: "Paris Gare du Nord", lat: 48.880337, lon: 2.354979 },
      { name: "Paris Gare de Lyon", lat: 48.844922, lon: 2.373464 },
    );
    expect(r.relation).toBe("DIFFERENT_STATION");
    expect(r.distanceMeters!).toBeGreaterThan(WALKABLE_METERS);
  });
});

describe("Phase 2B: shared city/location token is never identity evidence", () => {
  const pair = (nameA: string, nameB: string, meters: number) =>
    classifyStationRelation(
      { name: nameA, lat: 50, lon: 10 },
      { name: nameB, lat: 50 + meters / 111320, lon: 10 },
    );

  it("London Alpha ↔ London Beta at 100 m is not SAME/CONNECTED", () => {
    const r = pair("London Alpha", "London Beta", 100);
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.nameSignal).toBe("CONFLICTING");
    expect(r.evidence).toEqual(
      expect.arrayContaining(["shared-location-token-only", "conflicting-station-tokens"]),
    );
  });

  it("Paris Alpha ↔ Paris Beta at 500 m is not SAME/CONNECTED", () => {
    expect(pair("Paris Alpha", "Paris Beta", 500).relation).toBe("UNCERTAIN");
  });

  it("an invented city name gets the same protection (no city list involved)", () => {
    expect(pair("Zorbistan Alpha", "Zorbistan Beta", 100).relation).toBe("UNCERTAIN");
    expect(pair("Zorbistan Alpha", "Zorbistan Beta", 500).relation).toBe("UNCERTAIN");
  });

  it("real hubs: St Pancras ↔ King's Cross needs more than the word London", () => {
    const r = classifyStationRelation(
      { name: "London St Pancras International", lat: 51.5319, lon: -0.1264 },
      { name: "London King's Cross", lat: 51.5308, lon: -0.1238 },
    );
    expect(r.relation).toBe("UNCERTAIN");
    expect(r.distanceMeters!).toBeLessThan(WALKABLE_METERS);
  });

  it("upstream identity metadata still resolves such pairs", () => {
    const r = classifyStationRelation(
      { name: "London St Pancras International", parentId: "p", lat: 51.5319, lon: -0.1264 },
      { name: "London King's Cross", parentId: "p", lat: 51.5308, lon: -0.1238 },
    );
    expect(r.relation).toBe("SAME_COMPLEX");
  });

  it("proximity alone never creates a positive relation", () => {
    for (const meters of [5, 50, 100, 149, 300, 700]) {
      expect(pair("Alpha Kaj", "Beta Torg", meters).relation).toBe("UNCERTAIN");
      expect(pair("Metropolis Alpha", "Metropolis Beta", meters).relation).toBe("UNCERTAIN");
    }
  });

  it("a shared non-leading station token still supports identity", () => {
    const r = classifyStationRelation(
      { name: "Paris-Nord", lat: 48.880959, lon: 2.35519 },
      { name: "Gare du Nord", lat: 48.880337, lon: 2.354979 },
    );
    expect(r.relation).toBe("SAME_COMPLEX");
    expect(r.nameSignal).toBe("SUPPORTING");
  });
});

describe("Phase 2B: generic abbreviation support", () => {
  it("Hbf ↔ Hauptbahnhof is generic station vocabulary, not a city rule", () => {
    for (const city of ["Hamburg", "Wien", "Zorbistan"]) {
      const r = classifyStationRelation(
        { name: `${city} Hbf`, lat: 50, lon: 10 },
        { name: `${city} Hauptbahnhof`, lat: 50, lon: 10 },
      );
      expect(r.relation).toBe("SAME_STATION");
      expect(r.nameSignal).toBe("STRONG");
    }
  });

  it("initialism aliases are positional, with no station-specific mapping", () => {
    expect(isInitialismAlias(["s", "m", "n"], ["santa", "maria", "novella"])).toBe(true);
    expect(isInitialismAlias(["smn"], ["santa", "maria", "novella"])).toBe(true);
    expect(isInitialismAlias(["a", "b"], ["alpha", "beta"])).toBe(true);
    // Not an initialism: different letters, or full words.
    expect(isInitialismAlias(["x", "y", "z"], ["santa", "maria", "novella"])).toBe(false);
    expect(isInitialismAlias(["kings", "cross"], ["pancras"])).toBe(false);
    expect(isInitialismAlias(["sbb"], ["cff", "ffs"])).toBe(false);
  });

  it("Firenze S.M.N. resolves through the initialism mechanism, not proximity", () => {
    const r = classifyStationRelation(
      { name: "Firenze S.M.N.", lat: 43.7765, lon: 11.248 },
      { name: "FIRENZE S.MARIA NOVELLA", lat: 43.7765, lon: 11.248 },
    );
    expect(r.relation).toBe("SAME_STATION");
    expect(r.evidence).toContain("abbreviation-alias");
    // Same names without coordinates: still no proximity involved in the signal.
    expect(
      compareStationNames("Firenze S.M.N.", "FIRENZE S.MARIA NOVELLA").strength,
    ).toBe("STRONG");
  });

  it("operator suffixes (SBB / CFF / FFS) are not treated as aliases", () => {
    const r = classifyStationRelation(
      { name: "Basel SBB", lat: 47.5474, lon: 7.5896 },
      { name: "Basel CFF/FFS", lat: 47.5474, lon: 7.5896 },
    );
    expect(r.relation).toBe("UNCERTAIN");
  });
});
