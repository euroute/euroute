-- Scope uniqueness per user so one user's row can never block another's
ALTER TABLE public.trip_segment_bookings
  DROP CONSTRAINT IF EXISTS trip_segment_bookings_trip_id_segment_key_key;

DROP INDEX IF EXISTS public.trip_segment_bookings_trip_id_segment_key_idx;

CREATE UNIQUE INDEX IF NOT EXISTS trip_segment_bookings_user_trip_segment_key
  ON public.trip_segment_bookings (user_id, trip_id, segment_key);

-- Require that the referenced trip is owned by the same user
DROP POLICY IF EXISTS "Users manage own segment bookings" ON public.trip_segment_bookings;

CREATE POLICY "Users manage own segment bookings"
ON public.trip_segment_bookings
FOR ALL
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.saved_trips t
    WHERE t.id = trip_segment_bookings.trip_id
      AND t.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.saved_trips t
    WHERE t.id = trip_segment_bookings.trip_id
      AND t.user_id = auth.uid()
  )
);