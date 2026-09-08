import { describe, expect, it } from "vitest";
import { sv, en } from "./i18n";

/**
 * Phase F4C — copy alignment only.
 * The profile means "earliest arrival from the requested departure time".
 * Duration wording is reserved for facts that really are duration-based.
 */
describe("F4C profile copy", () => {
  it("renders the earliest-arrival profile name", () => {
    expect(sv["style.fastest"]).toBe("Tidigast framme");
    expect(en["style.fastest"]).toBe("Earliest arrival");
  });

  it("no longer claims shortest total journey time in the description", () => {
    expect(sv["style.fastest.desc"]).toBe("Kommer fram tidigast från din valda avgångstid.");
    expect(en["style.fastest.desc"]).toBe(
      "Gets you there earliest from your selected departure time.",
    );
    expect(sv["style.fastest.desc"]).not.toMatch(/kortast|restid/i);
    expect(en["style.fastest.desc"]).not.toMatch(/shortest|journey time/i);
  });

  it("keeps arrival copy free of duration claims", () => {
    // Triggered by earliest arrival, never by elapsed duration.
    expect(sv["reason.earliestArrival"]).not.toMatch(/kortast/i);
    expect(sv["reason.earliestArrivalSafe"]).not.toMatch(/kortast/i);
    expect(en["reason.earliestArrival"]).not.toMatch(/shortest/i);
    expect(en["reason.earliestArrivalSafe"]).not.toMatch(/shortest/i);
    expect(sv["cat.fastest"]).not.toMatch(/kortast|snabbast/i);
    expect(en["cat.fastest"]).not.toMatch(/shortest|fastest/i);
  });

  it("keeps duration copy free of arrival claims", () => {
    // reason.fastest fires on shortest elapsed only.
    expect(sv["reason.fastest"]).toMatch(/kortast restid/i);
    expect(sv["reason.fastest"]).not.toMatch(/tidigast/i);
    expect(en["reason.fastest"]).toMatch(/shortest travel time/i);
    expect(en["reason.fastest"]).not.toMatch(/arrives first|earliest/i);
    // alsoFastest fires on shortest elapsed only.
    expect(sv["cat.alsoFastest"]).toBe("Även kortast restid");
    expect(en["cat.alsoFastest"]).toBe("Also shortest journey");
  });

  it("communicates both facts when both are true", () => {
    expect(sv["reason.fastestAndSafe"]).toMatch(/tidigast framme/i);
    expect(sv["reason.fastestAndSafe"]).toMatch(/kortast restid/i);
    expect(en["reason.fastestAndSafe"]).toMatch(/arrives first/i);
    expect(en["reason.fastestAndSafe"]).toMatch(/shortest journey/i);
  });

  it("does not use Snabbast/Fastest as the profile name anywhere in the UI copy", () => {
    for (const dict of [sv, en]) {
      for (const [key, value] of Object.entries(dict)) {
        if (!key.startsWith("style.") && !key.startsWith("cat.")) continue;
        expect(String(value)).not.toMatch(/^(Snabbast|Fastest)$/);
      }
    }
  });
});
