/**
 * Display normalisation of station names. Raw timetable data sometimes arrives
 * in ALL CAPS ("FIRENZE S.MARIA NOVELLA") or with country suffixes. This module
 * only changes how a name is *shown* – underlying station ids and API values are
 * never touched.
 *
 * Client-safe.
 */

import { cityName } from "./overnight";

const KEEP_UPPER = new Set(["sbb", "cff", "ffs", "nmbs", "sncb", "pkp", "db", "sj", "hbf", "c"]);

function titleCaseToken(token: string): string {
  const lower = token.toLowerCase();
  const bare = lower.replace(/\./g, "");
  if (KEEP_UPPER.has(bare)) return token.toUpperCase();
  if (bare.length <= 1) return token.toUpperCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** "FIRENZE S.MARIA NOVELLA" → "Firenze S. Maria Novella" */
export function stationLabel(raw: string): string {
  const base = (raw.split(",")[0] ?? raw).trim().replace(/\s+/g, " ");
  if (!base) return raw;

  // Only re-case names that carry no lower-case letters at all.
  const shouted = !/[a-zà-öø-ÿ]/.test(base);
  const cased = shouted
    ? base
        .split(" ")
        .map((word) =>
          word
            .split("-")
            .map((part) => part.split(".").map(titleCaseToken).join("."))
            .join("-"),
        )
        .join(" ")
    : base;

  // "S.Maria" → "S. Maria", and keep French/Italian particles lower case.
  return cased
    .replace(/\.(?=[^\s.])/g, ". ")
    .replace(/\bC\.\s*le\b/gi, "Centrale")
    .replace(/(?!^)\b(De|Du|Des|Di|Del|Della|Dei|Van|Sur|Aan|Am|Im)\b/g, (m) => m.toLowerCase());
}

/** City-level label for product surfaces: "Firenze S. Maria Novella" → "Firenze". */
export function cityLabel(raw: string): string {
  return cityName(stationLabel(raw));
}
