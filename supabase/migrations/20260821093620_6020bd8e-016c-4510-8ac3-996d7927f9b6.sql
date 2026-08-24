ALTER TABLE public.saved_trips
  ADD COLUMN IF NOT EXISTS arrive_at timestamptz,
  ADD COLUMN IF NOT EXISTS travel_style text NOT NULL DEFAULT 'recommended',
  ADD COLUMN IF NOT EXISTS is_overnight boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS overnight_cities text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS travel_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS changes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS euroute_score integer,
  ADD COLUMN IF NOT EXISTS search_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS public.trip_segment_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.saved_trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_key text NOT NULL,
  booked boolean NOT NULL DEFAULT false,
  booked_at timestamptz,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, segment_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_segment_bookings TO authenticated;
GRANT ALL ON public.trip_segment_bookings TO service_role;

ALTER TABLE public.trip_segment_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own segment bookings"
  ON public.trip_segment_bookings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trip_segment_bookings_updated_at
  BEFORE UPDATE ON public.trip_segment_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.booking_clicks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES public.saved_trips(id) ON DELETE SET NULL,
  segment_key text,
  operator text,
  from_name text,
  to_name text,
  depart_at timestamptz,
  target text,
  travel_style text,
  is_overnight boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.booking_clicks TO anon;
GRANT SELECT, INSERT ON public.booking_clicks TO authenticated;
GRANT ALL ON public.booking_clicks TO service_role;

ALTER TABLE public.booking_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a booking click"
  ON public.booking_clicks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own booking clicks"
  ON public.booking_clicks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS booking_clicks_trip_idx ON public.booking_clicks (trip_id);
CREATE INDEX IF NOT EXISTS trip_segment_bookings_trip_idx ON public.trip_segment_bookings (trip_id);