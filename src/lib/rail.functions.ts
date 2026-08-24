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
import { geocodePlaces, planJourneys } from "./rail.server";

const PlaceSchema = z.object({
  name: z.string().min(1).max(160),
  place: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  country: z.string().max(8).optional(),
});

/** Guests must be able to search freely; these ceilings only stop floods. */
const STATION_LIMIT_PER_MINUTE = 60;
const PLAN_LIMIT_PER_MINUTE = 20;


export const searchStations = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        text: z.string().trim().min(2).max(120),
        // Allowlisted server-side: nothing else is ever forwarded upstream.
        language: z.enum(["sv", "en"]).default("sv"),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const limit = rateLimit("stations", await clientKey(), STATION_LIMIT_PER_MINUTE, 60_000);
    if (!limit.ok) {
      return { places: [], error: "För många sökningar just nu. Försök igen om en stund." };
    }
    try {
      return { places: await geocodePlaces(data.text, data.language), error: null as string | null };
    } catch (error) {
      console.error("geocode failed", error);
      return { places: [], error: "Kunde inte söka stationer just nu." };
    }
  });

export const planTrip = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        from: PlaceSchema,
        to: PlaceSchema,
        // Each via point adds a chained upstream search, so the ceiling is low.
        via: z.array(PlaceSchema).max(3).default([]),
        departAt: z.string().min(10).max(40),
        maxTransfers: z.number().int().min(0).max(8).default(4),
        minTransferMinutes: z.number().int().min(0).max(240).default(15),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = await clientKey();
    const limit = rateLimit("plan", key, PLAN_LIMIT_PER_MINUTE, 60_000);
    if (!limit.ok) {
      return {
        journeys: [],
        error: "För många sökningar just nu. Vänta en stund och sök igen.",
      };
    }
    try {
      const budget = upstreamBudget(
        searchBudgetId(key, data.from.place, data.to.place, data.departAt),
        UPSTREAM_PLAN_BUDGET,
        UPSTREAM_BUDGET_WINDOW_MS,
      );
      const journeys = await planJourneys({ ...data, budget });
      return { journeys, error: null as string | null };
    } catch (error) {
      console.error("plan failed", error);
      return {
        journeys: [],
        error:
          "Tidtabellstjänsten kunde inte svara för den här sträckan. Prova en närliggande station eller ett annat datum.",
      };
    }
  });
