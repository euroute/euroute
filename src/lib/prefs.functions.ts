import { createServerFn } from "@tanstack/react-start";
import { dbError } from "./safe-error";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PreferencesInput = z.object({
  travelStyle: z.enum(["recommended", "fastest", "comfortable", "scenic", "cheapest"]),
  preferences: z.object({
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
  }),
});

export const getTravelPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("travel_preferences")
      .select("travel_style, preferences")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw dbError(error, "prefs");
    if (!data) return null;
    return { travelStyle: data.travel_style, preferences: data.preferences };
  });

export const saveTravelPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PreferencesInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("travel_preferences").upsert(
      {
        user_id: context.userId,
        travel_style: data.travelStyle,
        preferences: data.preferences as never,
      },
      { onConflict: "user_id" },
    );
    if (error) throw dbError(error, "prefs");
    return { ok: true };
  });
