// Server-only: radering och export av en resenärs egna uppgifter (GDPR).
//
// Radering sker med servicerollen eftersom kontot i auth-tabellen måste bort,
// men bara efter att serverfunktionen har verifierat sessionen. Klienten
// skickar aldrig med vilket användar-id som ska raderas.

export type PurgeResult = {
  savedTrips: number;
  bookingMarks: number;
  preferences: number;
  anonymisedClicks: number;
  /** Steg som misslyckades utan att blockera raderingen (t.ex. statistikstädning). */
  warnings: string[];
};

/**
 * Raderar allt som hör till användaren och tar bort själva kontot.
 *
 * Bokningsklick behålls men avidentifieras (user_id → null): de används bara
 * som aggregerad statistik över vilka etapper som leder vidare till bokning,
 * och innehåller efter raderingen inget som pekar tillbaka på personen.
 *
 * Ordningen är medvetet vald så att kontot aldrig blir halvraderat:
 * 1. Avidentifiering av klickstatistik är icke-kritisk – misslyckas den loggas
 *    en varning och raderingen fortsätter (raderna pekar ändå inte ut personen
 *    efter att resan och kontot är borta, eftersom trip_id nollas av databasen).
 * 2. Alla personuppgifter (bokningsmarkeringar, resor, preferenser, profil)
 *    måste bort innan auth-kontot raderas. Om något av de stegen misslyckas
 *    avbryts flödet INNAN auth-kontot tas bort, så användaren fortfarande kan
 *    logga in och försöka igen – varje steg matchar på user_id och är därför
 *    idempotent.
 */
export async function purgeUserData(userId: string): Promise<PurgeResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const warnings: string[] = [];

  // Icke-kritiskt: aggregerad klickstatistik avidentifieras.
  const clicks = await supabaseAdmin
    .from("booking_clicks")
    .update({ user_id: null })
    .eq("user_id", userId)
    .select("id");
  if (clicks.error) {
    console.error("[euroute:account] purge step failed: booking_clicks anonymisation");
    warnings.push("booking_clicks");
  }

  // Kritiskt: allt som är personuppgifter måste bort före auth-kontot.
  const marks = await supabaseAdmin
    .from("trip_segment_bookings")
    .delete()
    .eq("user_id", userId)
    .select("id");

  const trips = await supabaseAdmin.from("saved_trips").delete().eq("user_id", userId).select("id");

  const prefs = await supabaseAdmin
    .from("travel_preferences")
    .delete()
    .eq("user_id", userId)
    .select("user_id");

  const profile = await supabaseAdmin.from("profiles").delete().eq("id", userId).select("id");

  const critical: Array<[string, { error: unknown }]> = [
    ["trip_segment_bookings", marks],
    ["saved_trips", trips],
    ["travel_preferences", prefs],
    ["profiles", profile],
  ];

  for (const [name, step] of critical) {
    if (step.error) {
      console.error(`[euroute:account] purge step failed: ${name}`);
      throw new Error("EUROUTE_ACCOUNT_DELETE_FAILED");
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[euroute:account] auth user delete failed");
    throw new Error("EUROUTE_ACCOUNT_DELETE_FAILED");
  }

  return {
    savedTrips: trips.data?.length ?? 0,
    bookingMarks: marks.data?.length ?? 0,
    preferences: prefs.data?.length ?? 0,
    anonymisedClicks: clicks.data?.length ?? 0,
    warnings,
  };
}

