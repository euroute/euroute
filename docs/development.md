# Development and deployment

## Prerequisites

- [Bun](https://bun.sh) 1.3 or newer — the canonical package manager for this
  repository. `bun.lock` is the committed lockfile.
- Node.js 20+ works as an alternative runtime for tooling; if you use npm,
  `npm install` resolves from the public npm registry, and you should not commit
  a generated `package-lock.json`.
- A Supabase project (Postgres + auth). Euroute cannot run without one; saved
  trips, sharing and accounts all depend on it.
- No key, token or account is needed for journey data: the public
  [Transitous](https://transitous.org/) service requires no API key.

## Setup

```sh
git clone <this-repository-url>
cd euroute
bun install
cp .env.example .env   # fill in your own values
bun run dev
```

The dev server listens on <http://localhost:8080>.

`.env` is gitignored and must stay that way. `.env.example` documents every
variable with placeholder values only.

## Supabase setup

1. Create a project and note its URL, project reference and publishable
   (anon) key.
2. Apply every file in `supabase/migrations/` in filename order. They create the
   tables, row-level-security policies, grants and helper functions the app
   expects; do not edit a migration that has already been applied.
3. Enable the auth providers you want. Email sign-in is enough for local work.

## Environment variables

Client-visible, inlined into the browser bundle by Vite (public by design):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-side copies of the same public values:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`

Server-only secrets — never prefix these with `VITE_`:

- `SUPABASE_SERVICE_ROLE_KEY` — privileged database access; bypasses row-level
  security.
- `EUROUTE_RATE_LIMIT_SALT` — salt for pseudonymous rate-limit keys. Generate a
  fresh value, e.g. `openssl rand -hex 32`. If unset, an ephemeral per-instance
  value is used and rate limiting degrades to per-instance scope.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Development server on port 8080 |
| `bun run test` | Vitest unit and logic test suite |
| `bun run lint` | ESLint across the repository |
| `bun run format` | Prettier write |
| `bun run build` | Production build |
| `bun run build:dev` | Production build in development mode |
| `bun run preview` | Serve a built bundle locally |

TypeScript is checked as part of the build; `bunx tsc --noEmit` runs it on its
own.

## Upstream routing provider

Euroute calls `https://api.transitous.org` from `src/lib/rail.server.ts` only,
identifying itself with a `User-Agent` of the form
`Euroute/<version> (https://euroute.app; …)`. Keep that version aligned with the
`version` field in `package.json` as releases advance.

The public Transitous instance is a community resource. Local development
inherits the same caches (6 h geocoding, 90 s journey plans), per-search call
budget and rate limiting — do not remove them to iterate faster, and do not run
load tests against the public instance. For heavy work, run your own MOTIS
instance and point the module at it.

## Production deployment

Euroute builds to an edge/worker runtime target via Vite. At a high level:

1. `bun install --frozen-lockfile`
2. `bun run build`
3. Deploy the build output to the edge/worker host.
4. Provide the environment variables above through the host's configuration.
   Server-only secrets must be configured as secrets, never committed and never
   exposed to the client.

The official hosted deployment is <https://euroute.app>. Its infrastructure
configuration and credentials are not part of this repository.

## Platform files

This repository is developed with [Lovable](https://lovable.dev). `AGENTS.md`,
`.lovable/project.json`, `bunfig.toml` and the generated modules under
`src/integrations/` are required by that platform and the build, so they stay in
the repository even though they are not useful for an external fork. They do not
contain credentials.
