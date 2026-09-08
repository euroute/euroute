/**
 * F5C — booking-link integrity.
 *
 * One place decides WHICH booking actions a leg may show. The product rule is
 * absolute:
 *
 *   "Never emit a plausible wrong booking link. A missing link is better than a
 *    misleading one."
 *
 * Two decisions live here, both derived from generic normalised data — no
 * city-, station- or route-specific patches:
 *
 * 1. Bookability class.
 *    - BOOKABLE RAIL: the leg is an intercity/regional rail service where an
 *      operator booking action is meaningful.
 *    - LOCAL: metro, tram, suburban/commuter, bus, ferry, walk and anything
 *      else. A rail booking CTA on those legs is misleading, so we render a
 *      neutral informational note instead.
 *
 * 2. Which links are reliable enough to render, in a strict hierarchy:
 *      1) proven operator target that preserves journey context (deep link)
 *      2) proven operator homepage (alias registry, or the operator's own URL
 *         from the timetable feed)
 *      3) proven neutral retailer/planner link
 *      4) nothing — an honest empty state
 *
 * Levels 3 is currently EMPTY on purpose:
 *
 * - The DB (int.bahn.de) planner link was generated from raw feed station names
 *   with synthesised `A=1@O=<name>` identifiers. DB re-interprets those names
 *   freely, which demonstrably produced wrong stations (e.g. "London St Pancras
 *   International" resolving elsewhere). Euroute has no station-identity proof
 *   for those endpoints and does not perform EVA resolution, so the neutral
 *   planner link is suppressed. Deutsche Bahn is still reachable whenever DB is
 *   the actual operator, through the operator target.
 * - Trainline URLs were guessed slugs built from feed names; two thirds of the
 *   audited URLs failed. Without a verified mapping the retailer link is
 *   suppressed.
 *
 * Zero network calls: reliability comes from known target semantics, never from
 * runtime probing.
 */

import { isRailAnchorLeg, type Leg } from "./journey";
import { operatorTargetForLeg, type BookingTarget } from "./operators";

/** Analytics taxonomy is unchanged: planner | operator | retailer. */
export type BookingActionTarget = "planner" | "operator" | "retailer";

export type BookingAction = {
  target: BookingActionTarget;
  url: string;
  /** Display name of the destination (operator or retailer). */
  label: string;
  /**
   * True only when the destination meaningfully preserves the journey context
   * (route and/or date). Drives "Book with X" vs the weaker "Open X".
   */
  contextual: boolean;
};

export type LegBookingPlan =
  | { kind: "local"; actions: [] }
  | { kind: "rail"; actions: BookingAction[] };

/** Bookability class of a leg. */
export type Bookability = "rail" | "local";

/**
 * Generic classification. Rail anchors (high-speed, long distance, night,
 * regional/regional-fast, plain rail) are bookable; every local access mode
 * (metro, subway, tram, suburban, bus, coach, ferry, walk, other) is not.
 */
export function legBookability(leg: Leg): Bookability {
  return isRailAnchorLeg(leg) ? "rail" : "local";
}

/**
 * Neutral planner link (Deutsche Bahn). Returns null until Euroute can PROVE
 * both endpoint identities; no proof mechanism exists in this phase, so no
 * generic planner link is ever emitted.
 */
export function plannerTargetForLeg(_leg: Leg): BookingTarget | null {
  return null;
}

/**
 * Neutral retailer link (Trainline). Returns null unless the exact route URL is
 * verified. No verified mapping exists in this phase, so nothing is emitted
 * rather than a guessed slug.
 */
export function verifiedRetailerTargetForLeg(_leg: Leg): BookingTarget | null {
  return null;
}

/** The reliable booking actions for one leg, in presentation order. */
export function bookingPlanForLeg(leg: Leg): LegBookingPlan {
  if (legBookability(leg) === "local") return { kind: "local", actions: [] };

  const actions: BookingAction[] = [];

  const operator = operatorTargetForLeg(leg);
  if (operator) {
    actions.push({
      target: "operator",
      url: operator.url,
      label: operator.label,
      contextual: operator.isDeepLink,
    });
  }

  const planner = plannerTargetForLeg(leg);
  if (planner) {
    actions.push({
      target: "planner",
      url: planner.url,
      label: planner.label,
      contextual: planner.isDeepLink,
    });
  }

  const retailer = verifiedRetailerTargetForLeg(leg);
  if (retailer) {
    actions.push({
      target: "retailer",
      url: retailer.url,
      label: retailer.label,
      contextual: retailer.isDeepLink,
    });
  }

  return { kind: "rail", actions };
}

/** i18n key for an action's button label. */
export function bookingActionLabelKey(action: BookingAction): "booking.bookWith" | "booking.open" {
  return action.contextual ? "booking.bookWith" : "booking.open";
}
