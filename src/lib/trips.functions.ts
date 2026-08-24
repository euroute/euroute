import { createServerFn } from "@tanstack/react-start";
import { dbError } from "./safe-error";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import { fetchSharedTrip, logBookingClick, userIdFromBearer } from "./trips.server";

const TripInput = z.object({
  title: z.string().trim().min(1).max(120),
  fromName: z.string().trim().min(1).max(160),
  toName: z.string().trim().min(1).max(160),
  departAt: z.string().max(40).nullable(),
  arriveAt: z.string().max(40).nullable(),
  itinerary: z.unknown(),
  aiNote: z.string().max(2000).nullable(),
  travelStyle: z.string().max(40).default("recommended"),
  isOvernight: z.boolean().default(false),
  overnightCities: z.array(z.string().max(120)).max(6).default([]),
  travelDays: z.number().int().min(1).max(10).default(1),
  changes: z.number().int().min(0).max(50).default(0),
  durationMinutes: z.number().int().min(0).max(100000).nullable().default(null),
  eurouteScore: z.number().int().min(0).max(100).nullable().default(null),
  searchParams: z.record(z.string(), z.unknown()).default({}),
});

export const listMyTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_trips")
      .select(
        "id, title, from_name, to_name, depart_at, arrive_at, share_slug, is_shared, created_at, travel_style, is_overnight, overnight_cities, travel_days, changes, duration_minutes, euroute_score",
      )
      .order("depart_at", { ascending: true, nullsFirst: false });
    if (error) throw dbError(error, "trips");

    const trips = data ?? [];
    if (trips.length === 0) return [];

    const { data: bookings, error: bookingError } = await context.supabase
      .from("trip_segment_bookings")
      .select("trip_id, segment_key, booked")
      .in(
        "trip_id",
        trips.map((trip) => trip.id),
      );
    if (bookingError) throw dbError(bookingError, "trips");

    const bookedByTrip = new Map<string, number>();
    for (const row of bookings ?? []) {
      if (!row.booked) continue;
      bookedByTrip.set(row.trip_id, (bookedByTrip.get(row.trip_id) ?? 0) + 1);
    }

    return trips.map((trip) => ({ ...trip, bookedSegments: bookedByTrip.get(trip.id) ?? 0 }));
  });

export const saveTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TripInput.parse(input))
  .handler(async ({ data, context }) => {
    // Guard against accidental double clicks: an identical itinerary (same
    // route, departure, style and length) saved by the same user is returned
    // as-is instead of creating a second record. Distinct itineraries – other
    // departure time, style, date or overnight plan – still save normally.
    let duplicateQuery = context.supabase
      .from("saved_trips")
      .select("id, share_slug")
      .eq("from_name", data.fromName)
      .eq("to_name", data.toName)
      .eq("travel_style", data.travelStyle)
      .eq("travel_days", data.travelDays);
    duplicateQuery = data.departAt
      ? duplicateQuery.eq("depart_at", data.departAt)
      : duplicateQuery.is("depart_at", null);
    duplicateQuery = data.arriveAt
      ? duplicateQuery.eq("arrive_at", data.arriveAt)
      : duplicateQuery.is("arrive_at", null);
    const { data: existing } = await duplicateQuery.limit(1).maybeSingle();
    if (existing) return { ...existing, duplicate: true };


    const { data: row, error } = await context.supabase
      .from("saved_trips")
      .insert({
        user_id: context.userId,
        title: data.title,
        from_name: data.fromName,
        to_name: data.toName,
        depart_at: data.departAt,
        arrive_at: data.arriveAt,
        itinerary: data.itinerary as never,
        ai_note: data.aiNote,
        travel_style: data.travelStyle,
        is_overnight: data.isOvernight,
        overnight_cities: data.overnightCities,
        travel_days: data.travelDays,
        changes: data.changes,
        duration_minutes: data.durationMinutes,
        euroute_score: data.eurouteScore,
        search_params: data.searchParams as never,
      })
      .select("id, share_slug")
      .single();
    if (error) throw dbError(error, "trips");
    return { ...row, duplicate: false };
  });

