# Euroute architecture

A high-level map of how Euroute fits together. It describes structure and
boundaries, not deployment specifics or credentials.

## Request flow

```text
Browser (React 19, TanStack Router)
   |
   |  server functions (RPC) / route loaders
   v
Euroute server layer  (TanStack Start, edge/worker runtime)
   |                        |
   |  supabase-js           |  HTTPS, no credentials
   v                        v
Supabase                Transitous / MOTIS
(Postgres + RLS, auth)  (routing, timetables, geocoding)
```

The browser never talks to Transitous. Every upstream routing call originates in
the server layer, so the client cannot bypass caching, budgets or validation.

## Client / server boundary

- Server-only modules use the `*.server.ts` suffix (`src/lib/rail.server.ts`,
  `src/lib/abuse.server.ts`). They are excluded from the client bundle and are
  never imported by components.
- Client-callable entry points are `createServerFn` definitions in
  `*.functions.ts` modules. They validate their input with Zod schemas before
  anything reaches the upstream provider or the database.
- Anything read from `process.env` is server-side. Browser configuration comes
  from `import.meta.env.VITE_*` and is public by design.

## Transitous / MOTIS integration

- Single upstream boundary: `src/lib/rail.server.ts` handles geocoding, stop
  lookup and journey planning against `https://api.transitous.org`.
- No API key or credential is sent. Requests carry a descriptive `User-Agent`
  identifying Euroute and its site so upstream operators can contact the
  project.
- Responses are used to build journeys and are not stored beyond short-lived
  caches. Saved trips are snapshots created by the user, not a mirror of
  upstream data.
- Because the provider is isolated behind this one module, it can be replaced
  with a self-hosted MOTIS instance or a licensed feed without touching the UI.

## Caching, budgets and rate limiting

- Geocoding and stop lookups are cached for 6 hours; journey plans for 90
  seconds, because they carry real-time data.
- A per-search upstream call budget (24 calls within a 3-minute window) bounds
  how much load a single search can create, even with multiple departures and
  optional stopovers.
- Rate-limit client keys are pseudonymous: a salted hash of request metadata,
  using the server-only `EUROUTE_RATE_LIMIT_SALT`. No raw IP address is stored.
- Journey candidate counts and search horizons are capped in
  `src/lib/journey-limits.ts` and `src/lib/departure-horizon.ts`.

## Authentication

- Supabase auth. Signed-in areas live under `src/routes/_authenticated/`, whose
  layout route redirects unauthenticated visitors to `/auth`.
- Server functions that touch user data run behind auth middleware and resolve
  the acting user from the verified session, never from client-supplied input.
- Anonymous journey search requires no account.

## Saved and shared trips

- A saved trip is an immutable snapshot of a search result, so a plan a user
  saved does not silently change when timetables do.
- Per-leg booking state is a checklist owned by the user. Euroute sells no
  tickets and never records a purchase as confirmed.
- Sharing produces a read-only link keyed by a high-entropy slug, served through
  a `SECURITY DEFINER` database function that exposes only the shareable fields.
  Private notes are excluded from shared views.

## Database and row-level security

- Schema and policies live in `supabase/migrations/`, applied in filename order.
- Every application table has row-level security enabled, explicit policies, and
  explicit grants to the roles those policies allow. User-owned rows are scoped
  by the authenticated user id.
- Privileged access is limited to narrow server-side operations; ordinary reads
  and writes go through the user's own session so policies apply.

## Where things live

| Path | Contents |
| --- | --- |
| `src/routes/` | Pages and API/server routes (file-based routing) |
| `src/routes/_authenticated/` | Signed-in areas: saved trips, trip detail, account |
| `src/components/` | UI components; `src/components/ui/` is shadcn/ui-derived |
| `src/lib/` | Domain logic: journeys, scoring, overnight, stations, i18n |
| `src/lib/*.server.ts` | Server-only logic, including the upstream provider |
| `src/integrations/` | Generated backend and platform clients |
| `supabase/migrations/` | Database schema, policies and grants |
| `openapi.yaml` | Vendored MOTIS API specification (reference only, MIT) |
| `docs/` | This documentation |

## Internationalisation

All user-facing copy goes through `src/lib/i18n.tsx`, with Swedish and English
translations kept in step. Swedish is the default; a language switcher is in the
header.
