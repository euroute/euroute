-- ============ FIX 1: shared trips ============
DROP POLICY IF EXISTS "Shared trips are public" ON public.saved_trips;
REVOKE ALL ON public.saved_trips FROM anon;

CREATE OR REPLACE FUNCTION public.get_shared_trip(p_slug text)
RETURNS TABLE (
  share_slug text,
  title text,
  from_name text,
  to_name text,
  depart_at timestamptz,
  arrive_at timestamptz,
  travel_style text,
  travel_days integer,
  is_overnight boolean,
  overnight_cities text[],
  changes integer,
  duration_minutes integer,
  itinerary jsonb,
  ai_note text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.share_slug,
    t.title,
    t.from_name,
    t.to_name,
    t.depart_at,
    t.arrive_at,
    t.travel_style,
    t.travel_days,
    t.is_overnight,
    t.overnight_cities,
    t.changes,
    t.duration_minutes,
    t.itinerary,
    t.ai_note,
    t.created_at
  FROM public.saved_trips t
  WHERE t.is_shared = true
    AND length(coalesce(p_slug, '')) >= 12
    AND t.share_slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_shared_trip(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_trip(text) TO anon, authenticated, service_role;

-- ============ FIX 2: booking clicks ============
DROP POLICY IF EXISTS "Anyone can log a booking click" ON public.booking_clicks;
REVOKE INSERT, UPDATE, DELETE ON public.booking_clicks FROM anon, authenticated;
REVOKE ALL ON public.booking_clicks FROM anon;
GRANT SELECT ON public.booking_clicks TO authenticated;
GRANT ALL ON public.booking_clicks TO service_role;

ALTER TABLE public.booking_clicks
  ADD COLUMN IF NOT EXISTS client_hash text;

CREATE INDEX IF NOT EXISTS booking_clicks_client_recent_idx
  ON public.booking_clicks (client_hash, created_at DESC);