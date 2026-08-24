-- Raise shared-trip slug entropy from 64 bits (8 random bytes) to 128 bits
-- (16 random bytes, hex-encoded => 32 chars). gen_random_bytes is a CSPRNG.
-- Existing shorter slugs keep working: the unique constraint, get_shared_trip
-- and the app-side validators all accept 12-64 hex chars.
ALTER TABLE public.saved_trips
  ALTER COLUMN share_slug SET DEFAULT encode(gen_random_bytes(16), 'hex');