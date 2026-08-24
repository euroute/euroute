// Server-only: public reads of shared trips and server-side booking-click logging.
//
// Security model (Pre-Launch Fix 1):
// - Anonymous clients have NO table access to saved_trips. A shared trip is
//   fetched through the SECURITY DEFINER function public.get_shared_trip(slug),
//   which requires the exact high-entropy share slug and returns only an
//   allowlist of journey fields. Private notes, user_id and search_params are
//   never part of the result.
// - booking_clicks can no longer be written from the browser. Rows are inserted
//   here with the service role, after validation, dedup and rate limiting.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { TripPlan } from "./trip-plan";

import { rateLimit } from "./abuse.server";

function publishableClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export type SharedTripView = {
  share_slug: string;
  title: string | null;
  from_name: string;
  to_name: string;
  depart_at: string | null;
  arrive_at: string | null;
  travel_style: string;
  travel_days: number;
  is_overnight: boolean;
  overnight_cities: string[];
  changes: number;
  duration_minutes: number | null;
  /** Snapshot of the plan exactly as it looked when the traveller saved it. */
  itinerary: TripPlan;
  ai_note: string | null;
  created_at: string;
};

/**
 * Reads one shared trip by its capability slug. Anything shorter than a real
 * slug is rejected server-side before the database is touched, and listing is
 * impossible: the function only ever returns the single matching row.
 */
export async function fetchSharedTrip(slug: string): Promise<SharedTripView | null> {
  if (!/^[a-f0-9]{12,64}$/i.test(slug)) return null;

  const supabase = publishableClient();
  const { data, error } = await supabase.rpc("get_shared_trip", { p_slug: slug });

  if (error) {
    console.error("shared trip read failed", error.message);
    return null;
  }
  const row = (data as SharedTripView[] | null)?.[0];
  return row ?? null;
}

export type BookingClickInput = {
  tripId: string | null;
  segmentKey: string | null;
  operator: string | null;
  fromName: string | null;
  toName: string | null;
  departAt: string | null;
  target: string;
  travelStyle: string | null;
  isOvernight: boolean;
};

/** Per-isolate memory of the most recent click signature per client. */
const lastClick = new Map<string, number>();
const DEDUP_WINDOW_MS = 10_000;
const CLICK_LIMIT_PER_MINUTE = 30;

export type BookingClickOutcome = "recorded" | "duplicate" | "rate_limited";

/**
 * Records that someone left Euroute to book a segment. Guests are welcome –
 * the row simply has no user. Never blocks or delays the outbound click.
 */
export async function logBookingClick(
  input: BookingClickInput,
  meta: { clientHash: string; userId: string | null },
): Promise<BookingClickOutcome> {
  const limit = rateLimit("booking-click", meta.clientHash, CLICK_LIMIT_PER_MINUTE, 60_000);
  if (!limit.ok) return "rate_limited";

  // One click = one event: an immediate repeat of the same signature (rerender,
  // double click, retry) is suppressed for a short window.
  const signature = `${meta.clientHash}|${input.tripId ?? ""}|${input.segmentKey ?? ""}|${input.target}|${input.operator ?? ""}`;
  const now = Date.now();
  const previous = lastClick.get(signature);
  if (previous && now - previous < DEDUP_WINDOW_MS) return "duplicate";
  lastClick.set(signature, now);
  if (lastClick.size > 5000) {
    for (const [k, v] of lastClick) if (now - v > DEDUP_WINDOW_MS) lastClick.delete(k);
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("booking_clicks").insert({
    user_id: meta.userId,
    trip_id: input.tripId,
    segment_key: input.segmentKey,
    operator: input.operator,
    from_name: input.fromName,
    to_name: input.toName,
    depart_at: input.departAt,
    target: input.target,
    travel_style: input.travelStyle,
    is_overnight: input.isOvernight,
    client_hash: meta.clientHash,
    // Server-generated timestamp; the client never supplies one.
    created_at: new Date().toISOString(),
  });

  if (error) console.error("booking click log failed", error.message);
  return "recorded";
}

/**
 * Resolves the signed-in user from the request's bearer token, when present.
 * Guests simply get null – client-supplied user ids are never trusted.
 */
export async function userIdFromBearer(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (token.split(".").length !== 3) return null;

  try {
    const { data, error } = await publishableClient().auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return String(data.claims.sub);
  } catch {
    return null;
  }
}
