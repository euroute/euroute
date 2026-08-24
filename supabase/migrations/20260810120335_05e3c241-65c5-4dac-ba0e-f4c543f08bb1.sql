CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.saved_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_slug TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_shared BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  from_name TEXT NOT NULL,
  to_name TEXT NOT NULL,
  depart_at TIMESTAMPTZ,
  itinerary JSONB NOT NULL,
  ai_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_trips TO authenticated;
GRANT SELECT ON public.saved_trips TO anon;
GRANT ALL ON public.saved_trips TO service_role;
ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trips" ON public.saved_trips FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Shared trips are public" ON public.saved_trips FOR SELECT TO anon USING (is_shared = true);
CREATE INDEX saved_trips_user_idx ON public.saved_trips(user_id, created_at DESC);

CREATE TABLE public.recent_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_name TEXT NOT NULL,
  from_place TEXT NOT NULL,
  to_name TEXT NOT NULL,
  to_place TEXT NOT NULL,
  via JSONB NOT NULL DEFAULT '[]'::jsonb,
  depart_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recent_searches TO authenticated;
GRANT ALL ON public.recent_searches TO service_role;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own searches" ON public.recent_searches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX recent_searches_user_idx ON public.recent_searches(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER saved_trips_updated_at BEFORE UPDATE ON public.saved_trips FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();