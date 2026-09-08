// Phase 3C: deterministic round-trip tests for city/station intent and stop id
// in the /sok URL. No network, no timetable calls.

import { describe, expect, it } from "vitest";

import { MAX_STOP_ID_LENGTH, type Place } from "./journey";
import {
  encodeEndpoint,
  encodeViaList,
  parseIntentParam,
  parseStopIdParam,
  parseViaList,
  placeFromParams,
  stringList,
} from "./search-endpoints";

const LONDON_CITY: Place = { name: "London", place: "51.5074,-0.1278", intent: "city" };
const EUSTON: Place = {
  name: "London Euston",
  place: "51.5282,-0.1337",
  intent: "station",
  stopId: "de-DELFI_de:nvbw:..:.._London-Euston:0:1",
};

/** Mirrors what the browser does with a search object. */
function roundTrip(params: Record<string, string | string[]>) {
  const url = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => url.append(key, v));
    else url.set(key, value);
  }
  const parsed = new URLSearchParams(url.toString());
  return parsed;
}

describe("intent + stop id encoding", () => {
  it("A. serializes city intent", () => {
    const e = encodeEndpoint(LONDON_CITY);
    expect(e).toEqual({ value: "London|51.5074,-0.1278", intent: "city", id: "" });
  });

  it("B. parses city intent back from the URL", () => {
    const e = encodeEndpoint(LONDON_CITY);
    const url = roundTrip({ from: e.value, fromIntent: e.intent, fromId: e.id });
    const place = placeFromParams(
      url.get("from") ?? undefined,
      url.get("fromIntent"),
      url.get("fromId"),
    );
    expect(place).toEqual({ name: "London", place: "51.5074,-0.1278", intent: "city" });
  });

  it("C+D. serializes station intent with its stop id", () => {
    const e = encodeEndpoint(EUSTON);
    expect(e.intent).toBe("station");
    expect(e.id).toBe(EUSTON.stopId);
  });

  it("E. stop id round-trips byte-for-byte through URL encoding", () => {
    const e = encodeEndpoint(EUSTON);
    const url = roundTrip({ to: e.value, toIntent: e.intent, toId: e.id });
    expect(url.toString()).not.toContain(":..:");
    const place = placeFromParams(url.get("to") ?? undefined, url.get("toIntent"), url.get("toId"));
    expect(place?.stopId).toBe(EUSTON.stopId);
    expect(place?.intent).toBe("station");
  });

  it("F. legacy URL without the new fields stays valid and intent-free", () => {
    const place = placeFromParams("Berlin Hbf|52.5250,13.3694", undefined, undefined);
    expect(place).toEqual({ name: "Berlin Hbf", place: "52.5250,13.3694" });
    expect(place?.intent).toBeUndefined();
  });

  it("G. ignores unknown intent values safely", () => {
    expect(parseIntentParam("banana")).toBeUndefined();
    const place = placeFromParams("London|51.5074,-0.1278", "banana", "x:1");
    expect(place?.intent).toBeUndefined();
    expect(place?.place).toBe("51.5074,-0.1278");
  });

  it("H. rejects oversized or empty stop ids safely", () => {
    expect(parseStopIdParam("x".repeat(MAX_STOP_ID_LENGTH + 1))).toBeUndefined();
    expect(parseStopIdParam("")).toBeUndefined();
    expect(parseStopIdParam("x".repeat(MAX_STOP_ID_LENGTH))).toHaveLength(MAX_STOP_ID_LENGTH);
    const place = placeFromParams(
      "London Euston|51.5282,-0.1337",
      "station",
      "x".repeat(MAX_STOP_ID_LENGTH + 1),
    );
    expect(place).toEqual({
      name: "London Euston",
      place: "51.5282,-0.1337",
      intent: "station",
    });
  });

  it("I. city intent wins when a stray stop id is present", () => {
    const place = placeFromParams("London|51.5074,-0.1278", "city", "some:stop:id");
    expect(place?.intent).toBe("city");
    expect(place?.stopId).toBeUndefined();
  });

  it("J. station without stop id keeps station intent and coordinates", () => {
    const place = placeFromParams("Firenze S.M.N.|43.7764,11.2480", "station", "");
    expect(place).toEqual({
      name: "Firenze S.M.N.",
      place: "43.7764,11.2480",
      intent: "station",
    });
  });

  it("K. via stop ids round-trip in order", () => {
    const encoded = encodeViaList([EUSTON, LONDON_CITY]);
    const url = roundTrip({
      via: encoded.via,
      viaIntent: encoded.viaIntent,
      viaId: encoded.viaId,
    });
    const parsed = parseViaList(
      url.getAll("via"),
      url.getAll("viaIntent"),
      url.getAll("viaId"),
    );
    expect(parsed[0]?.stopId).toBe(EUSTON.stopId);
    expect(parsed[0]?.intent).toBe("station");
    expect(parsed[1]?.intent).toBe("city");
  });

  it("stringList normalises single values, arrays and empties", () => {
    expect(stringList(undefined)).toEqual([]);
    expect(stringList("a")).toEqual(["a"]);
    expect(stringList(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("search state reproducibility", () => {
  it("L. Edit Search keeps the city labels the traveller typed", () => {
    const e = encodeEndpoint(LONDON_CITY);
    const back = placeFromParams(e.value, e.intent, e.id);
    expect(back?.name).toBe("London");
    expect(back?.name).not.toContain("Euston");
  });

  it("M. Edit Search keeps explicit station labels", () => {
    const e = encodeEndpoint(EUSTON);
    expect(placeFromParams(e.value, e.intent, e.id)?.name).toBe("London Euston");
  });

  it("N. Back/Forward: each URL state parses independently of the other", () => {
    const a = encodeEndpoint(LONDON_CITY);
    const b = encodeEndpoint(EUSTON);
    const stateA = placeFromParams(a.value, a.intent, a.id);
    const stateB = placeFromParams(b.value, b.intent, b.id);
    expect(stateA?.intent).toBe("city");
    expect(stateB?.intent).toBe("station");
    // Re-parsing the earlier URL must not inherit anything from the later one.
    expect(placeFromParams(a.value, a.intent, a.id)).toEqual(stateA);
  });

  it("O+P. a copied city URL still means city routing in a fresh session", () => {
    const from = encodeEndpoint(LONDON_CITY);
    const to = encodeEndpoint({ name: "Firenze", place: "43.7696,11.2558", intent: "city" });
    const url = `/sok?${new URLSearchParams({
      from: from.value,
      fromIntent: from.intent,
      fromId: from.id,
      to: to.value,
      toIntent: to.intent,
      toId: to.id,
      depart: "2026-09-01T06:00:00.000Z",
    }).toString()}`;
    const q = new URLSearchParams(url.slice(url.indexOf("?") + 1));
    const parsedFrom = placeFromParams(q.get("from") ?? undefined, q.get("fromIntent"), q.get("fromId"));
    const parsedTo = placeFromParams(q.get("to") ?? undefined, q.get("toIntent"), q.get("toId"));
    expect(parsedFrom?.intent).toBe("city");
    expect(parsedTo?.intent).toBe("city");
    expect(parsedFrom?.stopId).toBeUndefined();
    expect(q.get("depart")).toBe("2026-09-01T06:00:00.000Z");
  });

  it("Q. explicit Euston stays exact after parsing", () => {
    const e = encodeEndpoint(EUSTON);
    const place = placeFromParams(e.value, e.intent, e.id);
    expect(place?.intent).toBe("station");
    expect(place?.stopId).toBe(EUSTON.stopId);
  });

  it("R. a stale URL stop id still reaches routing so the coordinate fallback can run", () => {
    const place = placeFromParams("London Euston|51.5282,-0.1337", "station", "stale:unknown:id");
    expect(place?.stopId).toBe("stale:unknown:id");
    expect(place?.place).toBe("51.5282,-0.1337");
  });
});
