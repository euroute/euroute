CREATE TABLE IF NOT EXISTS public.travel_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  travel_style TEXT NOT NULL DEFAULT 'recommended',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_preferences TO authenticated;
GRANT ALL ON public.travel_preferences TO service_role;

ALTER TABLE public.travel_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own travel preferences" ON public.travel_preferences;
CREATE POLICY "Users can manage their own travel preferences"
ON public.travel_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_travel_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_travel_preferences_updated_at ON public.travel_preferences;
CREATE TRIGGER update_travel_preferences_updated_at
BEFORE UPDATE ON public.travel_preferences
FOR EACH ROW EXECUTE FUNCTION public.touch_travel_preferences();