export const deleteTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_trips").delete().eq("id", data.id);
    if (error) throw dbError(error, "trips");
    return { ok: true };
  });

export const setTripShared = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), isShared: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("saved_trips")
      .update({ is_shared: data.isShared })
      .eq("id", data.id)
      .select("id, share_slug, is_shared")
      .single();
    if (error) throw dbError(error, "trips");
    return row;
  });

/** Full trip plus per-segment booking status, for the trip detail page. */
export const getTripById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: trip, error } = await context.supabase
      .from("saved_trips")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw dbError(error, "trips");
    if (!trip) return { trip: null, bookings: [] };

    const { data: bookings, error: bookingError } = await context.supabase
      .from("trip_segment_bookings")
      .select("segment_key, booked, booked_at, reference")
      .eq("trip_id", trip.id);
    if (bookingError) throw dbError(bookingError, "trips");

    return { trip, bookings: bookings ?? [] };
  });

export const getMyTrip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(64) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("saved_trips")
      .select("*")
      .eq("share_slug", data.slug)
      .maybeSingle();
    if (error) throw dbError(error, "trips");
    return row;
  });

export const updateTripDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().trim().min(1).max(120).optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    if (data.title !== undefined) patch["title"] = data.title;
    if (data.notes !== undefined) patch["notes"] = data.notes;
    const { error } = await context.supabase
      .from("saved_trips")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw dbError(error, "trips");
    return { ok: true };
  });

/** Marks a bookable segment as booked (or not booked again). */
export const setSegmentBooked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        tripId: z.string().uuid(),
        segmentKey: z.string().min(1).max(40),
        booked: z.boolean(),
        reference: z.string().max(120).nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    // Ownership is derived from the session, never from the payload: the trip
    // must exist and belong to the caller before any booking row is written.
    const { data: trip, error: tripError } = await context.supabase
      .from("saved_trips")
      .select("id")
      .eq("id", data.tripId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (tripError) throw dbError(tripError, "trips");
    if (!trip) throw new Response("Forbidden", { status: 403 });

    const { error } = await context.supabase.from("trip_segment_bookings").upsert(
      {
        trip_id: data.tripId,
        user_id: context.userId,
        segment_key: data.segmentKey,
        booked: data.booked,
        booked_at: data.booked ? new Date().toISOString() : null,
        reference: data.reference,
      },
      { onConflict: "user_id,trip_id,segment_key" },
    );
    if (error) throw dbError(error, "trips");
    return { ok: true };
  });

/**
 * Publik läsning av en delad resa – ingen inloggning krävs. The slug works as
 * an unlisted capability link: the database function only returns the single
 * row with that exact slug, and only journey fields.
 */
export const getSharedTrip = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(12).max(64) }).parse(input),
  )
  .handler(async ({ data }) => fetchSharedTrip(data.slug));

/**
 * Outbound booking clicks. Works for signed-out visitors too, but the browser
 * never writes to the database directly: this handler validates the event,
 * derives the identity from the session (never from the payload), applies
 * dedup plus rate limiting, and stamps the time server-side.
 */
export const trackBookingClick = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        tripId: z.string().uuid().nullable().default(null),
        segmentKey: z.string().max(40).nullable().default(null),
        operator: z.string().max(160).nullable().default(null),
        fromName: z.string().max(200).nullable().default(null),
        toName: z.string().max(200).nullable().default(null),
        departAt: z.string().datetime({ offset: true }).nullable().default(null),
        target: z.enum(["planner", "operator", "retailer"]),
        travelStyle: z
          .enum(["recommended", "fastest", "comfortable", "scenic", "cheapest"])
          .nullable()
          .default(null),
        isOvernight: z.boolean().default(false),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const [{ clientKey }, { getRequestHeader }] = await Promise.all([
      import("./abuse.server"),
      import("@tanstack/react-start/server"),
    ]);
    const userId = await userIdFromBearer(getRequestHeader("authorization"));
    const outcome = await logBookingClick(data, {
      clientHash: await clientKey(),
      userId,
    });
    return { ok: outcome === "recorded", outcome };
  });
