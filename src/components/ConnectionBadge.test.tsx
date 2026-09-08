/**
 * Phase 3 UI regression: connection copy must not claim a cross-city station
 * change when the two stop names describe one station complex.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { Leg } from "@/lib/journey";

const langState = vi.hoisted(() => ({ current: "sv" as "sv" | "en" }));

vi.mock("@/lib/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/lib/i18n")>("@/lib/i18n");
  return {
    ...actual,
    useI18n: () => ({
      lang: langState.current,
      setLang: vi.fn(),
      t: (key: string, vars?: Record<string, string | number>) =>
        actual.translate(langState.current, key, vars),
    }),
  };
});

const { ConnectionBlock } = await import("@/components/ConnectionBadge");
const { evaluateConnections } = await import("@/lib/journey-intelligence");

function connectionFor(
  arrive: { name: string; place?: string },
  depart: { name: string; place?: string },
  gapMinutes: number,
) {
  const base: Leg = {
    kind: "train",
    mode: "HIGHSPEED_RAIL",
    modeLabel: "Snabbtåg",
    fromName: "Start",
    toName: arrive.name,
    toPlace: arrive.place,
    departure: "2026-09-08T08:00:00+02:00",
    arrival: "2026-09-08T10:00:00+02:00",
    durationMinutes: 120,
    realTime: false,
  };
  const next: Leg = {
    ...base,
    fromName: depart.name,
    fromPlace: depart.place,
    toName: "Slut",
    toPlace: undefined,
    departure: `2026-09-08T${String(10 + Math.floor(gapMinutes / 60)).padStart(2, "0")}:${String(
      gapMinutes % 60,
    ).padStart(2, "0")}:00+02:00`,
    arrival: "2026-09-08T14:00:00+02:00",
  };
  return evaluateConnections(
    {
      id: "j",
      departure: base.departure,
      arrival: next.arrival,
      durationMinutes: 300,
      transfers: 1,
      legs: [base, next],
      operators: [],
      hasNightLeg: false,
      chained: false,
    },
    15,
  )[0]!;
}

function markup(lang: "sv" | "en", connection: ReturnType<typeof connectionFor>) {
  langState.current = lang;
  return renderToStaticMarkup(<ConnectionBlock connection={connection} />);
}

describe("ConnectionBlock – station relation copy", () => {
  const parisComplex = connectionFor(
    { name: "Paris-Nord", place: "48.880959,2.35519" },
    { name: "Gare du Nord", place: "48.880337,2.354979" },
    30,
  );
  const realChange = connectionFor(
    { name: "Paris Gare du Nord", place: "48.880337,2.354979" },
    { name: "Paris Gare de Lyon", place: "48.844922,2.373464" },
    45,
  );

  it("Paris-Nord → Gare du Nord shows no cross-city station-change warning", () => {
    const sv = markup("sv", parisComplex);
    expect(sv).not.toContain("Byte av station inom staden");
    expect(sv).toContain("Byte inom samma stationsområde");
    const en = markup("en", parisComplex);
    expect(en).not.toContain("Change of station within the city");
    expect(en).toContain("Transfer within the same station complex");
    // Both station names are still shown to the traveller.
    expect(en).toContain("Gare du Nord");
  });

  it("Gare du Nord → Gare de Lyon still warns about a real station change", () => {
    expect(markup("sv", realChange)).toContain("Byte av station inom staden");
    const en = markup("en", realChange);
    expect(en).toContain("Change of station within the city");
    expect(en).not.toContain("Transfer within the same station complex");
  });

  it("a true same-station connection shows neither label", () => {
    const same = connectionFor(
      { name: "Hamburg Hbf", place: "53.5528,10.0064" },
      { name: "Hamburg Hauptbahnhof", place: "53.5528,10.0064" },
      30,
    );
    const en = markup("en", same);
    expect(en).not.toContain("Change of station within the city");
    expect(en).not.toContain("Transfer within the same station complex");
  });
});
