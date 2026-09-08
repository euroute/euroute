/**
 * Generic station-relation classification (Phase 2 + Phase 2B hardening).
 *
 * Given two station endpoints (Phase-1 `StationIdentityInput`), decide their
 * physical relationship from upstream identity metadata, coordinates and
 * generic name structure only.
 *
 * PROPERTIES
 * ----------
 * - pure, deterministic, client- and server-safe, no API calls
 * - no city-, country- or operator-specific alias tables, and no list of city
 *   names: location context is detected structurally (shared leading token)
 * - conservative: prefers UNCERTAIN over claiming two real stations are one
 * - proximity can CONFIRM name evidence but never CREATES identity
 *
 * NOT WIRED INTO PRODUCTION. Transfer warnings, recommended margins, scoring,
 * ranking, Smart Overnight and the UI are untouched; Phase 3 will consume this.
 */

import {
  coordinateDistanceMeters,
  exactSameStopId,
  normalizeStationName,
  sameParentId,
  type StationIdentityInput,
} from "./station-identity";

export type StationRelation =
  | "SAME_STATION"
  | "SAME_COMPLEX"
  | "CONNECTED_COMPLEX"
  | "DIFFERENT_STATION"
  | "UNCERTAIN";

/** Diagnostic evidence tags. For tests and debugging only – never shown in UI. */
export type StationRelationEvidence =
  | "same-stop-id"
  | "same-parent-id"
  | "same-normalized-name"
  | "abbreviation-alias"
  | "name-containment"
  | "shared-station-token"
  | "shared-location-token-only"
  | "conflicting-station-tokens"
  | "no-name-overlap"
  | "coords-same-station"
  | "coords-same-complex"
  | "coords-walkable"
  | "coords-far"
  | "coords-missing"
  | "conflicting-evidence";

/**
 * Internal strength of the name-derived signal.
 * - STRONG: canonical/alias equivalence – the two names denote one station.
 * - SUPPORTING: a shared *station* token (not a mere location token).
 * - WEAK: only a shared location token, or no overlap at all.
 * - CONFLICTING: both sides carry different meaningful station tokens.
 */
export type NameSignalStrength = "STRONG" | "SUPPORTING" | "WEAK" | "CONFLICTING";

export type StationRelationResult = {
  relation: StationRelation;
  evidence: StationRelationEvidence[];
  /** Great-circle distance in metres when both coordinates are usable. */
  distanceMeters?: number | undefined;
  normalizedNames: [string, string];
  /** Internal signal strength of the name comparison (diagnostics only). */
  nameSignal: NameSignalStrength;
};

/* ------------------------------------------------------------------ *
 * Thresholds
 * ------------------------------------------------------------------ *
 * SAME_STATION_METERS (150 m): timetable feeds place the reference point of a
 * single station anywhere within its concourse/platform footprint, so two
 * representations of one station typically land well inside 150 m.
 *
 * SAME_COMPLEX_METERS (150 m): cross-feed aliases of the same complex sit at
 * essentially the same physical location; the same tolerance applies.
 *
 * WALKABLE_METERS (800 m): the outer distance at which two clearly distinct
 * station buildings can still form one tightly connected interchange on foot.
 * Beyond this, endpoints are treated as separate stations.
 */
export const SAME_STATION_METERS = 150;
export const SAME_COMPLEX_METERS = 150;
export const WALKABLE_METERS = 800;

/**
 * Generic station/administrative words and particles, dropped before comparing
 * name tokens. Multilingual and generic – no city or operator names.
 */
const GENERIC_WORDS = new Set([
  "station",
  "stationen",
  "stazione",
  "estacion",
  "estacao",
  "gare",
  "bahnhof",
  "hbf",
  "hauptbahnhof",
  "banegard",
  "banegaard",
  "centraal",
  "central",
  "centrale",
  "centralen",
  "centralstation",
  "hb",
  "c",
  "st",
  "international",
  "terminal",
  "de",
  "du",
  "des",
  "der",
  "di",
  "del",
  "della",
  "dei",
  "da",
  "la",
  "le",
  "les",
  "el",
  "los",
  "and",
  "och",
  "van",
  "am",
  "im",
  "an",
  "aan",
  "sur",
]);

