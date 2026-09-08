import { describe, expect, it } from "vitest";
import { GEOCODE_FIXTURES } from "./__fixtures__/geocode";
import {
  classifyHit,
  isSamePhysicalStation,
  normalizeStationName,
  selectCandidates,
  type GeocodeHitLike,
} from "./station-classify";

const names = (city: string) =>
  selectCandidates(GEOCODE_FIXTURES[city]!).map((c) => c.hit.name);

const kinds = (city: string) =>
  new Map(selectCandidates(GEOCODE_FIXTURES[city]!).map((c) => [c.hit.name, c.kind]));

const hitsOf = (city: string) => GEOCODE_FIXTURES[city]!;
const find = (city: string, name: string) => hitsOf(city).find((h) => h.name === name)!;

describe("classifyHit", () => {
  it("A. classifies rail stops as rail stations", () => {
    expect(classifyHit(find("Hamburg", "Hamburg Hbf")).kind).toBe("rail_station");
    expect(classifyHit(find("Basel", "BASEL SBB")).kind).toBe("rail_station");
  });

  it("B/I. mixed rail + subway stays a rail station", () => {
    const londonBridge = classifyHit(find("London", "London Bridge"));
    expect(londonBridge.kind).toBe("rail_station");
    expect(londonBridge.railModes).toContain("REGIONAL_RAIL");
  });

  it("B. subway-only stops are local transit", () => {
    expect(classifyHit(find("Wien", "Wien Krieau")).kind).toBe("local_transit");
  });

  it("C. tram-only stops are local transit", () => {
    expect(classifyHit(find("Basel", "Basel, Zoo")).kind).toBe("local_transit");
  });

  it("D. bus/coach-only stops are local transit", () => {
    const coach = hitsOf("Basel").find((h) => h.type === "STOP" && h.modes?.join() === "COACH")!;
    expect(classifyHit(coach).kind).toBe("local_transit");
    expect(classifyHit(find("Wien", "Wien Kagran")).kind).toBe("local_transit");
  });

  it("E. ferry-only stops are local transit", () => {
    const ferry = hitsOf("Stockholm").find((h) => h.modes?.length === 1 && h.modes[0] === "FERRY")!;
    expect(classifyHit(ferry).kind).toBe("local_transit");
  });

  it("F. city PLACE results are cities", () => {
    expect(classifyHit(find("Roma", "Roma")).kind).toBe("city");
  });

  it("ADDRESS results are irrelevant", () => {
    const address: GeocodeHitLike = { type: "ADDRESS", name: "Bahnhofstr. 1", lat: 1, lon: 1 };
    expect(classifyHit(address).kind).toBe("irrelevant");
  });
});

