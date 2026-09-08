/**
 * Timezone correctness for SEARCH INPUT (Phase 2).
 *
 * A departure entered by the traveller means local civil time at the ORIGIN
 * station. These tests pin the conversion local input → absolute instant and
 * the Edit Search round-trip, including DST edge cases.
 */

import { describe, expect, it } from "vitest";

import { civilDate, civilTime, civilToIso } from "./journey";
import { zoneForPlace } from "./station-timezone";

const LONDON = "51.531000,-0.126000";
const STOCKHOLM = "59.330000,18.058000";
const LISBON = "38.717000,-9.134000";
const HELSINKI = "60.171000,24.941000";

const utc = (iso: string) => new Date(iso).toISOString();

describe("origin timezone resolution", () => {
  it("resolves search origins from coordinates", () => {
    expect(zoneForPlace(LONDON)).toBe("Europe/London");
    expect(zoneForPlace(STOCKHOLM)).toBe("Europe/Stockholm");
    expect(zoneForPlace(LISBON)).toBe("Europe/Lisbon");
    expect(zoneForPlace(HELSINKI)).toBe("Europe/Helsinki");
  });
});

describe("local input → absolute instant", () => {
  it("A. London 2026-09-08 08:00 is 07:00Z (BST)", () => {
    const iso = civilToIso("2026-09-08", "08:00", zoneForPlace(LONDON));
    expect(iso).toBe("2026-09-08T08:00:00+01:00");
    expect(utc(iso)).toBe("2026-09-08T07:00:00.000Z");
  });

  it("B. Stockholm 2026-09-08 08:00 is 06:00Z (CEST)", () => {
    const iso = civilToIso("2026-09-08", "08:00", zoneForPlace(STOCKHOLM));
    expect(iso).toBe("2026-09-08T08:00:00+02:00");
    expect(utc(iso)).toBe("2026-09-08T06:00:00.000Z");
  });

  it("C. Lisbon 2026-09-08 08:00 is 07:00Z (WEST)", () => {
    expect(utc(civilToIso("2026-09-08", "08:00", zoneForPlace(LISBON)))).toBe(
      "2026-09-08T07:00:00.000Z",
    );
  });

  it("D. Helsinki 2026-09-08 08:00 is 05:00Z (EEST)", () => {
    expect(utc(civilToIso("2026-09-08", "08:00", zoneForPlace(HELSINKI)))).toBe(
      "2026-09-08T05:00:00.000Z",
    );
  });

  it("does not use the Swedish zone for a London search", () => {
    const london = civilToIso("2026-09-08", "08:00", "Europe/London");
    const stockholm = civilToIso("2026-09-08", "08:00", "Europe/Stockholm");
    expect(utc(london)).not.toBe(utc(stockholm));
    expect(new Date(london).getTime() - new Date(stockholm).getTime()).toBe(3600000);
  });

  it("F. keeps the local calendar date near midnight", () => {
    const iso = civilToIso("2026-09-08", "00:30", "Europe/Helsinki");
    expect(iso).toBe("2026-09-08T00:30:00+03:00");
    expect(utc(iso)).toBe("2026-09-07T21:30:00.000Z");
    expect(civilDate(iso, "Europe/Helsinki")).toBe("2026-09-08");
    expect(civilTime(iso, "Europe/Helsinki")).toBe("00:30");
  });

  it("G. winter GMT/CET: London 08:00 is 08:00Z, Stockholm 08:00 is 07:00Z", () => {
    expect(utc(civilToIso("2027-01-13", "08:00", "Europe/London"))).toBe(
      "2027-01-13T08:00:00.000Z",
    );
    expect(utc(civilToIso("2027-01-13", "08:00", "Europe/Stockholm"))).toBe(
      "2027-01-13T07:00:00.000Z",
    );
  });
});

describe("H. DST boundaries", () => {
  it("spring forward: normal times either side keep their local clock", () => {
    // 2026-03-29, London jumps 01:00 GMT → 02:00 BST.
    expect(utc(civilToIso("2026-03-29", "00:30", "Europe/London"))).toBe(
      "2026-03-29T00:30:00.000Z",
    );
    expect(utc(civilToIso("2026-03-29", "08:00", "Europe/London"))).toBe(
      "2026-03-29T07:00:00.000Z",
    );
  });

  it("spring forward: nonexistent local time normalizes forward by the gap", () => {
    const iso = civilToIso("2026-03-29", "01:30", "Europe/London");
    expect(iso).toBe("2026-03-29T02:30:00+01:00");
    expect(utc(iso)).toBe("2026-03-29T01:30:00.000Z");
    expect(civilTime(iso, "Europe/London")).toBe("02:30");
  });

  it("fall back: ambiguous local time resolves to the earlier (summer) occurrence", () => {
    // 2026-10-25, London falls back 02:00 BST → 01:00 GMT.
    const iso = civilToIso("2026-10-25", "01:30", "Europe/London");
    expect(iso).toBe("2026-10-25T01:30:00+01:00");
    expect(utc(iso)).toBe("2026-10-25T00:30:00.000Z");
  });

  it("fall back in Stockholm resolves to the earlier occurrence too", () => {
    const iso = civilToIso("2026-10-25", "02:30", "Europe/Stockholm");
    expect(iso).toBe("2026-10-25T02:30:00+02:00");
    expect(utc(iso)).toBe("2026-10-25T00:30:00.000Z");
  });
});

describe("E. Edit Search round-trip", () => {
  const cases: Array<[string, string, string, string]> = [
    ["London", LONDON, "2026-09-08", "08:00"],
    ["Stockholm", STOCKHOLM, "2026-09-08", "08:00"],
    ["Lisbon", LISBON, "2026-12-08", "23:45"],
    ["Helsinki", HELSINKI, "2026-09-08", "00:30"],
  ];

  it.each(cases)("%s keeps the entered date and time", (_name, place, date, time) => {
    const zone = zoneForPlace(place);
    const depart = civilToIso(date, time, zone); // what the URL carries
    expect(civilDate(depart, zone)).toBe(date);
    expect(civilTime(depart, zone)).toBe(time);
    // Re-submitting the reopened form must not drift.
    expect(civilToIso(civilDate(depart, zone), civilTime(depart, zone), zone)).toBe(depart);
  });

  it("London 08:00 does not read back as 09:00 in the Swedish zone", () => {
    const depart = civilToIso("2026-09-08", "08:00", "Europe/London");
    expect(civilTime(depart, "Europe/London")).toBe("08:00");
    expect(civilTime(depart, "Europe/Stockholm")).toBe("09:00"); // the old bug
  });
});