function rawTokens(name: string): string[] {
  return (name ?? "")
    .toLowerCase()
    .split(",")[0]!
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[æø]/g, "o")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((t) => t.length > 0);
}

/** Name tokens with generic station vocabulary removed (order preserved). */
export function distinctiveTokens(name: string): string[] {
  return rawTokens(name).filter((t) => !GENERIC_WORDS.has(t));
}

/** Tokens present in both names after removing generic station vocabulary. */
export function sharedDistinctiveTokens(a: string, b: string): string[] {
  const setB = new Set(distinctiveTokens(b));
  return [...new Set(distinctiveTokens(a))].filter((t) => setB.has(t) && t.length >= 3);
}

/**
 * Generic abbreviation/initialism equivalence.
 *
 * Detects the structural pattern "sequence of single letters/one short acronym"
 * vs "sequence of words with those initials" – e.g. `s m n` or `smn` against
 * `santa maria novella`. Purely positional: no per-station mapping and no
 * knowledge of any particular city or station name.
 */
export function isInitialismAlias(aTokens: string[], bTokens: string[]): boolean {
  const test = (short: string[], long: string[]): boolean => {
    if (long.length < 2) return false;
    const initials = long.map((t) => t[0]!).join("");
    const shortJoined = short.join("");
    if (shortJoined.length !== long.length) return false;
    // Every short token must be an initial fragment, not a full word.
    if (short.some((t) => t.length > long.length)) return false;
    return shortJoined === initials;
  };
  return test(aTokens, bTokens) || test(bTokens, aTokens);
}

function containment(a: string, b: string): boolean {
  if (!a || !b) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return short.length >= 4 && long.includes(short);
}

type NameEvidence = {
  strength: NameSignalStrength;
  tags: StationRelationEvidence[];
};

/**
 * Compare two names generically and grade the resulting signal.
 *
 * Location context vs station identity is separated structurally: when both
 * names *begin* with the same token, that token is treated as location context
 * (e.g. "London X" / "London Y") and removed before identity comparison. What
 * remains are the station-identity tokens. Two non-empty, disjoint remainders
 * are CONFLICTING – the pair may still be physically adjacent, but the names
 * provide no evidence of one identity.
 */
export function compareStationNames(rawA: string, rawB: string): NameEvidence {
  const normA = normalizeStationName(rawA);
  const normB = normalizeStationName(rawB);
  const tokA = distinctiveTokens(rawA);
  const tokB = distinctiveTokens(rawB);

  // STRONG: identical after canonical normalisation (this is what makes
  // "Hbf" ↔ "Hauptbahnhof" equivalent – generic vocabulary, not a city rule).
  if (normA.length > 0 && normA === normB) {
    return { strength: "STRONG", tags: ["same-normalized-name"] };
  }

  // Leading shared token = location context, not station identity.
  const sharedLeading =
    tokA.length > 0 && tokB.length > 0 && tokA[0] === tokB[0] ? tokA[0]! : undefined;
  const coreA = sharedLeading ? tokA.slice(1) : tokA;
  const coreB = sharedLeading ? tokB.slice(1) : tokB;

  // STRONG: generic abbreviation/initialism relation between the cores
  // (e.g. "s m n" ↔ "santa maria novella").
  if (isInitialismAlias(coreA, coreB)) {
    return { strength: "STRONG", tags: ["abbreviation-alias"] };
  }

  const coreShared = coreA.filter((t) => coreB.includes(t) && t.length >= 3);
  const coreStrA = coreA.join("");
  const coreStrB = coreB.join("");

  if (coreShared.length > 0) {
    // A shared *station* token (beyond location context) supports identity.
    return { strength: "SUPPORTING", tags: ["shared-station-token"] };
  }

  if (coreA.length > 0 && coreB.length > 0) {
    if (containment(coreStrA, coreStrB)) {
      return { strength: "SUPPORTING", tags: ["name-containment"] };
    }
    // Different meaningful station tokens on both sides: conflicting.
    const tags: StationRelationEvidence[] = ["conflicting-station-tokens"];
    if (sharedLeading) tags.unshift("shared-location-token-only");
    return { strength: "CONFLICTING", tags };
  }

  if (sharedLeading) {
    // Only the location context matches (one side has no station token left).
    return { strength: "WEAK", tags: ["shared-location-token-only"] };
  }

  if (containment(normA, normB)) {
    return { strength: "SUPPORTING", tags: ["name-containment"] };
  }

  const shared = sharedDistinctiveTokens(rawA, rawB);
  if (shared.length > 0) return { strength: "SUPPORTING", tags: ["shared-station-token"] };
  return { strength: "WEAK", tags: ["no-name-overlap"] };
}