describe("selectCandidates — regression cities", () => {
  it("London keeps rail terminals and the city, drops bus-only noise", () => {
    const out = names("London");
    expect(out).toContain("London Bridge");
    expect(out).toContain("London Euston");
    expect(out).toContain("London");
    // Serbian bus stop named "London" and other bus-only stops are gone
    expect(kinds("London").get("London")).toBe("city");
    expect(kinds("London").get("London")).toBe("city");
  });

  it("H. same-name foreign cities are suppressed to the most relevant one", () => {
    const londonCities = selectCandidates(hitsOf("London")).filter((c) => c.kind === "city");
    expect(londonCities).toHaveLength(1);
    expect(londonCities[0]!.hit.country).toBe("GB");

    const parisCities = selectCandidates(hitsOf("Paris")).filter((c) => c.kind === "city");
    expect(parisCities).toHaveLength(1);
    expect(parisCities[0]!.hit.country).toBe("FR");

    const romaCities = selectCandidates(hitsOf("Roma")).filter((c) => c.kind === "city");
    expect(romaCities).toHaveLength(1);
    expect(romaCities[0]!.hit.country).toBe("IT");
  });

  it("Paris keeps high-speed terminals first", () => {
    const out = names("Paris");
    expect(out.slice(0, 2).sort()).toEqual(["Paris Est", "Paris-Nord"]);
    expect(out.some((n) => n.startsWith("Paris ,"))).toBe(false);
  });

  it("Wien keeps Hbf, removes Kagran", () => {
    const out = names("Wien");
    expect(out).toContain("Wien Hbf");
    expect(out).not.toContain("Wien Kagran");
    expect(out[0]).toBe("Wien Hbf");
  });

  it("Roma returns metro-free results (city PLACE expected in phase 1)", () => {
    const out = names("Roma");
    expect(out).toContain("Roma");
    expect(out).not.toContain("RE DI ROMA");
    expect(kinds("Roma").get("Roma")).toBe("city");
  });

  it("Firenze keeps S.M.N. and the main long-distance stations", () => {
    const out = names("Firenze");
    expect(out).toContain("Firenze Smn");
    expect(out).toContain("FIRENZE CAMPO MARTE");
    // bus-only and mode-less FIRENZE entries are dropped
    expect(out.filter((n) => n === "FIRENZE")).toHaveLength(0);
  });

  it("Hamburg keeps Hbf and drops bus-only noise", () => {
    const out = names("Hamburg");
    expect(out[0]).toBe("Hamburg Hbf");
    expect(out).not.toContain("Studio Hamburg");
  });

  it("Stockholm keeps Centralstation, drops ferry/tram/bus-only stops", () => {
    const out = names("Stockholm");
    expect(out).toContain("Stockholm Centralstation");
    expect(out).not.toContain("Stockholm Luma");
    expect(out.filter((n) => n === "Stockholm")).toHaveLength(1);
    expect(kinds("Stockholm").get("Stockholm")).toBe("city");
    expect(names("Stockholm")[0]).toBe("Stockholm Centralstation");
  });

  it("Basel keeps SBB first and drops tram/coach-only stops", () => {
    const out = names("Basel");
    expect(out[0]).toBe("BASEL SBB");
    expect(out).toContain("Basel Bad Bf");
    expect(out.some((n) => n.startsWith("Basel, "))).toBe(false);
  });

  it("cities never crowd rail stations out of the cap", () => {
    for (const city of Object.keys(GEOCODE_FIXTURES)) {
      const picked = selectCandidates(GEOCODE_FIXTURES[city]!);
      const stationsAvailable = GEOCODE_FIXTURES[city]!.filter(
        (h) => classifyHit(h).kind === "rail_station",
      ).length;
      const stationsPicked = picked.filter((c) => c.kind === "rail_station").length;
      expect(stationsPicked).toBe(Math.min(stationsAvailable, 10));
    }
  });
});

describe("G. duplicate merging", () => {
  const base = { type: "STOP", country: "DE", modes: ["LONG_DISTANCE"], score: -18 };

  it("merges two feed entries for the same physical station", () => {
    const hits: GeocodeHitLike[] = [
      { ...base, name: "Hamburg Hbf", lat: 53.552736, lon: 10.006909, importance: 0.4 },
      { ...base, name: "Hamburg Hauptbahnhof", lat: 53.5528, lon: 10.0071, importance: 0.9 },
    ];
    const out = selectCandidates(hits);
    expect(out).toHaveLength(1);
  });

  it("does not merge distinct stations in the same city", () => {
    const hits: GeocodeHitLike[] = [
      { ...base, name: "Hamburg Hbf", lat: 53.552736, lon: 10.006909 },
      { ...base, name: "Hamburg-Altona", lat: 53.552, lon: 9.935 },
    ];
    expect(selectCandidates(hits)).toHaveLength(2);
  });

  it("does not merge same-named stations far apart", () => {
    const hits: GeocodeHitLike[] = [
      { ...base, name: "Nord", lat: 48.88, lon: 2.35 },
      { ...base, name: "Nord", lat: 45.46, lon: 9.19 },
    ];
    expect(selectCandidates(hits)).toHaveLength(2);
  });

  it("normalizes station suffixes conservatively", () => {
    expect(normalizeStationName("Hamburg Hbf")).toBe(normalizeStationName("Hamburg Hauptbahnhof"));
    expect(normalizeStationName("Roma Termini")).not.toBe(normalizeStationName("Roma Tiburtina"));
    expect(
      isSamePhysicalStation(
        { type: "STOP", name: "Basel SBB", lat: 47.547, lon: 7.589, country: "CH" },
        { type: "STOP", name: "BASEL SBB", lat: 47.5475, lon: 7.5895, country: "CH" },
      ),
    ).toBe(true);
  });
});
