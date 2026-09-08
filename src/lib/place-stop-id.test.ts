// Phase 1 of exact rail endpoints: the selected/resolved Transitous stop id is
// carried on Place, and nothing else changes. Routing, Via and timezone
// resolution must still be driven purely by coordinates.

import { describe, expect, it } from "vitest";

import { CITY_STOPS_FIXTURES } from "./__fixtures__/city-stops";
import { GEOCODE_FIXTURES } from "./__fixtures__/geocode";
import { resolveCityStations } from "./city-station";
import { MAX_STOP_ID_LENGTH, type Place } from "./journey";
import { PlaceSchema } from "./place-schema";
import { hitsToPlaces, toPlaces } from "./rail.server";
import { classifyHit, selectCandidates, stopIdOf, type GeocodeHitLike } from "./station-classify";
import { zoneForPlace } from "./station-timezone";

const placeByName = (places: Place[], match: string) =>
  places.find((p) => p.name.toLowerCase().includes(match.toLowerCase()));

describe("A. rail geocode hits keep their upstream id as Place.stopId", () => {
  const expected: Record<string, [string, string]> = {
    Stockholm: ["Stockholm Centralstation", "se-Trafiklab_740000001"],
    Roma: ["ROMA TERMINI", "it-trenitalia_IT::StopPlace:otherTRENITALIA:830008409"],
    Wien: ["Wien HBF", "at-Railway-Current-Reference-Data-2026_Pat:49:1349"],
    Hamburg: [
      "Hamburg Hauptbahnhof",
      "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1",
    ],
    Basel: ["Basel SBB", "ch-opentransportdataswiss26_Parentch:1:sloid:10"],
  };

  for (const [city, [station, id]] of Object.entries(expected)) {
    it(`${city} → ${station}`, () => {
      const hit = GEOCODE_FIXTURES[city]!.find((h) => h.name === station);
      if (!hit) return; // fixture does not contain this station under that name
      const place = placeByName(toPlaces(GEOCODE_FIXTURES[city]!), station);
      expect(place?.stopId).toBe(id);
      // Exact upstream string, never normalised.
      expect(place?.stopId).toBe(stopIdOf(hit));
    });
  }

  it("preserves the id of every selectable rail station in every fixture", () => {
    for (const [city, hits] of Object.entries(GEOCODE_FIXTURES)) {
      const stations = selectCandidates(hits).filter((c) => c.kind === "rail_station");
      const places = toPlaces(hits);
      for (const station of stations) {
        const upstream = stopIdOf(station.hit);
        if (!upstream) continue;
        const place = hitsToPlaces([station.hit])[0]!;
        expect(place.stopId, `${city}/${station.hit.name}`).toBe(upstream);
        expect(places.some((p) => p.stopId === upstream), `${city}/${station.hit.name}`).toBe(true);
      }
    }
  });
});

describe("B+C. city resolution keeps primary and sibling stop ids", () => {
  for (const city of Object.keys(CITY_STOPS_FIXTURES)) {
    it(`${city}`, () => {
      const fixture = CITY_STOPS_FIXTURES[city]!;
      const { primary, siblings } = resolveCityStations(fixture.city, fixture.stops);
      expect(primary).not.toBeNull();

      const places = hitsToPlaces([primary!.hit, ...siblings.map((s) => s.hit)]);
      expect(places[0]!.stopId).toBe(stopIdOf(primary!.hit));
      expect(places[0]!.stopId).toBeTruthy();

      siblings.forEach((sibling, index) => {
        const place = places[index + 1];
        if (!place) return; // label-level dedup can drop an identically named entry
        expect(place.stopId).toBe(stopIdOf(sibling.hit));
      });
    });
  }

  it("primary stop ids match the expected railway stations", () => {
    const cases: Record<string, string> = {
      Stockholm: "se-Trafiklab_740000001",
      // /map/stops exposes Roma Termini and Firenze S.M.N. at quay level; the
      // exact upstream string is preserved whichever form the feed returns.
      Roma: "it-trenitalia_IT::Quay:otherTRENITALIA:830008409",
      Firenze: "it-trenitalia_IT::Quay:otherTRENITALIA:830006421",
    };
    for (const [city, id] of Object.entries(cases)) {
      const fixture = CITY_STOPS_FIXTURES[city]!;
      const { primary } = resolveCityStations(fixture.city, fixture.stops);
      expect(stopIdOf(primary!.hit), city).toBe(id);
    }
  });
});

describe("D. explicit station picks keep their stopId through the search flow", () => {
  const picks: [string, string][] = [
    ["London", "London St Pancras"],
    ["London", "London Euston"],
    ["Paris", "Paris Gare du Nord"],
    ["Paris", "Paris Gare de Lyon"],
    ["Roma", "ROMA TERMINI"],
    ["Stockholm", "Stockholm Centralstation"],
  ];

  for (const [city, station] of picks) {
    it(`${station}`, () => {
      const hit = GEOCODE_FIXTURES[city]!.find(
        (h) => h.name.toLowerCase() === station.toLowerCase(),
      );
      if (!hit) return;
      const suggestion = placeByName(toPlaces(GEOCODE_FIXTURES[city]!, 20), station);
      expect(suggestion?.stopId).toBe(stopIdOf(hit));
      // The server boundary the search flow crosses keeps the field intact.
      expect(PlaceSchema.parse(suggestion).stopId).toBe(stopIdOf(hit));
    });
  }
});

