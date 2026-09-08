/**
 * Server-boundary contract for requested overnight stops.
 *
 * The overnight server function used to declare its own Place schema, which
 * silently dropped `intent` and `stopId` (Zod strips unknown keys). That turned
 * every requested city/station into a coordinate-only search and produced false
 * "unavailable" results. These tests pin the shared contract instead.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { translate } from "./i18n";
import { PlaceSchema } from "./place-schema";

const HAMBURG_STOP_ID = "at-Railway-Current-Reference-Data-2026_de:02000:10950:11:1";

describe("overnight server-function place contract", () => {
  it("uses the shared PlaceSchema and defines no duplicate schema", () => {
    const source = readFileSync("src/lib/overnight.functions.ts", "utf8");
    expect(source).toContain('from "./place-schema"');
    expect(source).not.toMatch(/const PlaceSchema = z\.object/);
  });

  it("preserves city intent", () => {
    const parsed = PlaceSchema.parse({
      name: "Bologna, Italy",
      place: "44.494,11.343",
      country: "IT",
      intent: "city",
    });
    expect(parsed.intent).toBe("city");
    expect(parsed.country).toBe("IT");
    expect(parsed.place).toBe("44.494,11.343");
  });

  it("preserves station intent and the exact stopId byte-for-byte", () => {
    const parsed = PlaceSchema.parse({
      name: "Hamburg Hbf, Germany",
      place: "53.552475,10.008095",
      country: "DE",
      intent: "station",
      stopId: HAMBURG_STOP_ID,
    });
    expect(parsed.intent).toBe("station");
    expect(parsed.stopId).toBe(HAMBURG_STOP_ID);
  });

  it("still accepts legacy payloads without intent or stopId", () => {
    const parsed = PlaceSchema.parse({ name: "Basel", place: "47.547,7.589", country: "CH" });
    expect(parsed.intent).toBeUndefined();
    expect(parsed.stopId).toBeUndefined();
  });

  it("rejects an empty stopId and an unknown intent", () => {
    expect(PlaceSchema.safeParse({ name: "X", place: "1,1", stopId: "" }).success).toBe(false);
    expect(PlaceSchema.safeParse({ name: "X", place: "1,1", intent: "quay" }).success).toBe(false);
  });

  it("drops unknown extra fields, per the shared schema policy", () => {
    const parsed = PlaceSchema.parse({
      name: "Paris",
      place: "48.857,2.352",
      intent: "city",
      hacked: true,
    } as Record<string, unknown>);
    expect(parsed).not.toHaveProperty("hacked");
    expect(parsed.intent).toBe("city");
  });
});

describe("requested rejection copy", () => {
  const codes = [
    "arrivalTooLate",
    "noUsableDeparture",
    "restTooShort",
    "restTooLong",
    "insufficientDay1",
    "extremeTravelDay",
    "missingRailDay",
    "materialDetour",
  ];

  it("has Swedish and English copy for every reason code plus the title", () => {
    for (const lang of ["sv", "en"] as const) {
      const title = translate(lang, "on.rejected.title", { city: "Köpenhamn" });
      expect(title).not.toContain("on.rejected");
      expect(title).toContain("Köpenhamn");
      for (const code of codes) {
        const key = `on.rejected.${code}`;
        const copy = translate(lang, key);
        expect(copy, key).not.toBe(key);
        // No internal enum names leak into traveller-facing copy.
        expect(copy.toLowerCase()).not.toContain(code.toLowerCase());
      }
    }
  });
});
