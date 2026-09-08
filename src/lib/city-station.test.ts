import { describe, expect, it } from "vitest";
import { CITY_STOPS_FIXTURES } from "./__fixtures__/city-stops";
import {
  CITY_RADIUS_M,
  boundingBox,
  resolveCityStations,
  stationMergeKey,
} from "./city-station";
import { distanceMeters, type GeocodeHitLike } from "./station-classify";

const resolve = (key: string) => {
  const fixture = CITY_STOPS_FIXTURES[key]!;
  return resolveCityStations(fixture.city, fixture.stops);
};

const primaryName = (key: string) => resolve(key).primary!.hit.name;
const siblingNames = (key: string) => resolve(key).siblings.map((s) => s.hit.name);
const allNames = (key: string) => [primaryName(key), ...siblingNames(key)];

describe("resolveCityStations — primary station per city", () => {
  const expected: Record<string, string> = {
    Roma: "ROMA TERMINI",
    Wien: "Wien Hauptbahnhof",
    Stockholm: "Stockholm Centralstation",
    Hamburg: "Hamburg Hbf",
    Basel: "Basel SBB",
    Firenze: "FIRENZE S.MARIA NOVELLA",
  };

  for (const [city, station] of Object.entries(expected)) {
    it(`${city} resolves to ${station}`, () => {
      expect(primaryName(city)).toBe(station);
    });
  }

  it("London resolves to a central long-distance terminal", () => {
    expect(primaryName("London")).toMatch(/^London (Euston|Kings Cross|St Pancras|Paddington)/);
  });

  it("Paris resolves to a mainline terminal", () => {
    expect(primaryName("Paris")).toMatch(/^Paris/);
  });
});

describe("resolveCityStations — sibling stations", () => {
  it("London exposes the other mainline terminals", () => {
    const names = allNames("London").join("|");
    expect(names).toMatch(/Kings Cross/);
    expect(names).toMatch(/St Pancras/);
    expect(names).toMatch(/Paddington/);
  });

  it("Paris exposes Nord, Est and Montparnasse alongside the primary", () => {
    const names = allNames("Paris").join("|");
    expect(names).toMatch(/Nord/);
    expect(names).toMatch(/Est/);
    expect(names).toMatch(/Montparnasse/);
  });

  it("Roma exposes Tiburtina, Firenze exposes Campo Marte", () => {
    expect(allNames("Roma").join("|")).toMatch(/TIBURTINA/);
    expect(allNames("Firenze").join("|")).toMatch(/CAMPO MARTE/i);
  });

  it("Wien exposes Westbahnhof and Meidling", () => {
    const names = allNames("Wien").join("|");
    expect(names).toMatch(/Westbahnhof/);
    expect(names).toMatch(/Meidling/);
  });

  it("siblings are intercity-capable and never exceed the cap", () => {
    for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
      const { siblings } = resolve(city);
      expect(siblings.length).toBeLessThanOrEqual(5);
      for (const sibling of siblings) expect(sibling.intercity).toBe(true);
    }
  });

  it("siblings are ranked below the primary and above the relevance floor", () => {
    for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
      const { primary, siblings } = resolve(city);
      for (const sibling of siblings) {
        expect(sibling.score).toBeLessThanOrEqual(primary!.score);
        expect(sibling.score).toBeGreaterThanOrEqual(primary!.score * 0.12);
      }
    }
  });
});

describe("resolveCityStations — guards and determinism", () => {
  it("never returns a station outside the radius guard", () => {
    for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
      const { primary, siblings } = resolve(city);
      for (const candidate of [primary!, ...siblings]) {
        expect(candidate.distanceMeters).toBeLessThanOrEqual(CITY_RADIUS_M);
      }
    }
  });

  it("returns no station when nothing rail-capable is nearby", () => {
    const city: GeocodeHitLike = { type: "PLACE", name: "Nowhere", lat: 0, lon: 0, country: "XX" };
    expect(resolveCityStations(city, []).primary).toBeNull();

    const farAway: GeocodeHitLike = {
      type: "STOP",
      name: "Far Hbf",
      lat: 1,
      lon: 1,
      modes: ["LONG_DISTANCE"],
    };
    expect(resolveCityStations(city, [farAway]).primary).toBeNull();
  });

  it("ignores local-transit-only stops", () => {
    const city: GeocodeHitLike = { type: "PLACE", name: "Metroville", lat: 50, lon: 10 };
    const metro: GeocodeHitLike = {
      type: "STOP",
      name: "Metroville Centrum",
      lat: 50.001,
      lon: 10.001,
      modes: ["SUBWAY", "TRAM", "BUS"],
    };
    expect(resolveCityStations(city, [metro]).primary).toBeNull();
  });

  it("is deterministic across repeated resolutions", () => {
    for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
      expect(allNames(city)).toEqual(allNames(city));
    }
  });

  it("returns no duplicated station complex", () => {
    for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
      const { primary, siblings } = resolve(city);
      const kept = [primary!, ...siblings];
      for (let i = 0; i < kept.length; i += 1) {
        for (let j = i + 1; j < kept.length; j += 1) {
          const a = kept[i]!.hit;
          const b = kept[j]!.hit;
          const sameKey = stationMergeKey(a.name) === stationMergeKey(b.name);
          expect(sameKey && distanceMeters(a, b) <= 2_000).toBe(false);
          expect(distanceMeters(a, b)).toBeGreaterThan(120);
        }
      }
    }
  });
});

describe("boundingBox", () => {
  it("brackets the city centre symmetrically", () => {
    const box = boundingBox(59.3251, 18.0711, 15_000);
    const [minLat, minLon] = box.min.split(",").map(Number) as [number, number];
    const [maxLat, maxLon] = box.max.split(",").map(Number) as [number, number];
    expect(minLat).toBeLessThan(59.3251);
    expect(maxLat).toBeGreaterThan(59.3251);
    expect(minLon).toBeLessThan(18.0711);
    expect(maxLon).toBeGreaterThan(18.0711);
    expect(distanceMeters({ lat: minLat, lon: 18.0711 }, { lat: 59.3251, lon: 18.0711 })).toBeCloseTo(
      15_000,
      -2,
    );
  });

  it("widens longitude span towards the poles", () => {
    const south = boundingBox(41.9, 12.48);
    const north = boundingBox(59.33, 18.07);
    const span = (box: { min: string; max: string }) =>
      Number(box.max.split(",")[1]) - Number(box.min.split(",")[1]);
    expect(span(north)).toBeGreaterThan(span(south));
  });
});

describe("stationMergeKey", () => {
  it("ignores operator and country qualifiers", () => {
    expect(stationMergeKey("Wien HBF (AT)")).toBe(stationMergeKey("Wien Hauptbahnhof"));
    expect(stationMergeKey("Basel Bad Bf (FlixTrain)")).toBe(stationMergeKey("Basel Bad Bf"));
  });

  it("ignores hall and platform suffixes", () => {
    expect(stationMergeKey("Paris Gare de Lyon Hall 1 - 2")).toBe(
      stationMergeKey("Paris Gare de Lyon"),
    );
  });

  it("keeps genuinely different stations apart", () => {
    expect(stationMergeKey("ROMA TERMINI")).not.toBe(stationMergeKey("ROMA TIBURTINA"));
  });
});