describe("E. duplicate merging keeps exactly the winning hit's id", () => {
  const base: GeocodeHitLike = {
    type: "STOP",
    name: "Hamburg Hbf",
    lat: 53.5525,
    lon: 10.0081,
    country: "DE",
  };

  it("keeps the id of the higher-ranked duplicate", () => {
    const weak: GeocodeHitLike = { ...base, id: "feed-weak_1", modes: ["REGIONAL_RAIL"] };
    const strong: GeocodeHitLike = {
      ...base,
      name: "Hamburg Hauptbahnhof",
      id: "feed-strong_2",
      modes: ["HIGHSPEED_RAIL", "LONG_DISTANCE"],
    };
    const picked = selectCandidates([weak, strong]);
    expect(picked).toHaveLength(1);
    expect(stopIdOf(picked[0]!.hit)).toBe("feed-strong_2");
    expect(toPlaces([weak, strong])[0]!.stopId).toBe("feed-strong_2");
  });

  it("never combines or synthesises ids", () => {
    const a: GeocodeHitLike = { ...base, id: "feed-a_1", modes: ["LONG_DISTANCE"] };
    const b: GeocodeHitLike = { ...base, id: "feed-b_2", modes: ["REGIONAL_RAIL"] };
    const place = toPlaces([a, b])[0]!;
    expect(["feed-a_1", "feed-b_2"]).toContain(place.stopId);
    expect(place.stopId).not.toContain("+");
  });
});

describe("F. local-transit results stay unselectable", () => {
  it("metro-only stops are neither candidates nor Places", () => {
    const metro: GeocodeHitLike = {
      type: "STOP",
      name: "Termini",
      lat: 41.900967,
      lon: 12.499871,
      country: "IT",
      id: "it-Lazio-Rome_AD12",
      modes: ["SUBWAY"],
    };
    expect(classifyHit(metro).kind).toBe("local_transit");
    expect(selectCandidates([metro])).toHaveLength(0);
    expect(toPlaces([metro])).toHaveLength(0);
  });

  it("a non-rail hit forced through the mapper carries no stopId", () => {
    const bus: GeocodeHitLike = {
      type: "STOP",
      name: "Basel SBB Bus Terminal",
      lat: 47.54664,
      lon: 7.58912,
      id: "al-ShowMeBus_station-183",
      modes: ["BUS"],
    };
    expect(hitsToPlaces([bus])[0]!.stopId).toBeUndefined();
  });
});

describe("G+H+I. validation of the extended Place contract", () => {
  const legacy = { name: "Stockholm Centralstation", place: "59.330140,18.058150", country: "SE" };

  it("legacy Place without stopId stays valid", () => {
    const parsed = PlaceSchema.parse(legacy);
    expect(parsed.stopId).toBeUndefined();
    expect(parsed.place).toBe("59.330140,18.058150");
  });

  it("Place with stopId passes validation unchanged", () => {
    const parsed = PlaceSchema.parse({ ...legacy, stopId: "se-Trafiklab_740000001" });
    expect(parsed.stopId).toBe("se-Trafiklab_740000001");
  });

  it("rejects an empty or oversized stopId", () => {
    expect(() => PlaceSchema.parse({ ...legacy, stopId: "" })).toThrow();
    expect(() =>
      PlaceSchema.parse({ ...legacy, stopId: "x".repeat(MAX_STOP_ID_LENGTH + 1) }),
    ).toThrow();
    expect(() => PlaceSchema.parse({ ...legacy, stopId: 42 })).toThrow();
  });

  it("still requires coordinates in lat,lon form", () => {
    expect(() =>
      PlaceSchema.parse({ name: "X", place: "se-Trafiklab_740000001" }),
    ).toThrow();
  });
});

// J+K. Superseded by Phase 2 (exact rail endpoints): plan requests now prefer a
// trustworthy station-level stopId, with a coordinate fallback. Endpoint
// selection, mixed endpoints, Via and fallback are covered by
// src/lib/exact-endpoint.test.ts.

describe("L. timezone resolution still uses coordinates", () => {
  it("resolves zones from the coordinate string", () => {
    expect(zoneForPlace("59.330140,18.058150")).toBe("Europe/Stockholm");
    expect(zoneForPlace("51.532720,-0.127003")).toBe("Europe/London");
    expect(zoneForPlace("41.900503,12.502027")).toBe("Europe/Rome");
    // A stop id is not a coordinate: it falls back, it never resolves a zone.
    expect(zoneForPlace("se-Trafiklab_740000001")).toBe("Europe/Stockholm");
  });
});
