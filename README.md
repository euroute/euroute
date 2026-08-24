# Euroute

Euroute is an open-source European rail journey planner. You enter where you
want to travel from and to — optionally with a station you want to change at —
and Euroute searches across operators and presents complete journeys as a single
timeline, instead of making you check SJ, DSB, DB and others one at a time.

**Euroute does not sell train tickets.** It has no checkout, no cart and no
ticket inventory. For each leg of a journey, Euroute provides booking links that
take you to external train operators or booking providers, where the actual
purchase happens. Euroute never confirms that a ticket exists or has been
bought; a leg in a plan is a train, not a ticket.

The interface is available in Swedish and English.

## Features

- Multi-operator journey search with optional via-station
- Travel styles: Recommended, Fastest, Comfortable, Scenic, Cheapest
- Journey preferences: minimum connection time, maximum changes, avoid night
  trains / buses / station changes
- Euroute Score — a deterministic 0–100 rating of a journey (duration, changes,
  connection risk, simplicity, preference fit)
- Connection risk labels per transfer (comfortable / tight / risky)
- Smart Overnight — suggests splitting very long journeys across travel days,
  with stopover cities and a rest-window assessment
- Accounts: save trips as snapshots, per-leg booking checklist, shareable
  read-only trip links (private notes are never shared)
- GDPR data export and account deletion

## Data sources

Routing, timetables and station search currently use
[Transitous](https://transitous.org/), a free and community-run public-transport
routing service (MOTIS). Euroute sends no credentials and stores no upstream
data beyond short-lived caches.

- Transitous: <https://transitous.org/>
- Transitous data sources and their individual terms:
  <https://transitous.org/sources/>
- Station and place geodata comes from OpenStreetMap:
  © OpenStreetMap contributors, licensed under
  [ODbL](https://www.openstreetmap.org/copyright)

The public Transitous instance is intended for open, non-abusive use and is not
licensed as a commercial backend. Timetable feeds carry their own operator
terms. If you run your own instance, review every source you rely on and keep
the attribution in the footer.

Euroute keeps the data layer behind `src/lib/rail.server.ts`, so the upstream
provider can be replaced with a self-hosted MOTIS instance or a licensed feed.

## Tech stack

- TanStack Start (React 19, TanStack Router) with server functions
- Vite 7 build, deployed to an edge/worker runtime
- Tailwind CSS v4, shadcn/ui components
- Supabase (Postgres with row-level security, auth) for accounts and saved trips

## Local development

Requirements: [Bun](https://bun.sh) (recommended, matches the production
lockfile) or Node.js 20+ with npm.

```sh
git clone <this-repository-url>
cd euroute
bun install
cp .env.example .env   # fill in your own values
bun run dev
```

The dev server runs on <http://localhost:8080>.

Useful scripts: `bun run build`, `bun run lint`, `bun run format`.

You need your own Supabase project. Apply the migrations in
`supabase/migrations/` in order to get the schema, row-level-security policies
and grants.

## Environment variables

Names only — never commit real values. Use `.env.example` as the template and
keep `.env` untracked.

Client-visible (inlined into the browser bundle by Vite; public by design):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-side copies of the same public values:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`

Server-only secrets — must never be prefixed with `VITE_`:

- `SUPABASE_SERVICE_ROLE_KEY` — privileged database access, bypasses
  row-level security
- `EUROUTE_RATE_LIMIT_SALT` — salt for the pseudonymous rate-limit client key.
  Generate a fresh random value, e.g. `openssl rand -hex 32`. If unset, a
  random per-instance value is used and rate limiting degrades to per-instance
  scope.

## Licence

Euroute's source code is licensed under the **GNU Affero General Public
License v3.0 only** — SPDX: `AGPL-3.0-only`. See [`LICENSE`](LICENSE).

Third-party dependency licences and required attributions are listed in
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

Data returned by Transitous, its underlying operator feeds and OpenStreetMap is
covered by its own terms, not by this licence.

### Name and branding

The licence covers code, not brand. The Euroute name, logo, favicon and visual
identity are not licensed for reuse. Forks and derivative deployments must use a
different name and mark, and must not imply endorsement by or affiliation with
Euroute. See [`TRADEMARKS.md`](TRADEMARKS.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).
