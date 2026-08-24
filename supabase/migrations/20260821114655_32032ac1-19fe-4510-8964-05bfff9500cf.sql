-- Remove data the app no longer uses.
DROP TABLE IF EXISTS public.recent_searches;

-- profiles is still created automatically for every new account, but the
-- free-form preferences blob is unused: travel preferences live in
-- public.travel_preferences.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS preferences;