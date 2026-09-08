/**
 * F5B P1 #2 — tidtabellsfel måste följa gränssnittets språk.
 *
 * Serverfunktionerna returnerar neutrala koder; översättningen sker i
 * webbläsaren. Testerna bevisar att varje kod har både svensk och engelsk text,
 * att ingen rå nyckel kan nå resenären och att språken inte läcker in i
 * varandra.
 */
import { describe, expect, it } from "vitest";

import { en, sv } from "./i18n";
import { railErrorMessageKey, type RailErrorCode } from "./rail-error";

const CODES: RailErrorCode[] = ["timetable_unavailable", "rate_limited", "station_search_failed"];

function message(lang: "sv" | "en", code: string | null | undefined): string {
  const dict = lang === "sv" ? sv : en;
  return dict[railErrorMessageKey(code)] ?? "";
}

describe("rail error localisation", () => {
  for (const code of CODES) {
    it(`${code} has a Swedish and an English message`, () => {
      const svText = message("sv", code);
      const enText = message("en", code);
      expect(svText.length).toBeGreaterThan(10);
      expect(enText.length).toBeGreaterThan(10);
      expect(svText).not.toBe(enText);
    });
  }

  it("timetable/upstream unavailable is localised", () => {
    expect(message("sv", "timetable_unavailable")).toBe(
      "Tidtabellstjänsten kunde inte svara för den här sträckan. Prova en närliggande station eller ett annat datum.",
    );
    expect(message("en", "timetable_unavailable")).toBe(
      "The timetable service could not answer for this route. Try a nearby station or another date.",
    );
  });

  it("rate limiting is localised", () => {
    expect(message("sv", "rate_limited")).toBe(
      "För många sökningar just nu. Vänta en stund och sök igen.",
    );
    expect(message("en", "rate_limited")).toBe(
      "Too many searches right now. Wait a moment and search again.",
    );
  });

  it("station search failure is localised", () => {
    expect(message("sv", "station_search_failed")).toBe("Kunde inte söka stationer just nu.");
    expect(message("en", "station_search_failed")).toBe(
      "Could not search for stations right now.",
    );
  });

  it("never shows a raw i18n key to the traveller", () => {
    for (const code of [...CODES, "something_unknown", "", null, undefined]) {
      for (const lang of ["sv", "en"] as const) {
        const text = message(lang, code);
        expect(text).not.toMatch(/^railError\./);
        // En rå nyckel är ett enda punktseparerat ord utan mellanslag.
        expect(text).not.toMatch(/^\S+\.\S+$/);
        expect(text.length).toBeGreaterThan(10);
      }
    }
  });

  it("falls back to the neutral timetable message for unknown codes", () => {
    expect(message("sv", "not_a_code")).toBe(message("sv", "timetable_unavailable"));
    expect(message("en", "not_a_code")).toBe(message("en", "timetable_unavailable"));
  });

  it("no Swedish sentence appears in the English messages", () => {
    const swedishMarkers = /Tidtabellstjänsten|För många|Kunde inte|närliggande|Vänta/;
    for (const code of CODES) expect(message("en", code)).not.toMatch(swedishMarkers);
  });

  it("no English sentence appears in the Swedish messages", () => {
    const englishMarkers = /timetable service|Too many|Could not|nearby station|Wait a moment/;
    for (const code of CODES) expect(message("sv", code)).not.toMatch(englishMarkers);
  });

  it("exposes no technical detail, stack trace or upstream internals", () => {
    const forbidden = /motis|transitous|http|status|Error|stack|undefined|null/i;
    for (const code of CODES)
      for (const lang of ["sv", "en"] as const) expect(message(lang, code)).not.toMatch(forbidden);
  });

  it("keeps the dictionaries in sync for the new keys", () => {
    for (const code of CODES) {
      const key = railErrorMessageKey(code);
      expect(Object.keys(sv)).toContain(key);
      expect(Object.keys(en)).toContain(key);
    }
    expect(Object.keys(sv).length).toBe(Object.keys(en).length);
  });
});
