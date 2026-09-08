import { formatDuration } from "./journey";
import type { OvernightBenefit, OvernightPlan } from "./overnight";

/**
 * Phase D: one honest sentence about what the overnight costs in arrival time.
 * Presentation only – it reuses `addedElapsedMinutes`, the elapsed signal the
 * planner already computes, and introduces no new tolerance of its own: a plan
 * that does not arrive later is simply described as arriving at about the same
 * time.
 */
export function elapsedTradeoff(plan: OvernightPlan): OvernightBenefit {
  return plan.addedElapsedMinutes > 0
    ? { key: "on.cost.later", vars: { time: formatDuration(plan.addedElapsedMinutes) } }
    : { key: "on.cost.same" };
}

type BenefitVars = Record<string, string | number>;

function stationNightBenefit(plan: OvernightPlan): OvernightBenefit | null {
  if (!plan.convertsStationNightToStay) return null;
  return plan.benefits.find((benefit) => benefit.key === "on.benefit.stationNightToStay") ?? null;
}

function isDisplayBenefit(benefit: OvernightBenefit): boolean {
  return benefit.key !== "on.benefit.shorterDays";
}

export function stationNightIntro(plan: OvernightPlan): OvernightBenefit | null {
  const benefit = stationNightBenefit(plan);
  if (!benefit?.vars) return null;
  return { key: "on.stationNightIntro", vars: benefit.vars };
}

export function stationNightReason(plan: OvernightPlan): {
  primary: OvernightBenefit;
  secondary: OvernightBenefit | null;
} | null {
  const benefit = stationNightBenefit(plan);
  if (!benefit?.vars) return null;

  const compared = Number(plan.reason.vars?.["n"] ?? 0);
  const city = String(benefit.vars["city"] ?? plan.stays[0]?.station ?? "");
  const secondary =
    compared > 1
      ? {
          key: "on.reason.stationNightCompared",
          vars: { city, n: compared },
        }
      : null;

  return {
    primary: { key: "on.reason.stationNight", vars: benefit.vars },
    secondary,
  };
}

export function displayOvernightBenefits(plan: OvernightPlan): OvernightBenefit[] {
  if (!plan.convertsStationNightToStay) return plan.benefits.filter(isDisplayBenefit).slice(0, 3);

  const stationNight = stationNightBenefit(plan);
  const benefits: OvernightBenefit[] = [];
  const noNightTravel = plan.benefits.find((benefit) => benefit.key === "on.benefit.noNightTravel");
  if (noNightTravel) benefits.push(noNightTravel);
  if (stationNight) benefits.push(stationNight);
  if (plan.restQuality === "good" || plan.restQuality === "veryGood") {
    benefits.push({ key: `on.benefit.rest.${plan.restQuality}` });
  }

  for (const benefit of plan.benefits) {
    if (benefits.length >= 3) break;
    if (
      !isDisplayBenefit(benefit) ||
      benefit.key === "on.benefit.noNightTravel" ||
      benefit.key === "on.benefit.stationNightToStay" ||
      benefit.key === "on.benefit.rest.good" ||
      benefit.key === "on.benefit.rest.veryGood"
    ) {
      continue;
    }
    benefits.push(benefit);
  }

  return benefits.slice(0, 3);
}

export function displayOvernightWarnings(plan: OvernightPlan): OvernightBenefit[] {
  return plan.warnings
    // The later-arrival cost gets its own prominent line in Phase D, so it is
    // not repeated as a drawback bullet.
    .filter((warning) => warning.key !== "on.warn.addedElapsed")
    .slice(0, 3)
    .map((warning) => {
      if (warning.key !== "on.warn.stationChange") return warning;
      const vars: BenefitVars = warning.vars ?? {};
      return Number(vars["n"] ?? 0) === 1
        ? { key: "on.warn.stationChange1", vars }
        : { ...warning, vars };
    });
}