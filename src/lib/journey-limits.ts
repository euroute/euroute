/**
 * Shared retrieval bounds. Kept in their own client-safe module so both the
 * server retrieval path and pure candidate-eligibility helpers can use the
 * same values without importing server-only code.
 */

/**
 * Phase F1 safety bound: timetable mode can return numItineraries + 1 plus
 * Pareto variants. This is a memory/response guard only – ranking, dedupe and
 * scoring are untouched.
 */
export const MAX_CANDIDATE_JOURNEYS = 8;

/**
 * Phase F3 recovery target, also the Phase F4D safety-valve target. Zero usable
 * journeys means a false "no usable trains" state; one usable journey leaves the
 * traveller without anything to compare against. Two usable, passenger-distinct
 * journeys is the smallest pool that avoids both failures.
 */
export const MIN_USABLE_JOURNEYS = 2;
