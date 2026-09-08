/**
 * Phase F4D — departure horizon.
 *
 * Ordinary two-point timetable searches return departures far beyond what the
 * traveller asked for. Those different-day candidates never win a profile; they
 * only consume the candidate pool and inflate "Visa fler resor".
 *
 * The rule is a pure, absolute elapsed-time horizon from the requested
 * departure instant. It is not a calendar-day rule, not a duration limit and
 * not an arrival filter. Usability is never redefined here: the shared
 * pre-analysis semantics (validate → F2.5 dedupe → Phase E → F1.5) remain the
 * only authority, exactly as used by F3.
 */

import { MIN_USABLE_JOURNEYS } from "./journey-limits";
import type { Journey } from "./journey";
import { preAnalyseJourneys } from "./journey-intelligence";

/** Absolute elapsed horizon from the requested departure instant. */
export const DEPARTURE_HORIZON_MINUTES = 12 * 60;

/**
 * Keeps candidates departing at most +12h after the requested instant (the
 * boundary itself is inside), plus – only when needed – the earliest usable
 * beyond-horizon journeys until MIN_USABLE_JOURNEYS usable journeys exist.
 *
 * Unusable candidates can never satisfy the minimum, and no journey's identity,
 * order or usability is altered.
 */
export function applyDepartureHorizon(
  journeys: Journey[],
  requestedDepartureIso: string,
  minTransferMinutes: number,
): Journey[] {
  const requested = new Date(requestedDepartureIso).getTime();
  if (!Number.isFinite(requested)) return journeys;

  const limit = requested + DEPARTURE_HORIZON_MINUTES * 60000;
  const departureOf = (j: Journey) => new Date(j.departure).getTime();

  const inside = journeys.filter((j) => {
    const t = departureOf(j);
    return Number.isFinite(t) && t <= limit;
  });
  const beyond = journeys.filter((j) => {
    const t = departureOf(j);
    return Number.isFinite(t) && t > limit;
  });
  // Candidates without a parseable departure are left untouched by the horizon;
  // the shared pre-analysis discards them as invalid anyway.
  const undated = journeys.filter((j) => !Number.isFinite(departureOf(j)));

  const usableIdsOf = (pool: Journey[]) =>
    new Set(preAnalyseJourneys(pool, minTransferMinutes).usable.map((item) => item.journey.id));

  const insideUsable = usableIdsOf(inside).size;
  let deficit = MIN_USABLE_JOURNEYS - insideUsable;
  const admitted: Journey[] = [];

  if (deficit > 0) {
    const beyondChronological = [...beyond].sort((a, b) => departureOf(a) - departureOf(b));
    // Usability is judged against the pool the traveller would actually see, so
    // the candidate is evaluated together with everything already kept.
    for (const candidate of beyondChronological) {
      if (deficit <= 0) break;
      const pool = [...inside, ...admitted, candidate];
      if (usableIdsOf(pool).has(candidate.id)) {
        admitted.push(candidate);
        deficit -= 1;
      }
    }
  }

  const keep = new Set([...inside, ...admitted, ...undated].map((j) => j.id));
  // Deterministic: the original candidate order is preserved verbatim.
  return journeys.filter((j) => keep.has(j.id));
}