/**
 * Classify the relation between two station endpoints.
 *
 * Signal priority (strongest first):
 *   A. exact upstream stop identity                          (STRONG)
 *   B. exact upstream parent identity                        (STRONG)
 *   C. canonical name / abbreviation-alias equivalence       (STRONG)
 *   D. shared station-identity token or containment          (SUPPORTING)
 *   E. geographic proximity                                  (SUPPORTING only)
 *   F. shared location token only, or proximity alone        (WEAK → UNCERTAIN)
 *   G. different meaningful station tokens                   (CONFLICTING)
 *
 * `level` is preserved by Phase 1 but deliberately ignored: its Transitous
 * semantics (floor/level of a quay) say nothing about station identity.
 */
export function classifyStationRelation(
  a: StationIdentityInput,
  b: StationIdentityInput,
): StationRelationResult {
  const evidence: StationRelationEvidence[] = [];
  const nameA = normalizeStationName(a.name);
  const nameB = normalizeStationName(b.name);
  const distance = coordinateDistanceMeters(a, b);
  const normalizedNames: [string, string] = [nameA, nameB];
  let nameSignal: NameSignalStrength = "WEAK";
  const done = (relation: StationRelation): StationRelationResult => ({
    relation,
    evidence,
    distanceMeters: distance,
    normalizedNames,
    nameSignal,
  });

  // A. Exact upstream stop identity wins over any name difference.
  if (exactSameStopId(a, b)) {
    evidence.push("same-stop-id");
    nameSignal = "STRONG";
    return done("SAME_STATION");
  }

  const parentMatch = sameParentId(a, b);
  const name = compareStationNames(a.name, b.name);
  nameSignal = name.strength;

  if (distance === undefined) {
    evidence.push("coords-missing");
    // B. Parent identity is upstream truth and stands on its own.
    if (parentMatch) {
      evidence.push("same-parent-id");
      return done("SAME_COMPLEX");
    }
    // Name-only data cannot rule out two identically named stations in
    // different places, so it never yields a positive claim.
    evidence.push(...name.tags);
    return done("UNCERTAIN");
  }

  if (parentMatch) {
    evidence.push("same-parent-id");
    if (distance > WALKABLE_METERS) {
      // Same parent but kilometres apart: the signals disagree.
      evidence.push("coords-far", "conflicting-evidence");
      return done("UNCERTAIN");
    }
    evidence.push(distance <= SAME_COMPLEX_METERS ? "coords-same-complex" : "coords-walkable");
    return done("SAME_COMPLEX");
  }

  evidence.push(...name.tags);

  if (distance > WALKABLE_METERS) {
    evidence.push("coords-far");
    if (name.strength === "STRONG") {
      // Alias-equivalent names kilometres apart: two stations, or bad data.
      evidence.push("conflicting-evidence");
      return done("UNCERTAIN");
    }
    return done("DIFFERENT_STATION");
  }

  const veryClose = distance <= SAME_STATION_METERS;
  evidence.push(veryClose ? "coords-same-station" : "coords-walkable");

  switch (name.strength) {
    case "STRONG":
      return done(veryClose ? "SAME_STATION" : "SAME_COMPLEX");
    case "SUPPORTING":
      return done(veryClose ? "SAME_COMPLEX" : "CONNECTED_COMPLEX");
    default:
      // WEAK (shared city word only, or nothing) and CONFLICTING (genuinely
      // different station names) never become identity from proximity alone.
      if (name.strength === "CONFLICTING") evidence.push("conflicting-evidence");
      return done("UNCERTAIN");
  }
}
