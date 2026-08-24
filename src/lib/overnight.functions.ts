import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  UPSTREAM_BUDGET_WINDOW_MS,
  UPSTREAM_PLAN_BUDGET,
  clientKey,
  rateLimit,
  searchBudgetId,
  upstreamBudget,
} from "./abuse.server";
import { planOvernightOptions, type OvernightResult } from "./overnight.server";

const OVERNIGHT_LIMIT_PER_MINUTE = 12;

const PlaceSchema = z.object({
  name: z.string().min(1).max(160),
  place: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  country: z.string().max(8).optional(),
});

const LegSchema = z.object({
  kind: z.enum(["train", "bus", "walk", "other"]),
  mode: z.string().max(40),
  modeLabel: z.string().max(60),
  fromName: z.string().max(200),
  toName: z.string().max(200),
  fromPlace: z.string().max(60).optional(),
  toPlace: z.string().max(60).optional(),
  departure: z.string().min(10).max(40),
  arrival: z.string().min(10).max(40),
  durationMinutes: z.number(),
  operator: z.string().max(160).optional(),
  operatorUrl: z.string().max(400).optional(),
  trainName: z.string().max(120).optional(),
  headsign: z.string().max(200).optional(),
  realTime: z.boolean(),
});

const JourneySchema = z.object({
  id: z.string().max(120),
  departure: z.string().min(10).max(40),
  arrival: z.string().min(10).max(40),
  durationMinutes: z.number(),
  transfers: z.number(),
  minTransferMinutes: z.number().optional(),
  legs: z.array(LegSchema).min(1).max(40),
  operators: z.array(z.string().max(160)).max(20),
  hasNightLeg: z.boolean(),
  chained: z.boolean(),
});

const PreferencesSchema = z.object({
  minTransferMinutes: z.number().int().min(0).max(240),
  maxTransfers: z.number().int().min(0).max(10).nullable(),
  avoidNightTrains: z.boolean(),
  avoidOvernightTravel: z.boolean(),
  avoidStationChange: z.boolean(),
  preferDirect: z.boolean(),
  preferHighSpeed: z.boolean(),
  avoidBuses: z.boolean(),
  maxTravelHoursPerDay: z.number().int().min(1).max(24).nullable(),
  allowOvernightStop: z.boolean(),
});

export const planOvernight = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        base: JourneySchema,
        from: PlaceSchema,
        to: PlaceSchema,
        departAt: z.string().min(10).max(40),
        preferences: PreferencesSchema,
        style: z.enum(["recommended", "fastest", "comfortable", "scenic", "cheapest"]),
        requestedStop: PlaceSchema.nullable().default(null),
        maxTransfers: z.number().int().min(0).max(8).default(6),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Smart Overnight is the most expensive public endpoint, so it has the
    // tightest ceiling. Legitimate use is one call per search.
    const key = await clientKey();
    const limit = rateLimit("overnight", key, OVERNIGHT_LIMIT_PER_MINUTE, 60_000);
    if (!limit.ok) {
      return {
        result: null as OvernightResult | null,
        error: "För många sökningar just nu. Vänta en stund och sök igen.",
      };
    }
    try {
      const result = await planOvernightOptions({
        base: data.base,
        from: data.from,
        to: data.to,
        departAt: data.departAt,
        preferences: data.preferences,
        style: data.style,
        requestedStop: data.requestedStop,
        maxTransfers: data.maxTransfers,
        // Shares the ledger with the initial search of the same journey.
        budget: upstreamBudget(
          searchBudgetId(key, data.from.place, data.to.place, data.departAt),
          UPSTREAM_PLAN_BUDGET,
          UPSTREAM_BUDGET_WINDOW_MS,
        ),
      });
      return { result, error: null as string | null };
    } catch (error) {
      console.error("overnight planning failed", error);
      return {
        result: null as OvernightResult | null,
        error: "Kunde inte hämta vidareförbindelser för en övernattning just nu.",
      };
    }
  });
