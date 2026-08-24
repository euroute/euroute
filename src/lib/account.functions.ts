import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { dbError } from "./safe-error";
import { purgeUserData } from "./account.server";

/**
 * Export av allt som är kopplat till kontot – läses som användaren själv, så
 * RLS garanterar att bara egna rader kommer med.
 */
export const exportMyData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const trips = await context.supabase
      .from("saved_trips")
      .select("*")
      .order("created_at", { ascending: true });
    if (trips.error) throw dbError(trips.error, "account");

    const bookings = await context.supabase.from("trip_segment_bookings").select("*");
    if (bookings.error) throw dbError(bookings.error, "account");

    const preferences = await context.supabase.from("travel_preferences").select("*");
    if (preferences.error) throw dbError(preferences.error, "account");

    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: context.userId,
        email: typeof context.claims.email === "string" ? context.claims.email : null,
      },
      savedTrips: trips.data ?? [],
      bookingMarks: bookings.data ?? [],
      travelPreferences: preferences.data ?? [],
    };
  });

/** Raderar kontot och alla personuppgifter. Kan inte ångras. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return purgeUserData(context.userId);
  });
